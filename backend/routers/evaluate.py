from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
import datetime
import uuid
import json
from pathlib import Path

from database import get_db
from models.session_model import InterviewSession, PracticeStreak
from services.ai_service import ai_service
from services.nlp_service import evaluate_minute_segment
from .auth import get_current_user

router = APIRouter(prefix="/evaluate", tags=["evaluate"])

RECORDINGS_DIR = Path("recordings")
RECORDINGS_DIR.mkdir(exist_ok=True)

def _update_streak(db: Session, user_id: str, score: float):
    today = datetime.date.today().isoformat()
    row = db.query(PracticeStreak).filter_by(user_id=user_id, date=today).first()
    if row:
        row.sessions += 1
        # Weighted average score for the day
        row.total_score = (row.total_score + score) / 2
    else:
        db.add(PracticeStreak(user_id=user_id, date=today, sessions=1, total_score=score))
    db.commit()

@router.post("/voice")
async def evaluate_voice(
    audio: UploadFile = File(...),
    question_id: str = Form(""),
    question_text: str = Form(""),
    question_type: str = Form("Behavioral"),
    transcript: str = Form(""),
    duration_secs: int = Form(0),
    minute_logs: str = Form("[]"),
    user_id: str = Form(""),
    db: Session = Depends(get_db)
):
    """
    Evaluates a voice session. Saves audio and performs AI evaluation.
    """
    # 1. Save Audio
    filename = f"{uuid.uuid4().hex}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.webm"
    content = await audio.read()
    with open(RECORDINGS_DIR / filename, "wb") as f:
        f.write(content)

    # 2. Deep AI Evaluation
    eval_result = await ai_service.evaluate_interview_response(
        question=question_text,
        answer=transcript,
        context=f"Session type: Voice, Question Type: {question_type}"
    )

    # 3. Parse minute logs
    try:
        m_logs = json.loads(minute_logs)
    except:
        m_logs = []

    # 4. Save to DB
    local_nlp = eval_result.get("local_nlp", {})
    session = InterviewSession(
        user_id=user_id if user_id else None,
        session_type="voice",
        question_id=question_id,
        question_text=question_text,
        question_type=question_type,
        answer_text=transcript,
        audio_filename=filename,
        duration_secs=duration_secs,
        word_count=len(transcript.split()),
        overall_score=eval_result.get("overall_score"),
        evaluation_json=eval_result,
        minute_logs=m_logs,
        dim_scores=eval_result.get("scores", {}),
        filler_count=local_nlp.get("vocal_filler_count", 0) + len(local_nlp.get("fillers", [])),
        vocal_filler_count=local_nlp.get("vocal_filler_count", 0),
        power_word_count=sum(len(v) for v in local_nlp.get("power_words", {}).values()) if local_nlp.get("power_words") else 0,
        star_fulfilled=sum(1 for v in eval_result.get("star_analysis", {}).values() if v and "N/A" not in v),
        has_quantified=local_nlp.get("has_quantified_result", False),
        grade=local_nlp.get("grade", "B"),
        ai_feedback=eval_result.get("feedback", {}).get("ai_summary", "")
    )
    db.add(session)
    
    if user_id:
        _update_streak(db, user_id, eval_result.get("overall_score", 0))

    db.commit()
    db.refresh(session)

    return {
        "success": True,
        "session_id": session.id,
        "evaluation": eval_result
    }

@router.post("/text")
async def evaluate_text(
    question_text: str = Form(...),
    answer_text: str = Form(...),
    question_type: str = Form("Behavioral"),
    user_id: str = Form(""),
    db: Session = Depends(get_db)
):
    """
    Evaluates a written response.
    """
    # 1. Deep AI Evaluation
    eval_result = await ai_service.evaluate_interview_response(
        question=question_text,
        answer=answer_text,
        context=f"Session type: Text, Question Type: {question_type}"
    )

    # 2. Save to DB
    local_nlp = eval_result.get("local_nlp", {})
    session = InterviewSession(
        user_id=user_id if user_id else None,
        session_type="behavioral",
        question_text=question_text,
        question_type=question_type,
        answer_text=answer_text,
        overall_score=eval_result.get("overall_score"),
        evaluation_json=eval_result,
        dim_scores=eval_result.get("scores", {}),
        star_fulfilled=sum(1 for v in eval_result.get("star_analysis", {}).values() if v and "N/A" not in v),
        grade=local_nlp.get("grade", "B"),
        ai_feedback=eval_result.get("feedback", {}).get("ai_summary", "")
    )
    db.add(session)

    if user_id:
        _update_streak(db, user_id, eval_result.get("overall_score", 0))

    db.commit()
    db.refresh(session)

    return {
        "success": True,
        "session_id": session.id,
        "evaluation": eval_result
    }

@router.post("/generate-question")
async def generate_question(
    role: str = "Software Engineer",
    type: str = "Behavioral",
    level: str = "Senior"
):
    """
    Calls AI to generate a tailored interview question.
    """
    # Simple hardcoded pool for fast response if AI service is configured for evaluation only
    # Could also use Claude here to generate a fresh one
    pool = {
        "Behavioral": [
            "Tell me about a time you had a conflict with a teammate. How did you resolve it?",
            "What is your greatest professional achievement and why?",
            "Describe a difficult project and how you managed to complete it under pressure.",
            "Tell me about a time you failed. What did you learn?"
        ],
        "Technical": [
            "Explain the difference between a process and a thread.",
            "How does a hash map work under the hood?",
            "Describe the CAP theorem and its implications for distributed systems.",
            "What are the trade-offs of using a microservices architecture?"
        ]
    }
    
    import random
    questions = pool.get(type, pool["Behavioral"])
    return {"question": random.choice(questions)}
