"""
Sessions router — unified history & analytics across all interview types.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, cast, Date
from app.core.database import get_db
from app.models.session_model import InterviewSession, PracticeStreak
import datetime

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/history")
def get_all_history(
    user_id: str = Query("guest"),
    session_type: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db),
):
    """Paginated history across all session types."""
    q = db.query(InterviewSession).filter(InterviewSession.user_id == user_id)
    if session_type:
        q = q.filter(InterviewSession.session_type == session_type)
    q = q.order_by(desc(InterviewSession.created_at))
    total = q.count()
    items = q.offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
        "sessions": [_summary(s) for s in items],
    }


@router.get("/analytics")
def get_analytics(
    user_id: str = Query("guest"),
    days: int = Query(30),
    db: Session = Depends(get_db),
):
    """Aggregated analytics for the dashboard."""
    since = datetime.datetime.now() - datetime.timedelta(days=days)

    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user_id,
        InterviewSession.created_at >= since,
    ).all()

    if not sessions:
        return _empty_analytics()

    by_type = {}
    for s in sessions:
        t = s.session_type
        if t not in by_type:
            by_type[t] = []
        by_type[t].append(s)

    # Score trend (daily avg)
    trend_map = {}
    for s in sessions:
        if s.overall_score is not None and s.created_at:
            day = s.created_at.strftime("%Y-%m-%d")
            trend_map.setdefault(day, []).append(s.overall_score)
    trend = sorted([
        {"date": d, "avg_score": round(sum(v)/len(v), 1), "count": len(v)}
        for d, v in trend_map.items()
    ], key=lambda x: x["date"])

    # Per-dimension averages (voice sessions only)
    voice_sessions = [s for s in sessions if s.session_type == "voice" and s.dim_scores]
    dim_avgs = {}
    if voice_sessions:
        all_dims = {}
        for s in voice_sessions:
            for k, v in (s.dim_scores or {}).items():
                all_dims.setdefault(k, []).append(v)
        dim_avgs = {k: round(sum(v)/len(v), 1) for k, v in all_dims.items()}

    # Latest session per type
    latest = {}
    for t, ss in by_type.items():
        ss_sorted = sorted(ss, key=lambda x: x.created_at or datetime.datetime.min, reverse=True)
        latest[t] = _summary(ss_sorted[0])

    # Scores
    all_scores = [s.overall_score for s in sessions if s.overall_score is not None]
    avg_score = round(sum(all_scores)/len(all_scores), 1) if all_scores else 0
    best_score = round(max(all_scores), 1) if all_scores else 0

    # Streak
    streak = _compute_streak(user_id, db)

    return {
        "total_sessions": len(sessions),
        "avg_score": avg_score,
        "best_score": best_score,
        "by_type": {t: len(ss) for t, ss in by_type.items()},
        "trend": trend,
        "dim_avgs": dim_avgs,
        "latest": latest,
        "streak_days": streak,
        "total_filler_words": sum(s.filler_count or 0 for s in sessions),
        "total_vocal_fillers": sum(s.vocal_filler_count or 0 for s in sessions),
    }


@router.get("/streak")
def get_streak(user_id: str = Query("guest"), db: Session = Depends(get_db)):
    return {"streak_days": _compute_streak(user_id, db), "user_id": user_id}


@router.get("/{session_id}")
def get_session(session_id: str, db: Session = Depends(get_db)):
    s = db.query(InterviewSession).filter_by(id=session_id).first()
    if not s:
        return {"error": "Not found"}
    return {
        **_summary(s),
        "answer_text":    s.answer_text,
        "evaluation_json": s.evaluation_json,
        "minute_logs":     s.minute_logs,
        "ai_feedback":     s.ai_feedback,
    }


def _summary(s: InterviewSession) -> dict:
    return {
        "id":               s.id,
        "session_type":     s.session_type,
        "question_text":    (s.question_text or "")[:120],
        "question_type":    s.question_type,
        "overall_score":    s.overall_score,
        "grade":            s.grade,
        "duration_secs":    s.duration_secs,
        "word_count":       s.word_count,
        "filler_count":     s.filler_count,
        "vocal_filler_count": s.vocal_filler_count,
        "star_fulfilled":   s.star_fulfilled,
        "has_quantified":   s.has_quantified,
        "dim_scores":       s.dim_scores,
        "created_at":       s.created_at.isoformat() if s.created_at else None,
    }


def _compute_streak(user_id: str, db: Session) -> int:
    today = datetime.date.today()
    streak = 0
    for i in range(365):
        day = (today - datetime.timedelta(days=i)).isoformat()
        row = db.query(PracticeStreak).filter_by(user_id=user_id, date=day).first()
        if row and row.sessions > 0:
            streak += 1
        elif i > 0:  # allow today to be missing (just started)
            break
    return streak


def _empty_analytics() -> dict:
    return {
        "total_sessions": 0, "avg_score": 0, "best_score": 0,
        "by_type": {}, "trend": [], "dim_avgs": {},
        "latest": {}, "streak_days": 0,
        "total_filler_words": 0, "total_vocal_fillers": 0,
    }
