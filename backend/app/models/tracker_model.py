# app/models/tracker_model.py
import uuid
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base
import enum

def _uuid():
    return uuid.uuid4().hex

class ApplicationStatus(str, enum.Enum):
    APPLIED   = "Applied"
    OA        = "Online Assessment"
    TECHNICAL = "Technical Interview"
    HR        = "HR Interview"
    OFFER     = "Offer"
    REJECTED  = "Rejected"

class JobApplication(Base):
    __tablename__ = "job_applications"

    id          = Column(String(32), primary_key=True, default=_uuid)
    user_id     = Column(String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    company     = Column(String(100), nullable=False)
    role        = Column(String(100), nullable=False)
    status      = Column(String(30),  default=ApplicationStatus.APPLIED, index=True)
    
    applied_date = Column(DateTime(timezone=True), server_default=func.now())
    last_update  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    notes        = Column(String(500), nullable=True)
