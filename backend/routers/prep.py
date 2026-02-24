from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from database import get_db
from services.ai_service import ai_service
from .auth import get_current_user
from models.user_model import User

router = APIRouter(prefix="/prep", tags=["prep"])

# ── Schemas ────────────────────────────────────────────────────
class StudyPlanRequest(BaseModel):
    target_role: str
    timeframe: str = "4 weeks"
    current_skills: Optional[str] = ""

class CompanyPrepRequest(BaseModel):
    company_name: str
    role: str = "Software Engineer"

class ReadinessScoreResponse(BaseModel):
    overall_readiness: float
    breakdown: dict
    recommendations: List[str]

# ── Endpoints ──────────────────────────────────────────────────
@router.post("/study-plan")
async def get_study_plan(body: StudyPlanRequest, current_user: User = Depends(get_current_user)):
    """AI-generated personalized roadmap."""
    plan = await ai_service.generate_study_plan(
        target_role=body.target_role,
        timeframe=body.timeframe,
        current_skills=body.current_skills
    )
    return plan

@router.post("/company")
async def get_company_tips(body: CompanyPrepRequest, current_user: User = Depends(get_current_user)):
    """Deep insights into company-specific interview loops."""
    tips = await ai_service.get_company_preparation(
        company_name=body.company_name,
        role=body.role
    )
    return tips

@router.get("/readiness", response_model=ReadinessScoreResponse)
async def get_readiness_score(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Calculates readiness based on previous interview session performance.
    """
    from models.session_model import InterviewSession
    sessions = db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).all()
    
    if not sessions:
        return {
            "overall_readiness": 0.0,
            "breakdown": {"voice": 0, "text": 0},
            "recommendations": ["Start your first practice session to get a score!"]
        }

    # Simplified logic for readiness calculation
    avg_score = sum(s.overall_score for s in sessions) / len(sessions)
    
    return {
        "overall_readiness": round(avg_score, 1),
        "breakdown": {
            "sessions_completed": len(sessions),
            "top_score": max(s.overall_score for s in sessions)
        },
        "recommendations": [
            "Focus on improving your STAR structure.",
            "Try a voice session to improve your pacing."
        ]
    }
