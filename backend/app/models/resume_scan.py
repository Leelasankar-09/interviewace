# app/models/resume_scan.py
from sqlalchemy import Column, String, ForeignKey, Text, Float, JSON
from .base import Base

class ResumeScan(Base):
    __tablename__ = "resume_scans"

    user_id = Column(String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    file_url = Column(Text, nullable=False)
    ats_score = Column(Float, default=0.0)
    sections = Column(JSON, nullable=True)
    keyword_gaps = Column(JSON, nullable=True)
    overall_suggestions = Column(JSON, nullable=True)
    job_description = Column(Text, nullable=True)
