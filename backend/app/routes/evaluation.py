# app/routes/evaluation.py
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.controllers.evaluation_controller import EvaluationController
from app.models.user import User

router = APIRouter(prefix="/evaluation", tags=["evaluation"])

@router.post("/submit")
async def submit_evaluation(
    data: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    controller = EvaluationController(db)
    return await controller.evaluate_answer(current_user.id, data)

@router.get("/history")
async def get_evaluation_history(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    controller = EvaluationController(db)
    return controller.get_history(current_user.id)
