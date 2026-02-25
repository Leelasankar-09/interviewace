# app/models/post.py
from sqlalchemy import Column, String, ForeignKey, Text, Integer
from .base import Base

class Post(Base):
    __tablename__ = "posts"

    user_id = Column(String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(200), nullable=False)
    body  = Column(Text, nullable=False)
    company = Column(String(100), nullable=True)
    role = Column(String(100), nullable=True)
    round_type = Column(String(50), nullable=True)
    flair = Column(String(20), nullable=True) # Got Offer/Rejected/Ongoing
    
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
