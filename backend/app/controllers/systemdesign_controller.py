# app/controllers/systemdesign_controller.py
from sqlalchemy.orm import Session
from app.controllers.evaluation_controller import EvaluationController

class SystemDesignController(EvaluationController):
    async def process_system_design(self, user_id: str, data: dict):
        data["round_type"] = "System Design"
        return await self.evaluate_answer(user_id, data)
