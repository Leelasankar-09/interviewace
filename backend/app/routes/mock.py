"""
Mock Interview router — streaming AI chat + session persistence.
"""
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional, List
import json, datetime

from app.core.database import get_db
from app.models.session_model import InterviewSession, PracticeStreak
from app.routes.auth import get_current_user, get_optional_user
from app.models.user_model import User
from app.services.ai_service import mock_interview_stream

router = APIRouter(prefix="/mock", tags=["mock"])


class ChatMessage(BaseModel):
    history: List[dict]
    message: str
    role: str = "Software Engineer"
    round_type: str = "Technical"


class SaveSessionRequest(BaseModel):
    question_text: str
    answer_text: str
    round_type: str = "Technical"
    role_tag: str = ""
    overall_score: Optional[float] = None
    conversation: Optional[List[dict]] = None


def _upsert_streak(user_id: str, db: Session):
    today = datetime.date.today().isoformat()
    row = db.query(PracticeStreak).filter_by(user_id=user_id, date=today).first()
    if row:
        row.sessions += 1
    else:
        db.add(PracticeStreak(user_id=user_id, date=today, sessions=1))
    db.commit()


@router.post("/chat")
def mock_chat(body: ChatMessage):
    def generate():
        for chunk in mock_interview_stream(body.history, body.message):
            yield chunk
    return StreamingResponse(generate(), media_type="text/plain")


@router.post("/save")
def save_session(
    body: SaveSessionRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    user_id = current_user.id if current_user else None

    grade = None
    if body.overall_score is not None:
        score = body.overall_score
        grade = "A+" if score >= 90 else "A" if score >= 80 else "B" if score >= 70 else "C" if score >= 60 else "D"

    session = InterviewSession(
        user_id=user_id,
        session_type="mock",
        question_text=body.question_text,
        question_type=body.round_type,
        role_tag=body.role_tag,
        answer_text=body.answer_text,
        overall_score=body.overall_score,
        grade=grade,
        evaluation_json={"conversation": body.conversation} if body.conversation else None,
        word_count=len(body.answer_text.split()) if body.answer_text else 0,
    )
    db.add(session)

    if user_id:
        _upsert_streak(user_id, db)

    db.commit()
    db.refresh(session)
    return {"session_id": session.id, "status": "saved"}


@router.get("/history")
def get_history(
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id,
        InterviewSession.session_type == "mock",
    ).order_by(desc(InterviewSession.created_at))
    total = q.count()
    sessions = q.offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "sessions": [
            {
                "id": s.id,
                "question_text": (s.question_text or "")[:120],
                "role_tag": s.role_tag,
                "overall_score": s.overall_score,
                "grade": s.grade,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in sessions
        ],
    }
