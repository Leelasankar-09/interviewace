"""
Behavioral router — evaluate answers via AI and persist to DB.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.session_model import InterviewSession, PracticeStreak
from app.routes.auth import get_current_user, get_optional_user
from app.models.user_model import User
from app.services.ai_service import evaluate_answer
import datetime

router = APIRouter(prefix="/behavioral", tags=["behavioral"])

BEHAVIORAL_QUESTIONS = [
    {"id": 1, "text": "Tell me about yourself.", "type": "HR", "companies": ["Google", "Amazon", "Meta"]},
    {"id": 2, "text": "Describe a challenging project you worked on.", "type": "Behavioral", "companies": ["Microsoft", "Meta"]},
    {"id": 3, "text": "How do you handle tight deadlines?", "type": "Behavioral", "companies": ["Flipkart", "Swiggy"]},
    {"id": 4, "text": "Describe a conflict with a colleague and how you resolved it.", "type": "Behavioral", "companies": ["Amazon"]},
    {"id": 5, "text": "What's your biggest professional achievement?", "type": "HR", "companies": ["Google", "Tesla"]},
    {"id": 6, "text": "Tell me about a time you failed and what you learned.", "type": "Behavioral", "companies": ["Amazon", "Google"]},
    {"id": 7, "text": "How do you prioritize tasks when working on multiple projects?", "type": "Behavioral", "companies": ["Microsoft", "Adobe"]},
    {"id": 8, "text": "Describe a time you showed leadership.", "type": "Behavioral", "companies": ["Google", "LinkedIn"]},
    {"id": 9, "text": "Why do you want to work at this company?", "type": "HR", "companies": ["All"]},
    {"id": 10, "text": "Where do you see yourself in 5 years?", "type": "HR", "companies": ["All"]},
    {"id": 11, "text": "Tell me about a time you had to learn something quickly.", "type": "Behavioral", "companies": ["Uber", "Airbnb"]},
    {"id": 12, "text": "How do you handle disagreements with your manager?", "type": "Behavioral", "companies": ["Amazon", "Netflix"]},
]


class EvalRequest(BaseModel):
    question: str
    question_id: Optional[int] = None
    answer: str
    round_type: str = "Behavioral"


def _upsert_streak(user_id: str, db: Session):
    today = datetime.date.today().isoformat()
    row = db.query(PracticeStreak).filter_by(user_id=user_id, date=today).first()
    if row:
        row.sessions += 1
    else:
        db.add(PracticeStreak(user_id=user_id, date=today, sessions=1))
    db.commit()


@router.post("/evaluate")
def evaluate(
    body: EvalRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    result = evaluate_answer(body.question, body.answer, body.round_type)
    overall = result.get("overall_score", 0)

    # Grade
    grade = "A+" if overall >= 90 else "A" if overall >= 80 else "B" if overall >= 70 else "C" if overall >= 60 else "D"

    # Dim scores from parameters
    params = result.get("parameters", {})
    dim_scores = {k: v.get("score", 0) * 10 for k, v in params.items()}

    user_id = current_user.id if current_user else None

    if user_id:
        session = InterviewSession(
            user_id=user_id,
            session_type="behavioral",
            question_text=body.question,
            question_type=body.round_type,
            answer_text=body.answer,
            overall_score=overall,
            grade=grade,
            evaluation_json=result,
            dim_scores=dim_scores,
            word_count=len(body.answer.split()),
            filler_count=len(result.get("filler_words", [])),
            ai_feedback=result.get("sample_answer", ""),
        )
        db.add(session)

        # Update streak
        _upsert_streak(user_id, db)
        db.commit()
        db.refresh(session)
        result["session_id"] = session.id

    result["grade"] = grade
    return result


@router.get("/questions")
def get_questions(role: str = "Software Engineer", round_type: str = "all"):
    if round_type == "all":
        return {"questions": BEHAVIORAL_QUESTIONS}
    filtered = [q for q in BEHAVIORAL_QUESTIONS if q["type"].lower() == round_type.lower()]
    return {"questions": filtered}


@router.get("/history")
def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id,
        InterviewSession.session_type == "behavioral",
    ).order_by(desc(InterviewSession.created_at))
    total = q.count()
    sessions = q.offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "sessions": [
            {
                "id": s.id,
                "question_text": (s.question_text or "")[:120],
                "question_type": s.question_type,
                "overall_score": s.overall_score,
                "grade": s.grade,
                "word_count": s.word_count,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in sessions
        ],
    }
