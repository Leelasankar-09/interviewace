from sqlalchemy import Column, String, Text, DateTime, Float, Integer, Boolean
from sqlalchemy.sql import func
from database import Base
import uuid


def _uuid():
    return uuid.uuid4().hex


class User(Base):
    __tablename__ = "users"

    id            = Column(String(32), primary_key=True, default=_uuid)
    name          = Column(String(120),  nullable=False)
    email         = Column(String(255),  nullable=False, unique=True, index=True)
    hashed_pw     = Column(String(255),  nullable=False)
    college       = Column(String(200),  nullable=True)
    cgpa          = Column(String(10),   nullable=True)
    target_role   = Column(String(120),  nullable=True)
    bio           = Column(Text,         nullable=True)
    avatar_url    = Column(Text,         nullable=True)
    is_public     = Column(Boolean,      default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())
