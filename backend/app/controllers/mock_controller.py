# app/controllers/mock_controller.py
from sqlalchemy.orm import Session
from app.services.ai_service import ai_service
from app.models.interview_session import InterviewSession
import json

class MockController:
    def __init__(self, db: Session):
        self.db = db

    async def get_response(self, history: list, user_message: str, role: str):
        # This will be used by the WebSocket router to get streaming responses
        # The actual streaming logic will happen in the router using ai_service.mock_interview_stream
        pass

    def save_session(self, user_id: str, data: dict):
        session = InterviewSession(
            user_id=user_id,
            role=data.get("role"),
            company=data.get("company"),
            duration_seconds=data.get("duration_seconds", 0),
            overall_score=data.get("overall_score", 0.0),
            per_category_scores=data.get("per_category_scores", {}),
            conversation_history=data.get("conversation_history", [])
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_history(self, user_id: str):
        return self.db.query(InterviewSession).filter_by(
            user_id=user_id
        ).order_by(InterviewSession.created_at.desc()).all()
