# app/models/evaluation_session.py
from sqlalchemy import Column, String, Float, JSON, ForeignKey, Integer, Text
from .base import Base

class EvaluationSession(Base):
    __tablename__ = "evaluation_sessions"

    user_id = Column(String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    round_type = Column(String(50), nullable=True)
    role = Column(String(100), nullable=True)
    company = Column(String(100), nullable=True)
    difficulty = Column(String(20), nullable=True)
    eval_type = Column(String(20), nullable=True) # voice/text
    
    # 12-parameter scores
    score_relevance = Column(Float, default=0.0)
    score_star_structure = Column(Float, default=0.0)
    score_clarity = Column(Float, default=0.0)
    score_tone_confidence = Column(Float, default=0.0)
    score_depth = Column(Float, default=0.0)
    score_specificity = Column(Float, default=0.0)
    score_vocabulary = Column(Float, default=0.0)
    score_impact_results = Column(Float, default=0.0)
    score_filler_control = Column(Float, default=0.0)
    score_pacing = Column(Float, default=0.0)
    score_conciseness = Column(Float, default=0.0)
    score_enthusiasm = Column(Float, default=0.0)
    
    overall_score = Column(Float, default=0.0)
    score_band = Column(String(20), nullable=True) # Poor/Average/Good/Excellent
    suggestions = Column(JSON, nullable=True)
    sample_answer = Column(Text, nullable=True)
    power_words = Column(JSON, nullable=True)
    filler_words_detected = Column(JSON, nullable=True)
    duration_seconds = Column(Integer, default=0)
