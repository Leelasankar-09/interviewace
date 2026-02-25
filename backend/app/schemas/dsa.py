# app/schemas/dsa.py
from pydantic import BaseModel
from typing import List, Optional

class ProblemRead(BaseModel):
    id: str
    title: str
    description: str
    topic: str
    difficulty: str
    constraints: Optional[str] = None
    sample_input: Optional[str] = None
    sample_output: Optional[str] = None
    initial_code: Optional[dict] = None

class DSASubmissionRequest(BaseModel):
    problem_id: str
    code: str
    language: str

class DSASubmissionResponse(BaseModel):
    correctness: float
    time_complexity: str
    space_complexity: str
    bugs: List[str]
    optimized_solution: str
    explanation: str
