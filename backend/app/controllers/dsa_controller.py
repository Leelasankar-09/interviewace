# app/controllers/dsa_controller.py
from sqlalchemy.orm import Session
from app.models.problem import Problem
from app.services.ai_service import ai_service
from app.schemas.dsa import DSASubmissionRequest

class DSAController:
    def __init__(self, db: Session):
        self.db = db

    def list_problems(self, topic: str = None, difficulty: str = None):
        query = self.db.query(Problem)
        if topic:
            query = query.filter(Problem.topic == topic)
        if difficulty:
            query = query.filter(Problem.difficulty == difficulty)
        return query.all()

    def get_problem(self, problem_id: str):
        return self.db.query(Problem).filter(Problem.id == problem_id).first()

    async def submit_solution(self, user_id: str, body: DSASubmissionRequest):
        problem = self.get_problem(body.problem_id)
        if not problem:
            raise Exception("Problem not found")
        
        # Call AI for review
        review = await ai_service.review_code(
            problem=problem.title + ": " + problem.description,
            code=body.code,
            language=body.language
        )
        
        # Update streak
        from app.models.interview_session import PracticeStreak
        import datetime
        today = datetime.date.today()
        streak = self.db.query(PracticeStreak).filter_by(user_id=user_id, date=today).first()
        if streak:
            streak.sessions += 1
        else:
            streak = PracticeStreak(user_id=user_id, date=today, sessions=1)
            self.db.add(streak)
        
        self.db.commit()
        
        # In a real app, we'd save this to a DSASubmissions table
        return review
