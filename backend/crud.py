import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas

def get_clinic_settings(db: Session) -> models.ClinicSettings:
    settings = db.query(models.ClinicSettings).first()
    if not settings:
        settings = models.ClinicSettings(avg_consultation_time=10)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def update_clinic_settings(db: Session, avg_time: int) -> models.ClinicSettings:
    settings = get_clinic_settings(db)
    settings.avg_consultation_time = avg_time
    db.commit()
    db.refresh(settings)
    return settings

def get_patients(db: Session):
    # Return patients sorted by created time or token number
    return db.query(models.Patient).order_by(models.Patient.token_number).all()

def add_patient(db: Session, patient_in: schemas.PatientCreate) -> models.Patient:
    # Safe auto-incrementing token generator starting at 101
    today = datetime.date.today()
    start_of_day = datetime.datetime.combine(today, datetime.time.min)
    
    max_token = db.query(func.max(models.Patient.token_number))\
        .filter(models.Patient.created_at >= start_of_day)\
        .scalar()
    
    next_token = (max_token + 1) if max_token else 101

    new_patient = models.Patient(
        name=patient_in.name,
        phone_number=patient_in.phone_number,
        token_number=next_token,
        status="waiting"
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient

def call_next_patient(db: Session) -> tuple[models.Patient, list[models.Patient]]:
    # 1. Complete previous active patients
    active_patients = db.query(models.Patient).filter(models.Patient.status == "called").all()
    for ap in active_patients:
        ap.status = "completed"
        ap.completed_at = datetime.datetime.utcnow()
    
    # 2. Grab the first waiting patient
    next_patient = db.query(models.Patient)\
        .filter(models.Patient.status == "waiting")\
        .order_by(models.Patient.token_number)\
        .first()

    if next_patient:
        next_patient.status = "called"
        next_patient.called_at = datetime.datetime.utcnow()
        db.commit()
        return next_patient, active_patients
    
    db.commit()
    return None, active_patients

def skip_patient(db: Session, patient_id: int) -> models.Patient:
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if patient:
        patient.status = "skipped"
        db.commit()
        db.refresh(patient)
    return patient

def complete_patient(db: Session, patient_id: int) -> models.Patient:
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if patient:
        patient.status = "completed"
        patient.completed_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(patient)
    return patient

def reset_entire_queue(db: Session):
    db.query(models.Patient).delete()
    db.commit()

def calculate_analytics(db: Session) -> dict:
    today = datetime.date.today()
    start_of_day = datetime.datetime.combine(today, datetime.time.min)
    
    total_patients_today = db.query(models.Patient)\
        .filter(models.Patient.created_at >= start_of_day)\
        .count()
        
    current_queue_length = db.query(models.Patient)\
        .filter(models.Patient.status == "waiting")\
        .count()

    # Calculate average waiting time from completed consultations
    settings = get_clinic_settings(db)
    completed = db.query(models.Patient)\
        .filter(models.Patient.status == "completed")\
        .filter(models.Patient.called_at.is_not(None))\
        .filter(models.Patient.created_at >= start_of_day)\
        .all()

    avg_wait = settings.avg_consultation_time
    if completed:
        total_wait_min = 0
        for p in completed:
            wait_time = (p.called_at - p.created_at).total_seconds() / 60.0
            total_wait_min += wait_time
        avg_wait = int(total_wait_min / len(completed))
        if avg_wait <= 0:
            avg_wait = settings.avg_consultation_time

    return {
        "total_patients_today": total_patients_today,
        "current_queue_length": current_queue_length,
        "avg_waiting_time": avg_wait
    }

def get_current_called_token(db: Session):
    active = db.query(models.Patient).filter(models.Patient.status == "called").first()
    return active.token_number if active else None

def get_next_waiting_token(db: Session):
    next_p = db.query(models.Patient)\
        .filter(models.Patient.status == "waiting")\
        .order_by(models.Patient.token_number)\
        .first()
    return next_p.token_number if next_p else None

def compile_full_queue_state(db: Session) -> dict:
    patients = get_patients(db)
    settings = get_clinic_settings(db)
    stats = calculate_analytics(db)
    current_token = get_current_called_token(db)
    next_token = get_next_waiting_token(db)
    
    return {
        "patients": [p.__dict__ for p in patients],
        "settings": {
            "avg_consultation_time": settings.avg_consultation_time
        },
        "stats": stats,
        "current_token": current_token,
        "next_token": next_token
    }
