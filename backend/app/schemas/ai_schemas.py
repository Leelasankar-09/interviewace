# app/schemas/ai_schemas.py
from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class EvalScores(BaseModel):
    relevance: float
    star: float
    clarity: float
    tone: float
    depth: float
    specificity: float
    vocabulary: float
    impact: float
    filler_control: float
    pacing: float
    conciseness: float
    enthusiasm: float

class StarAnalysis(BaseModel):
    situation: str
    task: str
    action: str
    result: str

class EvalFeedback(BaseModel):
    strengths: List[str]
    improvements: List[str]
    ai_summary: str

class InterviewEvalResponse(BaseModel):
    overall_score: int
    scores: EvalScores
    feedback: EvalFeedback
    star_analysis: StarAnalysis

class ResumeATSResponse(BaseModel):
    ats_score: int
    matching_keywords: List[str]
    missing_keywords: List[str]
    formatting_issues: List[str]
    section_analysis: Dict[str, float]
    suggestions: List[str]
    summary: str

class CodeReviewResponse(BaseModel):
    correctness: int
    time_complexity: str
    space_complexity: str
    bugs: List[str]
    edge_cases_missed: List[str]
    optimized_solution: str
    explanation: str

class StudyPlanWeek(BaseModel):
    week: int
    focus: str
    tasks: List[str]
    resource_links: List[str]

class StudyPlanResponse(BaseModel):
    title: str
    weekly_milestones: List[StudyPlanWeek]
    readiness_checkpoints: List[str]

class CoverLetterResponse(BaseModel):
    cover_letter: str
    key_selling_points: List[str]

class LinkedInOptimizeResponse(BaseModel):
    optimized_headline: str
    optimized_summary: str
    keyword_suggestions: List[str]

class SystemDesignResponse(BaseModel):
    overall_score: int
    scalability: float
    components: float
    tradeoffs: float
    missing_pieces: List[str]
    optimized_architecture: str
    feedback: str

class BehavioralResponse(BaseModel):
    star_score: int
    clarity: float
    relevance: float
    feedback: str
    sample_answer: str

class Question(BaseModel):
    q: str
    hint: str
    tag: str
    diff: str

class QuestionGenResponse(BaseModel):
    questions: List[Question]
