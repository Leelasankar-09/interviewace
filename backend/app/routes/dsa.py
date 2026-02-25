# app/routes/dsa.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.controllers.dsa_controller import DSAController
from app.schemas.dsa import DSASubmissionRequest, ProblemRead
from app.models.user import User

router = APIRouter(prefix="/dsa", tags=["dsa"])

@router.get("/problems")
async def get_problems(
    topic: str = None, 
    difficulty: str = None, 
    db: Session = Depends(get_db)
):
    controller = DSAController(db)
    return controller.list_problems(topic, difficulty)

@router.get("/problems/{problem_id}")
async def get_problem(problem_id: str, db: Session = Depends(get_db)):
    controller = DSAController(db)
    return controller.get_problem(problem_id)

@router.post("/submit")
async def submit_solution(
    body: DSASubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    controller = DSAController(db)
    return await controller.submit_solution(current_user.id, body)
