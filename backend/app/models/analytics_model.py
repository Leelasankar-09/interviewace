"""
Analytics Model — tracks page views, feature usage, and user events.
"""
import uuid
from sqlalchemy import Column, String, Text, DateTime, JSON, Integer, Float
from sqlalchemy.sql import func
from app.core.database import Base


def _uuid():
    return uuid.uuid4().hex


class AnalyticsEvent(Base):
    """One analytics event (page view, feature used, button click, etc.)."""
    __tablename__ = "analytics_events"

    id          = Column(String(32), primary_key=True, default=_uuid)
    user_id     = Column(String(32), nullable=True, index=True)
    event_type  = Column(String(50), nullable=False, index=True)   # page_view, feature_use, etc.
    page        = Column(String(100), nullable=True)               # /dashboard, /dsa, etc.
    feature     = Column(String(100), nullable=True)               # voice_eval, resume_ats, etc.
    meta        = Column(JSON, nullable=True)                      # extra context
    session_id  = Column(String(32), nullable=True)                # linked interview session
    created_at  = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class DSAProblem(Base):
    """DSA problems stored in the database."""
    __tablename__ = "dsa_problems"

    id          = Column(String(32), primary_key=True, default=_uuid)
    title       = Column(String(200), nullable=False)
    slug        = Column(String(200), nullable=False, unique=True, index=True)
    difficulty  = Column(String(10), nullable=False, index=True)   # Easy, Medium, Hard
    topic       = Column(String(80), nullable=True, index=True)    # Arrays, Trees, etc.
    description = Column(Text, nullable=True)
    examples    = Column(JSON, nullable=True)
    constraints = Column(Text, nullable=True)
    hints       = Column(JSON, nullable=True)
    companies   = Column(JSON, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())


class DSASubmission(Base):
    """User's DSA code submission."""
    __tablename__ = "dsa_submissions"

    id          = Column(String(32), primary_key=True, default=_uuid)
    user_id     = Column(String(32), nullable=True, index=True)
    problem_id  = Column(String(32), nullable=True, index=True)
    problem_title = Column(String(200), nullable=True)
    language    = Column(String(30), nullable=False, default="python")
    code        = Column(Text, nullable=False)
    status      = Column(String(20), nullable=False, default="submitted", index=True)  # submitted, passed, failed
    score       = Column(Float, nullable=True)
    ai_feedback = Column(JSON, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class ResumeAnalysis(Base):
    """Saved resume ATS analysis results."""
    __tablename__ = "resume_analyses"

    id              = Column(String(32), primary_key=True, default=_uuid)
    user_id         = Column(String(32), nullable=True, index=True)
    filename        = Column(String(200), nullable=True)
    ats_score       = Column(Float, nullable=True)
    analysis_json   = Column(JSON, nullable=True)
    job_description = Column(Text, nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), index=True)
