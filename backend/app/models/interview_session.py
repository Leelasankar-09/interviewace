# app/models/interview_session.py
from sqlalchemy import Column, String, Text, Float, JSON, ForeignKey, Integer, Date
from .base import Base

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    user_id = Column(String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    role = Column(String(100), nullable=True)
    company = Column(String(100), nullable=True)
    duration_seconds = Column(Integer, default=0)
    
    # Final AI Evaluation
    overall_score = Column(Float, default=0.0)
    per_category_scores = Column(JSON, nullable=True) # All 12 param scores
    conversation_history = Column(JSON, nullable=True)

class PracticeStreak(Base):
    __tablename__ = "practice_streaks"

    user_id = Column(String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    sessions = Column(Integer, default=0)
