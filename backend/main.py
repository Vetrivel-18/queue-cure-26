from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import json

from .database import engine, get_db, Base
from . import models, schemas, crud, websocket_manager

# Bootstrap the SQLite/PostgreSQL schemas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Queue Cure '26 API",
    description="Real-time Clinic Queue Management System Backend Core Service",
    version="1.0.0"
)

# Apply CORS policies for multi-host and deployment environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def broadcast_full_state(db: Session, alert_text: str = None, alert_type: str = "success"):
    """
    Helper function to broadcast updated queue state and alerts to all active WebSockets
    """
    full_state = crud.compile_full_queue_state(db)
    
    # Broadcast state
    await websocket_manager.manager.broadcast({
        "type": "QUEUE_UPDATED",
        "payload": {
            "patients": json.loads(json.dumps(full_state["patients"], default=str)),
            "stats": full_state["stats"],
            "currentToken": full_state["current_token"],
            "nextToken": full_state["next_token"]
        }
    })
    
    # Broadcast notification if supplied
    if alert_text:
        await websocket_manager.manager.broadcast({
            "type": "NOTIFICATION",
            "payload": {
                "type": alert_type,
                "message": alert_text
            }
        })

@app.get("/api/health", status_code=status.HTTP_200_OK)
def check_health():
    return {"status": "healthy", "service": "Queue Cure '26 Database Engine"}

@app.get("/api/queue-state")
def get_queue_state(db: Session = Depends(get_db)):
    try:
        return crud.compile_full_queue_state(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database Retrieval Failure: {str(e)}")

@app.post("/api/patients", response_model=schemas.PatientResponse)
async def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    try:
        db_patient = crud.add_patient(db, patient)
        alert_msg = f"Patient {db_patient.name} registered. Token Generated: {db_patient.token_number}."
        await broadcast_full_state(db, alert_text=alert_msg, alert_type="success")
        return db_patient
    except Exception as e:
         db.rollback()
         raise HTTPException(status_code=400, detail=f"Failed to register patient: {str(e)}")

@app.post("/api/queue/next")
async def call_next_patient(db: Session = Depends(get_db)):
    try:
        next_patient, completed_list = crud.call_next_patient(db)
        if next_patient:
            alert = f"Token {next_patient.token_number} ({next_patient.name}) called to consultation counter."
            await broadcast_full_state(db, alert_text=alert, alert_type="success")
            return {"status": "success", "called_patient": next_patient}
        else:
            alert = "No patients waiting in queue."
            await broadcast_full_state(db, alert_text=alert, alert_type="warning")
            return {"status": "empty", "message": alert}
    except Exception as e:
         db.rollback()
         raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/patients/{patient_id}/skip")
async def skip_patient(patient_id: int, db: Session = Depends(get_db)):
    try:
        patient = crud.skip_patient(db, patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        alert = f"Token {patient.token_number} ({patient.name}) marked as skipped."
        await broadcast_full_state(db, alert_text=alert, alert_type="info")
        return {"status": "success", "patient": patient}
    except Exception as e:
         db.rollback()
         raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/patients/{patient_id}/complete")
async def complete_patient(patient_id: int, db: Session = Depends(get_db)):
    try:
        patient = crud.complete_patient(db, patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        alert = f"Token {patient.token_number} consultation completed successfully."
        await broadcast_full_state(db, alert_text=alert, alert_type="success")
        return {"status": "success", "patient": patient}
    except Exception as e:
         db.rollback()
         raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/queue/reset")
async def reset_queue(db: Session = Depends(get_db)):
    try:
        crud.reset_entire_queue(db)
        await broadcast_full_state(db, alert_text="The clinic queue has been cleared and reset.", alert_type="warning")
        return {"status": "success", "message": "Queue cleared"}
    except Exception as e:
         db.rollback()
         raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/settings", response_model=schemas.ClinicSettingsResponse)
async def update_settings(settings_in: schemas.ClinicSettingsBase, db: Session = Depends(get_db)):
    try:
        updated = crud.update_clinic_settings(db, settings_in.avg_consultation_time)
        
        # Broadcast settings update & recalc wait times
        full_state = crud.compile_full_queue_state(db)
        await websocket_manager.manager.broadcast({
            "type": "SETTINGS_CHANGED",
            "payload": {
                "avgConsultationTime": updated.avg_consultation_time
            }
        })
        await broadcast_full_state(db, alert_text=f"Consultation time changed to {updated.avg_consultation_time} mins.", alert_type="info")
        return updated
    except Exception as e:
         db.rollback()
         raise HTTPException(status_code=500, detail=str(e))

# Real-Time WebSocket Channel Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket_manager.manager.connect(websocket)
    
    # Send the current synchronized queue state immediately following joining
    try:
        state = crud.compile_full_queue_state(db)
        # Serialize datetime safely
        serializable_patients = json.loads(json.dumps(state["patients"], default=str))
        
        await websocket_manager.manager.send_personal_message({
            "type": "INIT_STATE",
            "payload": {
                "patients": serializable_patients,
                "settings": {
                    "avgConsultationTime": state["settings"]["avg_consultation_time"]
                },
                "stats": state["stats"],
                "currentToken": state["current_token"],
                "nextToken": state["next_token"]
            }
        }, websocket)
        
        # Connection messaging loop
        while True:
            # Continually keep Socket session open, processing client events in real-time
            data_text = await websocket.receive_text()
            data = json.loads(data_text)
            
            # Translate socket payload commands into database states
            if data["type"] == "ADD_PATIENT":
                payload = data["payload"]
                patient_create = schemas.PatientCreate(name=payload["name"], phone_number=payload["phoneNumber"])
                crud.add_patient(db, patient_create)
                await broadcast_full_state(db, alert_text=f"Patient {payload['name']} added via socket.", alert_type="success")
            
            elif data["type"] == "CALL_NEXT":
                next_patient, _ = crud.call_next_patient(db)
                alert = f"Token {next_patient.token_number} called." if next_patient else "Empty physical queue."
                await broadcast_full_state(db, alert_text=alert, alert_type="success" if next_patient else "warning")
            
            elif data["type"] == "SKIP_PATIENT":
                pid = int(data["payload"]["id"])
                p = crud.skip_patient(db, pid)
                if p:
                    await broadcast_full_state(db, alert_text=f"Token {p.token_number} skipped.", alert_type="info")
            
            elif data["type"] == "COMPLETE_PATIENT":
                pid = int(data["payload"]["id"])
                p = crud.complete_patient(db, pid)
                if p:
                    await broadcast_full_state(db, alert_text=f"Token {p.token_number} completed.", alert_type="success")
            
            elif data["type"] == "RESET_QUEUE":
                crud.reset_entire_queue(db)
                await broadcast_full_state(db, alert_text="Queue cleared and reset via socket.", alert_type="warning")
            
            elif data["type"] == "UPDATE_SETTINGS":
                avg_time = int(data["payload"]["avgConsultationTime"])
                crud.update_clinic_settings(db, avg_time)
                await websocket_manager.manager.broadcast({
                    "type": "SETTINGS_CHANGED",
                    "payload": {"avgConsultationTime": avg_time}
                })
                await broadcast_full_state(db, alert_text=f"Consultation setting changed to {avg_time} mins.", alert_type="info")
                
    except WebSocketDisconnect:
        websocket_manager.manager.disconnect(websocket)
    except Exception as e:
        print(f"WS error: {str(e)}")
        websocket_manager.manager.disconnect(websocket)
