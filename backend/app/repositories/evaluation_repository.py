# app/repositories/evaluation_repository.py
from sqlalchemy.orm import Session
from app.models.evaluation_session import EvaluationSession
from app.models.interview_session import PracticeStreak
import datetime

class EvaluationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_session(self, data: dict):
        session = EvaluationSession(**data)
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        # Update streak
        today = datetime.date.today()
        streak = self.db.query(PracticeStreak).filter_by(
            user_id=session.user_id, 
            date=today
        ).first()
        
        if streak:
            streak.sessions += 1
        else:
            streak = PracticeStreak(user_id=session.user_id, date=today, sessions=1)
            self.db.add(streak)
        
        self.db.commit()
        return session

    def get_user_history(self, user_id: str, limit: int = 10):
        return self.db.query(EvaluationSession).filter_by(
            user_id=user_id
        ).order_by(EvaluationSession.created_at.desc()).limit(limit).all()
