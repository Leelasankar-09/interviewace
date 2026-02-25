# app/schemas/ai_schemas.py
from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class EvaluationScores(BaseModel):
    relevance: float
    star: float
    clarity: float
    tone_confidence: float = Field(alias="tone")
    depth: float
    specificity: float
    vocabulary: float
    impact_results: float = Field(alias="impact", default=0.0)
    filler_control: float
    pacing: float
    conciseness: float
    enthusiasm: float

class EvaluationFeedback(BaseModel):
    strengths: List[str]
    improvements: List[str]
    ai_summary: str

class StarAnalysis(BaseModel):
    situation: str
    task: str
    action: str
    result: str

class InterviewEvalResponse(BaseModel):
    overall_score: float
    scores: EvaluationScores
    feedback: EvaluationFeedback
    star_analysis: StarAnalysis

class ResumeATSSection(BaseModel):
    experience: float
    projects: float
    skills: float

class ResumeATSResponse(BaseModel):
    ats_score: float
    matching_keywords: List[str]
    missing_keywords: List[str]
    formatting_issues: List[str]
    section_analysis: ResumeATSSection
    suggestions: List[str]
    summary: str

class Milestone(BaseModel):
    week: int
    focus: str
    tasks: List[str]
    resource_links: List[str]

class StudyPlanResponse(BaseModel):
    title: str
    weekly_milestones: List[Milestone]
    readiness_checkpoints: List[str]

class CodeReviewResponse(BaseModel):
    correctness: float
    time_complexity: str
    space_complexity: str
    bugs: List[str]
    edge_cases_missed: List[str]
    optimized_solution: str
    explanation: str

class SystemDesignResponse(BaseModel):
    overall_score: float
    scalability: float
    components: float
    tradeoffs: float
    missing_pieces: List[str]
    optimized_architecture: str
    feedback: str

class BehavioralResponse(BaseModel):
    star_score: float
    clarity: float
    relevance: float
    feedback: str
    sample_answer: str

class CoverLetterResponse(BaseModel):
    cover_letter: str
    key_selling_points: List[str]

class LinkedInOptimizeResponse(BaseModel):
    optimized_headline: str
    optimized_summary: str
    keyword_suggestions: List[str]

class QuestionItem(BaseModel):
    q: str
    hint: str
    tag: str
    diff: str

class QuestionGenResponse(BaseModel):
    questions: List[QuestionItem]
