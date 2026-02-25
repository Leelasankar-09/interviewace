# app/controllers/behavioral_controller.py
from sqlalchemy.orm import Session
from app.controllers.evaluation_controller import EvaluationController

class BehavioralController(EvaluationController):
    async def process_behavioral_answer(self, user_id: str, data: dict):
        data["round_type"] = "Behavioral"
        return await self.evaluate_answer(user_id, data)
