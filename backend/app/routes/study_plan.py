# app/routes/study_plan.py
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.controllers.study_plan_controller import StudyPlanController
from app.models.user import User

router = APIRouter(prefix="/study-plan", tags=["study-plan"])

@router.post("/generate")
async def generate_study_plan(
    body: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    controller = StudyPlanController(db)
    return await controller.generate_plan(user.id, body.get("role"), body.get("target_date"))

@router.get("/latest")
async def get_latest_plan(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    controller = StudyPlanController(db)
    return controller.get_latest_plan(user.id)
