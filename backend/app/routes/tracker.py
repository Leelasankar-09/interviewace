# app/routes/tracker.py
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.controllers.tracker_controller import TrackerController
from app.models.user import User

router = APIRouter(prefix="/tracker", tags=["tracker"])

@router.get("/board")
async def get_kanban_board(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    controller = TrackerController(db)
    return controller.get_board(user.id)

@router.post("/application")
async def add_application(
    body: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    controller = TrackerController(db)
    return controller.add_app(user.id, body)

@router.put("/application/{app_id}/status")
async def update_application_status(
    app_id: str,
    status: str = Body(..., embed=True),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    controller = TrackerController(db)
    return controller.update_stage(user.id, app_id, status)

@router.delete("/application/{app_id}")
async def delete_application(
    app_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    controller = TrackerController(db)
    return controller.delete_app(user.id, app_id)
