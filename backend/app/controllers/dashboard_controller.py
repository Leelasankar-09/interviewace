# app/controllers/dashboard_controller.py
from sqlalchemy.orm import Session
from app.repositories.dashboard_repository import DashboardRepository
from app.models.study_plan import ReadinessScore
import datetime

class DashboardController:
    def __init__(self, db: Session):
        self.db = db
        self.repo = DashboardRepository(db)

    def get_dashboard_data(self, user_id: str):
        stats = self.repo.get_overall_stats(user_id)
        weekly = self.repo.get_weekly_stats(user_id)
        calendar = self.repo.get_streak_calendar(user_id)
        
        # Calculate Readiness Score (Live or cached)
        readiness = self.calculate_readiness_score(user_id, stats)
        
        return {
            "readiness_score": readiness,
            "stats": stats,
            "weekly_progress": weekly,
            "streak_calendar": calendar,
            "recent_activity": [] # Placeholder for activity feed
        }

    def calculate_readiness_score(self, user_id: str, stats: dict) -> dict:
        # Heuristic:
        # streak (20%) - capped at 30 days
        # avg eval (30%)
        # problems (20%) - dummy for now
        # ATS (15%)
        # Mocks (15%) - capped at 10
        
        streak_pts = (min(stats['streak'], 30) / 30.0) * 20.0
        eval_pts = (stats['avg_score'] / 100.0) * 30.0
        problem_pts = 10.0 # Dummy constant for now
        ats_pts = (stats['ats_score'] / 100.0) * 15.0
        mock_pts = (min(stats['mock_count'], 10) / 10.0) * 15.0
        
        total = streak_pts + eval_pts + problem_pts + ats_pts + mock_pts
        
        # Save to DB
        readiness = self.db.query(ReadinessScore).filter_by(user_id=user_id).first()
        if not readiness:
            readiness = ReadinessScore(user_id=user_id)
            self.db.add(readiness)
        
        readiness.total_score = round(total, 1)
        readiness.streak_weight = round(streak_pts, 1)
        readiness.evaluation_weight = round(eval_pts, 1)
        readiness.dsa_weight = problem_pts
        readiness.ats_weight = round(ats_pts, 1)
        readiness.mock_weight = round(mock_pts, 1)
        
        self.db.commit()
        
        return {
            "score": readiness.total_score,
            "breakdown": {
                "streak": readiness.streak_weight,
                "evaluation": readiness.evaluation_weight,
                "dsa": readiness.dsa_weight,
                "ats": readiness.ats_weight,
                "mock": readiness.mock_weight
            }
        }
