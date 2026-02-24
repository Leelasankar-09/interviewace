# app/models/readiness_model.py
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Relationship
import datetime
from app.core.database import Base

class ReadinessScore(Base):
    __tablename__ = "readiness_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    
    total_score = Column(Float, default=0.0) # 0-100
    
    # Breakdown percentages
    streak_weight = Column(Float, default=0.0)      # 20%
    evaluation_weight = Column(Float, default=0.0)  # 30%
    dsa_weight = Column(Float, default=0.0)         # 20%
    ats_weight = Column(Float, default=0.0)         # 15%
    mock_weight = Column(Float, default=0.0)        # 15%
    
    breakdown = Column(JSON, nullable=True) # Detailed stats
    
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
