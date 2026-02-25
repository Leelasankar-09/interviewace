# app/models/vote.py
from sqlalchemy import Column, String, ForeignKey, Integer
from .base import Base

class Vote(Base):
    __tablename__ = "votes"

    user_id = Column(String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id = Column(String(32), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    vote_type = Column(Integer, default=1) # +1 or -1
