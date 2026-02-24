from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict
import datetime

from database import get_db
from models.user_model import User
from models.session_model import InterviewSession, PracticeStreak
from routers.auth import get_current_user

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
    from models.analytics_model import ResumeAnalysis
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
