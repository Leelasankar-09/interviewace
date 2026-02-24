# app/controllers/readiness_controller.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.readiness_model import ReadinessScore
from app.models.session_model import InterviewSession, PracticeStreak
from app.models.analytics_model import DSASubmission, ResumeAnalysis
import datetime

class ReadinessController:
    @staticmethod
    def calculate_readiness(db: Session, user_id: str) -> ReadinessScore:
        # 1. Streak Score (20%) - Cap at 30 days
        # Simple heuristic: count consecutive days with at least 1 session
        today = datetime.date.today()
        streak_count = 0
        for i in range(30):
            d = (today - datetime.timedelta(days=i)).strftime("%Y-%m-%d")
            streak = db.query(PracticeStreak).filter_by(user_id=user_id, date=d).first()
            if streak and streak.sessions > 0:
                streak_count += 1
            else:
                break
        streak_weight = (min(streak_count, 30) / 30.0) * 20.0
        
        # 2. Evaluation Score (30%)
        avg_eval = db.query(func.avg(InterviewSession.overall_score)).filter_by(user_id=user_id).scalar() or 0.0
        evaluation_weight = (avg_eval / 100.0) * 30.0
        
        # 3. DSA Score (20%) - Cap at 50 problems passed
        passed_problems = db.query(func.count(func.distinct(DSASubmission.problem_id))).\
            filter_by(user_id=user_id, status="passed").scalar() or 0
        dsa_weight = (min(passed_problems, 50) / 50.0) * 20.0
        
        # 4. ATS Score (15%) - Latest scan
        latest_ats = db.query(ResumeAnalysis).filter_by(user_id=user_id).order_by(ResumeAnalysis.created_at.desc()).first()
        ats_score = latest_ats.ats_score if latest_ats else 0.0
        ats_weight = (ats_score / 100.0) * 15.0
        
        # 5. Mock Score (15%) - Cap at 10 mocks
        mock_count = db.query(func.count(InterviewSession.id)).filter_by(user_id=user_id, session_type="mock").scalar() or 0
        mock_weight = (min(mock_count, 10) / 10.0) * 15.0
        
        total_score = streak_weight + evaluation_weight + dsa_weight + ats_weight + mock_weight
        
        # Update or Create
        readiness = db.query(ReadinessScore).filter_by(user_id=user_id).first()
        if not readiness:
            readiness = ReadinessScore(user_id=user_id)
            db.add(readiness)
            
        readiness.total_score = round(total_score, 2)
        readiness.streak_weight = round(streak_weight, 2)
        readiness.evaluation_weight = round(evaluation_weight, 2)
        readiness.dsa_weight = round(dsa_weight, 2)
        readiness.ats_weight = round(ats_weight, 2)
        readiness.mock_weight = round(mock_weight, 2)
        readiness.breakdown = {
            "streak_days": streak_count,
            "avg_interview_score": round(avg_eval, 2),
            "dsa_solved": passed_problems,
            "latest_ats": round(ats_score, 2),
            "mocks_completed": mock_count
        }
        
        db.commit()
        db.refresh(readiness)
        return readiness

    @staticmethod
    def get_user_readiness(db: Session, user_id: str) -> ReadinessScore:
        readiness = db.query(ReadinessScore).filter_by(user_id=user_id).first()
        if not readiness:
            return ReadinessController.calculate_readiness(db, user_id)
        return readiness
