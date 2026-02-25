# app/controllers/prep_controller.py
from sqlalchemy.orm import Session
from app.services.ai_service import ai_service
from fastapi import HTTPException

class PrepController:
    def __init__(self, db: Session):
        self.db = db

    async def get_company_prep_data(self, company_name: str, role: str):
        try:
            return await ai_service.get_company_preparation(company_name, role)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch company data: {str(e)}")

    async def generate_questions(self, data: dict):
        try:
            return await ai_service.generate_questions(
                role=data.get("role", "Software Engineer"),
                type=data.get("type", "Technical"),
                level=data.get("level", "Mid-level"),
                count=data.get("count", 5),
                company=data.get("company", "Any"),
                topics=data.get("topics", "")
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")
