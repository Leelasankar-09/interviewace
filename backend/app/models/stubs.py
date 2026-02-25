from sqlalchemy import Column, String, ForeignKey, Text, Integer, Boolean
from .base import Base

class Post(Base):
    __tablename__ = "posts"
    user_id = Column(String(32), ForeignKey("users.id"), nullable=False)
    title   = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)

class Comment(Base):
    __tablename__ = "comments"
    user_id = Column(String(32), ForeignKey("users.id"), nullable=False)
    post_id = Column(String(32), ForeignKey("posts.id"), nullable=False)
    content = Column(Text, nullable=False)

class Vote(Base):
    __tablename__ = "votes"
    user_id = Column(String(32), ForeignKey("users.id"), nullable=False)
    item_id = Column(String(32), nullable=False) # post_id or comment_id
    item_type = Column(String(20), nullable=False) # post/comment
    value   = Column(Integer, default=1) # 1 or -1

class ResumeScan(Base):
    __tablename__ = "resume_scans"
    user_id = Column(String(32), ForeignKey("users.id"), nullable=False)
    filename = Column(String(200), nullable=False)
    ats_score = Column(Integer, default=0)
    feedback  = Column(Text, nullable=True)
