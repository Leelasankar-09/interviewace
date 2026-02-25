# app/routes/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.controllers.dashboard_controller import DashboardController
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("")
async def get_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    controller = DashboardController(db)
    return controller.get_dashboard_data(user.id)

@router.get("/benchmark")
async def get_benchmark(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Peer benchmarking - simple mock for now as requested
    role = current_user.target_role or "Software Engineer"
    return {
        "role": role,
        "peer_average": 68.5,
        "user_average": 73.2,
        "percentile_rank": 68,
        "message": f"Better than 68% targeting {role}"
    }

@router.get("/charts")
async def get_charts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Skill radar chart data
    return {
        "radar": [
            {"subject": "DSA", "user": 65, "target": 85},
            {"subject": "System Design", "user": 45, "target": 75},
            {"subject": "Behavioral", "user": 90, "target": 80},
            {"subject": "HR", "user": 80, "target": 85},
            {"subject": "Vocabulary", "user": 72, "target": 80},
        ],
        "platforms": [
            {"name": "LeetCode", "value": 45},
            {"name": "Codeforces", "value": 15},
            {"name": "GFG", "value": 25},
            {"name": "HackerRank", "value": 10},
        ]
    }
