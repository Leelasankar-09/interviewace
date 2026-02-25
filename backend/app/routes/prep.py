# app/routes/prep.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.controllers.prep_controller import PrepController
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/prep", tags=["Preparation"])

@router.get("/company")
async def get_company_prep(
    company: str = Query(...),
    role: str = Query("Software Engineer"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    controller = PrepController(db)
    return await controller.get_company_prep_data(company, role)

@router.post("/questions/generate")
async def generate_questions(
    data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    controller = PrepController(db)
    return await controller.generate_questions(data)
