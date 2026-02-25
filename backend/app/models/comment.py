# app/models/comment.py
from sqlalchemy import Column, String, ForeignKey, Text
from .base import Base

class Comment(Base):
    __tablename__ = "comments"

    post_id = Column(String(32), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    body = Column(Text, nullable=False)
    parent_id = Column(String(32), ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
