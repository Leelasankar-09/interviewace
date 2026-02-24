from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from database import get_db
from models.session_model import InterviewSession, PracticeStreak
from services.nlp_service import evaluate_answer, evaluate_minute_segment
from pathlib import Path
import uuid, datetime, os

router = APIRouter(prefix="/voice", tags=["voice"])

RECORDINGS_DIR = Path("recordings")
RECORDINGS_DIR.mkdir(exist_ok=True)


def _update_streak(db: Session, user_id: str, score: float):
    today = datetime.date.today().isoformat()
    row = db.query(PracticeStreak).filter_by(user_id=user_id, date=today).first()
    if row:
        row.sessions    += 1
        row.total_score  = (row.total_score + score) / 2
    else:
        db.add(PracticeStreak(user_id=user_id, date=today, sessions=1, total_score=score))
    db.commit()


# ── Save recording ────────────────────────────────────────────
@router.post("/save")
async def save_recording(
    audio:          UploadFile = File(...),
    question_id:    str  = Form(""),
    question_text:  str  = Form(""),
    question_type:  str  = Form("Behavioral"),
    transcript:     str  = Form(""),
    duration_secs:  int  = Form(0),
    minute_logs:    str  = Form("[]"),   # JSON string
    user_id:        str  = Form("guest"),
    db: Session = Depends(get_db),
):
    import json

    # Save audio file
    filename = f"{uuid.uuid4().hex}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.webm"
    content  = await audio.read()
    with open(RECORDINGS_DIR / filename, "wb") as f:
        f.write(content)

    # Full evaluation
    eval_result = evaluate_answer(transcript, question_type) if transcript.strip() else {}

    # Parse minute logs
    try:
        m_logs = json.loads(minute_logs)
    except Exception:
        m_logs = []

    # Persist to DB
    session = InterviewSession(
        user_id            = user_id,
        session_type       = "voice",
        question_id        = question_id,
        question_text      = question_text,
        question_type      = question_type,
        answer_text        = transcript,
        audio_filename     = filename,
        duration_secs      = duration_secs,
        word_count         = len(transcript.split()),
        overall_score      = eval_result.get("overall_score"),
        grade              = eval_result.get("grade"),
        evaluation_json    = eval_result,
        minute_logs        = m_logs,
        dim_scores         = {k: round(v*10) for k,v in eval_result.get("scores_10", {}).items()},
        filler_count       = sum(f["count"] for f in eval_result.get("fillers", [])),
        vocal_filler_count = eval_result.get("vocal_filler_count", 0),
        power_word_count   = sum(len(v) for v in eval_result.get("power_words", {}).values()),
        star_fulfilled     = eval_result.get("star_breakdown", {}) and
                              sum(1 for v in eval_result["star_breakdown"].values() if v),
        has_quantified     = eval_result.get("has_quantified_result", False),
    )
    db.add(session)

    if user_id != "guest":
        _update_streak(db, user_id, eval_result.get("overall_score", 0))

    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "filename":   filename,
        "overall_score": eval_result.get("overall_score"),
        "grade":         eval_result.get("grade"),
        "vocal_fillers": eval_result.get("vocal_filler_count", 0),
    }


# ── Per-minute segment eval (called live every 60s) ──────────
@router.post("/evaluate-minute")
def eval_minute(
    transcript: str = Form(...),
    minute: int     = Form(1),
):
    return evaluate_minute_segment(transcript, minute)


# ── Full text-only evaluation ─────────────────────────────────
@router.post("/evaluate")
def evaluate(
    transcript:    str = Form(...),
    question_type: str = Form("Behavioral"),
):
    return evaluate_answer(transcript, question_type)


# ── List sessions (history) ───────────────────────────────────
@router.get("/history")
def get_history(
    user_id: str = "guest",
    page: int    = 1,
    limit: int   = 20,
    db: Session  = Depends(get_db),
):
    q = db.query(InterviewSession).filter_by(
        user_id=user_id, session_type="voice"
    ).order_by(desc(InterviewSession.created_at))

    total  = q.count()
    items  = q.offset((page-1)*limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "sessions": [
            {
                "id":            s.id,
                "question_text": s.question_text,
                "question_type": s.question_type,
                "overall_score": s.overall_score,
                "grade":         s.grade,
                "duration_secs": s.duration_secs,
                "word_count":    s.word_count,
                "filler_count":  s.filler_count,
                "vocal_filler_count": s.vocal_filler_count,
                "created_at":    s.created_at.isoformat() if s.created_at else None,
            }
            for s in items
        ],
    }


# ── Single session detail ─────────────────────────────────────
@router.get("/history/{session_id}")
def get_session(session_id: str, db: Session = Depends(get_db)):
    s = db.query(InterviewSession).filter_by(id=session_id).first()
    if not s:
        raise HTTPException(404, "Session not found")
    return s


# ── Delete session ────────────────────────────────────────────
@router.delete("/history/{session_id}")
def delete_session(session_id: str, db: Session = Depends(get_db)):
    s = db.query(InterviewSession).filter_by(id=session_id).first()
    if not s:
        raise HTTPException(404, "Not found")
    if s.audio_filename:
        fp = RECORDINGS_DIR / s.audio_filename
        if fp.exists():
            fp.unlink()
    db.delete(s)
    db.commit()
    return {"deleted": session_id}
