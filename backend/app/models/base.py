# app/models/base.py
from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import DeclarativeBase
import uuid

def _uuid():
    return uuid.uuid4().hex

class Base(DeclarativeBase):
    """
    Base class for all models.
    ID is a 32-char hex string (UUID4).
    """
    id = Column(String(32), primary_key=True, default=_uuid)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
