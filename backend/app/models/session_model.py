"""
Session Model — stores every interview attempt with full evaluation.
Covers: voice, behavioral, DSA, mock, system design.
"""
import uuid
from sqlalchemy import (Column, String, Text, DateTime, Float,
                         Integer, JSON, ForeignKey, Boolean, Enum)
from sqlalchemy.sql import func
from app.core.database import Base
import enum


def _uuid():
    return uuid.uuid4().hex


class SessionType(str, enum.Enum):
    voice       = "voice"
    behavioral  = "behavioral"
    dsa         = "dsa"
    system_design = "system_design"
    mock        = "mock"
    resume      = "resume"


class InterviewSession(Base):
    """One interview attempt (one question answered)."""
    __tablename__ = "interview_sessions"

    id              = Column(String(32), primary_key=True, default=_uuid)
    user_id         = Column(String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    session_type    = Column(String(20), nullable=False, index=True)

    # Question context
    question_id     = Column(String(50),  nullable=True)
    question_text   = Column(Text,        nullable=True)
    question_type   = Column(String(30),  nullable=True)   # HR / Behavioral / Technical
    role_tag        = Column(String(80),  nullable=True)

    # Answer content
    answer_text     = Column(Text,        nullable=True)
    audio_filename  = Column(String(200), nullable=True)
    duration_secs   = Column(Integer,     default=0)
    word_count      = Column(Integer,     default=0)

    # Evaluation (stored as JSON blob)
    overall_score   = Column(Float,       nullable=True)
    grade           = Column(String(5),   nullable=True)
    evaluation_json = Column(JSON,        nullable=True)    # full评 result
    minute_logs     = Column(JSON,        nullable=True)    # [{minute, score, wpm, ...}]
    dim_scores      = Column(JSON,        nullable=True)    # {clarity: 72, depth: 65, ...}

    # Highlights
    filler_count    = Column(Integer,     default=0)
    vocal_filler_count = Column(Integer,  default=0)
    power_word_count   = Column(Integer,  default=0)
    star_fulfilled     = Column(Integer,  default=0)       # 0-4
    has_quantified     = Column(Boolean,  default=False)

    # AI feedback
    ai_feedback     = Column(Text,        nullable=True)

    created_at      = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())


class PracticeStreak(Base):
    """Daily streak tracking per user."""
    __tablename__ = "practice_streaks"

    id          = Column(String(32), primary_key=True, default=_uuid)
    user_id     = Column(String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date        = Column(String(10), nullable=False)        # YYYY-MM-DD
    sessions    = Column(Integer,    default=0)
    total_score = Column(Float,      default=0.0)

    __table_args__ = (
        # unique per user per day
        __import__('sqlalchemy').UniqueConstraint('user_id', 'date', name='uq_streak_user_date'),
    )
