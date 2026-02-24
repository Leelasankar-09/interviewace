"""
Badges router — computes and returns achievement badges for a user.
GET /badges/me        — current user's earned badges
GET /badges/{user_id} — any user's public badges
"""
from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user_model import User
from app.models.session_model import InterviewSession, PracticeStreak
from app.routes.auth import get_current_user
import datetime

router = APIRouter(prefix="/badges", tags=["badges"])


# ── Badge Definitions ─────────────────────────────────────────────────────────
BADGE_DEFS = [
    # Streak badges
    {"id": "streak_3",    "name": "On a Roll",       "emoji": "🔥",  "desc": "3-day practice streak",              "category": "streak"},
    {"id": "streak_7",    "name": "Week Warrior",     "emoji": "⚡",  "desc": "7-day practice streak",              "category": "streak"},
    {"id": "streak_30",   "name": "Iron Discipline",  "emoji": "🏅",  "desc": "30-day practice streak",             "category": "streak"},

    # Sessions count
    {"id": "sessions_5",  "name": "Getting Started",  "emoji": "🚀",  "desc": "Completed 5 sessions",               "category": "sessions"},
    {"id": "sessions_25", "name": "Committed",        "emoji": "💪",  "desc": "Completed 25 sessions",              "category": "sessions"},
    {"id": "sessions_50", "name": "Interview Pro",    "emoji": "💻",  "desc": "Completed 50 sessions",              "category": "sessions"},
    {"id": "sessions_100","name": "Century Club",     "emoji": "💯",  "desc": "Completed 100 sessions",             "category": "sessions"},

    # Score badges
    {"id": "score_70",    "name": "Rising Star",      "emoji": "⭐",  "desc": "Average score above 70%",            "category": "score"},
    {"id": "score_80",    "name": "High Achiever",    "emoji": "🌟",  "desc": "Average score above 80%",            "category": "score"},
    {"id": "score_90",    "name": "Elite Performer",  "emoji": "🏆",  "desc": "Average score above 90%",            "category": "score"},

    # Variety badges  
    {"id": "variety_3",   "name": "Well-Rounded",     "emoji": "🎯",  "desc": "Practiced 3+ different session types","category": "variety"},
    {"id": "dsa_ace",     "name": "DSA Ace",          "emoji": "🧠",  "desc": "Completed 10 DSA sessions",          "category": "dsa"},
    {"id": "behavioral_star","name": "Storyteller",   "emoji": "🎭",  "desc": "Completed 10 behavioral sessions",   "category": "behavioral"},

    # First-time badges
    {"id": "first_session","name": "First Step",      "emoji": "👣",  "desc": "Completed your first session",       "category": "milestone"},
    {"id": "profile_complete","name": "Profile Pro",  "emoji": "👤",  "desc": "Filled in college, CGPA and LinkedIn","category": "profile"},
]


def _compute_badges(user: User, db: Session) -> list:
    """Compute which badges a user has earned."""
    sessions = db.query(InterviewSession).filter(InterviewSession.user_id == user.id).all()
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

    # Avg score
    scores = [s.overall_score for s in sessions if s.overall_score is not None]
    avg = sum(scores) / len(scores) if scores else 0

    # By type
    types_used = set(s.session_type for s in sessions if s.session_type)
    dsa_count      = sum(1 for s in sessions if s.session_type == "dsa")
    behav_count    = sum(1 for s in sessions if s.session_type == "behavioral")

    # Profile completeness
    profile_ok = bool(user.college and user.cgpa and user.linkedin)

    earned_ids = set()
    if total >= 1:       earned_ids.add("first_session")
    if total >= 5:       earned_ids.add("sessions_5")
    if total >= 25:      earned_ids.add("sessions_25")
    if total >= 50:      earned_ids.add("sessions_50")
    if total >= 100:     earned_ids.add("sessions_100")
    if streak >= 3:      earned_ids.add("streak_3")
    if streak >= 7:      earned_ids.add("streak_7")
    if streak >= 30:     earned_ids.add("streak_30")
    if avg >= 70:        earned_ids.add("score_70")
    if avg >= 80:        earned_ids.add("score_80")
    if avg >= 90:        earned_ids.add("score_90")
    if len(types_used) >= 3: earned_ids.add("variety_3")
    if dsa_count >= 10:  earned_ids.add("dsa_ace")
    if behav_count >= 10: earned_ids.add("behavioral_star")
    if profile_ok:       earned_ids.add("profile_complete")

    result = []
    for b in BADGE_DEFS:
        entry = {**b, "earned": b["id"] in earned_ids}
        result.append(entry)

    return result


@router.get("/me")
def my_badges(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    badges = _compute_badges(current_user, db)
    earned = [b for b in badges if b["earned"]]
    return {
        "badges": badges,
        "earned_count": len(earned),
        "total_count": len(badges),
    }


@router.get("/{user_id}")
def user_badges(user_id: str = Path(...), db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id, is_public=True).first()
    if not user:
        return {"badges": [], "earned_count": 0, "total_count": len(BADGE_DEFS)}
    badges = _compute_badges(user, db)
    earned = [b for b in badges if b["earned"]]
    return {
        "user_name": user.name,
        "badges": badges,
        "earned_count": len(earned),
        "total_count": len(badges),
    }
