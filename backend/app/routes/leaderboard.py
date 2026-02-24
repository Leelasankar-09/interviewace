"""
Leaderboard router — ranks users by score, streak, college, and CGPA.
GET /leaderboard          — top 50 public users with their stats
GET /leaderboard/me       — current user's rank and stats
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.database import get_db
from app.models.user_model import User
from app.models.session_model import InterviewSession, PracticeStreak
from app.routes.auth import get_current_user
import datetime

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


def _user_stats(user: User, db: Session) -> dict:
    """Compute stats needed for ranking."""
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user.id
    ).all()

    scores = [s.overall_score for s in sessions if s.overall_score is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0
    best_score = round(max(scores), 1) if scores else 0
    total = len(sessions)

    # Streak
    streak = 0
    today = datetime.date.today()
    for i in range(365):
        day = (today - datetime.timedelta(days=i)).isoformat()
        row = db.query(PracticeStreak).filter_by(user_id=user.id, date=day).first()
        if row and row.sessions > 0:
            streak += 1
        elif i > 0:
            break

    # Rank score — weighted formula
    rank_score = round(avg_score * 0.5 + min(streak, 30) * 1.5 + min(total, 50) * 0.3, 1)

    return {
        "id": user.id,
        "name": user.name,
        "college": user.college or "—",
        "cgpa": user.cgpa or "—",
        "target_role": user.target_role or "—",
        "avatar_initials": user.name[0].upper() if user.name else "?",
        "avg_score": avg_score,
        "best_score": best_score,
        "total_sessions": total,
        "streak_days": streak,
        "rank_score": rank_score,
        "linkedin": user.linkedin,
        "github": user.github,
    }


@router.get("")
def get_leaderboard(
    limit: int = Query(50, le=100),
    sort_by: str = Query("rank_score", regex="^(rank_score|avg_score|streak_days|total_sessions)$"),
    college: str = Query(None),
    db: Session = Depends(get_db),
):
    """
    Top users ranked by weighted score.
    Filter by college if provided.
    """
    q = db.query(User).filter(User.is_public == True)
    if college:
        q = q.filter(User.college.ilike(f"%{college}%"))

    users = q.all()

    # Compute stats for each user
    board = []
    for u in users:
        try:
            stats = _user_stats(u, db)
            if stats["total_sessions"] > 0:  # only show active users
                board.append(stats)
        except Exception:
            pass

    # Sort
    board.sort(key=lambda x: x.get(sort_by, 0), reverse=True)
    board = board[:limit]

    # Add rank position
    for i, entry in enumerate(board):
        entry["rank"] = i + 1

    return {"leaderboard": board, "total": len(board)}


@router.get("/colleges")
def get_colleges(db: Session = Depends(get_db)):
    """Distinct colleges for filter dropdown."""
    rows = db.query(User.college).filter(
        User.college != None,
        User.college != "",
        User.is_public == True
    ).distinct().all()
    return {"colleges": sorted([r[0] for r in rows if r[0]])}


@router.get("/me")
def my_rank(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current user's rank among all public users."""
    all_users = db.query(User).filter(User.is_public == True).all()
    board = []
    for u in all_users:
        try:
            stats = _user_stats(u, db)
            if stats["total_sessions"] > 0:
                board.append(stats)
        except Exception:
            pass

    board.sort(key=lambda x: x["rank_score"], reverse=True)
    rank = next((i + 1 for i, e in enumerate(board) if e["id"] == current_user.id), None)
    my_stats = _user_stats(current_user, db)
    my_stats["rank"] = rank
    my_stats["total_ranked"] = len(board)
    return my_stats
