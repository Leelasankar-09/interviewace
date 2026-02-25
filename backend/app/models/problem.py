# app/models/problem.py
from sqlalchemy import Column, String, Text, JSON
from .base import Base

class Problem(Base):
    __tablename__ = "problems"

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    topic = Column(String(50), nullable=False, index=True) # Array, Linked List, etc.
    difficulty = Column(String(20), nullable=False, index=True) # Easy, Medium, Hard
    constraints = Column(Text, nullable=True)
    sample_input = Column(Text, nullable=True)
    sample_output = Column(Text, nullable=True)
    initial_code = Column(JSON, nullable=True) # Dict of lang: code_stub
