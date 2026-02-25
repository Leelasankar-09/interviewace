# app/models/interview_tracker.py
from sqlalchemy import Column, String, ForeignKey, Date, Text
from .base import Base

class JobApplication(Base):
    __tablename__ = "interview_tracker"

    user_id = Column(String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    company = Column(String(100), nullable=False)
    role    = Column(String(100), nullable=False)
    date_applied = Column(Date, nullable=False)
    current_status = Column(String(30), default="Applied", index=True) # Applied/OA/Technical/HR/Offer/Rejected
    notes = Column(Text, nullable=True)
