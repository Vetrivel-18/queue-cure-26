import datetime
from sqlalchemy import Column, Integer, String, DateTime
from .database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    token_number = Column(Integer, unique=True, index=True, nullable=False)
    status = Column(String, default="waiting", nullable=False) # waiting, called, completed, skipped
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    called_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

class ClinicSettings(Base):
    __tablename__ = "clinic_settings"

    id = Column(Integer, primary_key=True, index=True)
    avg_consultation_time = Column(Integer, default=10, nullable=False) # in minutes
