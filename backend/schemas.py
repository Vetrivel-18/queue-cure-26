from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PatientBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, example="John Doe")
    phone_number: str = Field(..., min_length=5, max_length=15, example="555-1029")

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: int
    token_number: int
    status: str
    created_at: datetime
    called_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class ClinicSettingsBase(BaseModel):
    avg_consultation_time: int = Field(default=10, ge=1, le=120, description="Average consultation time in minutes")

class ClinicSettingsResponse(ClinicSettingsBase):
    id: int

    class Config:
        orm_mode = True

class QueueStatsResponse(BaseModel):
    total_patients_today: int
    current_queue_length: int
    avg_waiting_time: int

class QueueStateBroadcast(BaseModel):
    patients: List[PatientResponse]
    settings: ClinicSettingsBase
    stats: QueueStatsResponse
    current_token: Optional[int] = None
    next_token: Optional[int] = None
