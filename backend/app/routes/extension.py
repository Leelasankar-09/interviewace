# app/routes/extension.py
from fastapi import APIRouter, Depends, Body
from app.routes.auth import get_current_user
from app.models.user_model import User
from typing import List

router = APIRouter(prefix="/extension", tags=["extension"])

@router.post("/sync")
async def sync_platform_data(
    platform: str = Body(...),
    problems_solved: List[str] = Body(...),
    current_user: User = Depends(get_current_user)
):
    """
    Stub for browser extension sync.
    Accepts: platform (leetcode/codeforces), problems_solved[], date.
    Syncs to user's coding stats in DB.
    """
    # In production, this would update DSASubmission or analytical counters
    return {
        "status": "success",
        "synced": len(problems_solved),
        "platform": platform,
        "message": f"Successfully synced {len(problems_solved)} problems from {platform}"
    }
