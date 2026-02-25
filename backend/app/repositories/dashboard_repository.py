# app/repositories/dashboard_repository.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.interview_session import InterviewSession, PracticeStreak
from app.models.evaluation_session import EvaluationSession
from app.models.resume_scan import ResumeScan
from app.models.user import User
import datetime

class DashboardRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_weekly_stats(self, user_id: str):
        seven_days_ago = datetime.date.today() - datetime.timedelta(days=7)
        
        # Sessions per day
        sessions = self.db.query(
            func.date(PracticeStreak.date).label('day'),
            func.sum(PracticeStreak.sessions).label('count')
        ).filter(
            PracticeStreak.user_id == user_id,
            PracticeStreak.date >= seven_days_ago
        ).group_by(func.date(PracticeStreak.date)).all()
        
        return {str(s.day): s.count for s in sessions}

    def get_overall_stats(self, user_id: str):
        # Average Evaluation Score
        avg_score = self.db.query(func.avg(EvaluationSession.overall_score)).filter(
            EvaluationSession.user_id == user_id
        ).scalar() or 0.0
        
        # Total Mocks
        mock_count = self.db.query(func.count(InterviewSession.id)).filter(
            InterviewSession.user_id == user_id
        ).scalar() or 0
        
        # Latest ATS Score
        latest_ats = self.db.query(ResumeScan.ats_score).filter(
            ResumeScan.user_id == user_id
        ).order_by(ResumeScan.created_at.desc()).first()
        ats_score = latest_ats[0] if latest_ats else 0.0
        
        # Current Streak
        # (Simplified: check consecutive days from today backwards)
        streak = 0
        today = datetime.date.today()
        for i in range(100):
            d = today - datetime.timedelta(days=i)
            exists = self.db.query(PracticeStreak).filter(
                PracticeStreak.user_id == user_id,
                PracticeStreak.date == d,
                PracticeStreak.sessions > 0
            ).first()
            if exists:
                streak += 1
            else:
                if i > 0: # Only break if not today (might work today later)
                    break
        
        return {
            "avg_score": round(avg_score, 1),
            "mock_count": mock_count,
            "ats_score": round(ats_score, 1),
            "streak": streak
        }

    def get_streak_calendar(self, user_id: str, days: int = 70):
        start_date = datetime.date.today() - datetime.timedelta(days=days)
        streaks = self.db.query(PracticeStreak).filter(
            PracticeStreak.user_id == user_id,
            PracticeStreak.date >= start_date
        ).all()
        
        return {str(s.date): s.sessions for s in streaks}
