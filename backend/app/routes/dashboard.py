from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict
import datetime

from app.core.database import get_db
from app.models.user_model import User
from app.models.session_model import InterviewSession, PracticeStreak
from app.routes.auth import get_current_user
from app.controllers.readiness_controller import ReadinessController

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns high-level stats for the 4 dashboard cards.
    """
    # 1. Overall Score (average of all sessions)
    avg_score = db.query(func.avg(InterviewSession.overall_score)).filter(InterviewSession.user_id == user.id).scalar() or 0
    
    # 2. Problems Solved (count sessions)
    problems_solved = db.query(InterviewSession).filter(InterviewSession.user_id == user.id).count()
    
    # 3. ATS Score (latest from resume analysis)
    from app.models.analytics_model import ResumeAnalysis
    latest_resume = db.query(ResumeAnalysis).filter(ResumeAnalysis.user_id == user.id).order_by(desc(ResumeAnalysis.created_at)).first()
    ats_score = int(latest_resume.ats_score) if latest_resume and latest_resume.ats_score else 0
    
    # 4. Current Streak (calculate from PracticeStreak)
    streak_count = 0
    today = datetime.date.today()
    for i in range(100):
        d = (today - datetime.timedelta(days=i)).isoformat()
        exists = db.query(PracticeStreak).filter_by(user_id=user.id, date=d).first()
        if exists:
            streak_count += 1
        else:
            if i > 0: break # break if not today and no entry
            # if i == 0 and not exists, it might be started tomorrow? no, check yesterday
            continue

    return {
        "overall_score": round(float(avg_score), 1),
        "problems_solved": problems_solved,
        "ats_score": ats_score,
        "current_streak": streak_count
    }

@router.get("/streak")
def get_streak_calendar(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns 10 weeks of practice data (70 days).
    """
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(weeks=10)
    
    streaks = db.query(PracticeStreak).filter(
        PracticeStreak.user_id == user.id,
        PracticeStreak.date >= start_date.isoformat()
    ).all()
    
    # Format as { "YYYY-MM-DD": { sessions: 2, score: 85 } }
    data = {s.date: {"sessions": s.sessions, "score": s.total_score} for s in streaks}
    
    # Ensure all days are represented (even zeros) for the frontend grid
    result = []
    for i in range(70 + 1):
        d = (start_date + datetime.timedelta(days=i)).isoformat()
        day_data = data.get(d, {"sessions": 0, "score": 0})
        result.append({"date": d, **day_data})
        
    return result

@router.get("/activity")
def get_recent_activity(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns the latest 10 sessions.
    """
    sessions = db.query(InterviewSession).filter(InterviewSession.user_id == user.id).order_by(desc(InterviewSession.created_at)).limit(10).all()
    
    return [
        {
            "id": s.id,
            "type": s.session_type,
            "title": s.question_text[:50] + "..." if s.question_text else "Quick Practice",
            "score": s.overall_score,
            "date": s.created_at.isoformat() if s.created_at else None
        }
        for s in sessions
    ]

@router.get("/charts")
def get_radar_and_donut_data(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns data for Skill Radar and Platform Donut.
    """
    # Radar Data (Mocked but structured as requested)
    radar_data = [
        {"subject": "DSA", "user": 65, "target": 85},
        {"subject": "System Design", "user": 45, "target": 75},
        {"subject": "Behavioral", "user": 90, "target": 80},
        {"subject": "HR", "user": 80, "target": 85},
        {"subject": "Vocabulary", "user": 72, "target": 80},
    ]
    
    # Donut Data 
    platforms = [
        {"name": "LeetCode", "value": 45},
        {"name": "Codeforces", "value": 15},
        {"name": "GFG", "value": 25},
        {"name": "HackerRank", "value": 10},
        {"name": "Other", "value": 5},
    ]
    
    # Skill Progress Bars
    skills = [
        {"name": "Recursion", "progress": 82, "color": "#c2410c"},
        {"name": "Dynamic Programming", "progress": 45, "color": "#7c2d12"},
        {"name": "Graphs", "progress": 60, "color": "#ea580c"},
    ]
    
    return {
        "radar": radar_data,
        "platforms": platforms,
        "skills": skills
    }

@router.get("/readiness")
def get_readiness_score(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """ Returns the calculated readiness score with breakdown. """
    return ReadinessController.get_user_readiness(db, current_user.id)

@router.get("/benchmark")
def get_peer_benchmarking(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """ 
    Compares user's 12 eval scores vs average of others targeting same role.
     Percentile rank: 'You scored better than X% of candidates targeting {role}'
    """
    role = current_user.target_role or "Software Engineer"
    
    # 1. Average scores for the same role
    role_avg = db.query(func.avg(InterviewSession.overall_score)).filter(
        InterviewSession.session_type != "dsa", # exclude dsa from general eval avg
        User.id == InterviewSession.user_id,
        User.target_role == role
    ).scalar() or 65.0 # Fallback 65
    
    # 2. User's average 
    user_avg = db.query(func.avg(InterviewSession.overall_score)).filter_by(user_id=current_user.id).scalar() or 0.0
    
    # 3. Percentile (Mocked math for now, would be a statistical distribution in prod)
    lower_count = db.query(func.count(func.distinct(User.id))).join(InterviewSession).\
        group_by(User.id).having(func.avg(InterviewSession.overall_score) < user_avg).count()
    total_users = db.query(func.count(func.distinct(User.id))).count() or 1
    percentile = (lower_count / total_users) * 100
    
    return {
        "role": role,
        "peer_average": round(role_avg, 1),
        "user_average": round(user_avg, 1),
        "percentile_rank": round(percentile, 1),
        "message": f"You scored better than {round(percentile, 1)}% of candidates targeting {role}"
    }
