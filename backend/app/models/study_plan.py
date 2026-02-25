# app/models/study_plan.py
from sqlalchemy import Column, String, Float, ForeignKey, JSON, Date
from .base import Base

class ReadinessScore(Base):
    __tablename__ = "readiness_scores"

    user_id = Column(String(32), ForeignKey("users.id"), unique=True)
    
    total_score = Column(Float, default=0.0) # 0-100
    
    # Breakdown percentages
    streak_weight = Column(Float, default=0.0)      # 20%
    evaluation_weight = Column(Float, default=0.0)  # 30%
    dsa_weight = Column(Float, default=0.0)         # 20%
    ats_weight = Column(Float, default=0.0)         # 15%
    mock_weight = Column(Float, default=0.0)        # 15%
    
    breakdown = Column(JSON, nullable=True) # Detailed stats

class StudyPlan(Base):
    __tablename__ = "study_plans"

    user_id = Column(String(32), ForeignKey("users.id"))
    role = Column(String(100), nullable=False)
    target_date = Column(Date, nullable=False)
    weak_areas = Column(JSON, nullable=True)
    plan = Column(JSON, nullable=True)
