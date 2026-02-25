# app/routes/community.py
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.controllers.community_controller import CommunityController
from app.models.user import User

router = APIRouter(prefix="/community", tags=["community"])

@router.get("/posts")
async def get_posts(
    company: str = None, 
    role: str = None, 
    round_type: str = None, 
    flair: str = None,
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    controller = CommunityController(db)
    filters = {
        "company": company,
        "role": role,
        "round_type": round_type,
        "flair": flair,
        "limit": limit,
        "offset": offset
    }
    posts = controller.get_posts(filters)
    return {"posts": posts}

@router.post("/posts")
async def create_post(
    body: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    controller = CommunityController(db)
    return controller.create_post(current_user.id, body)

@router.get("/posts/{post_id}")
async def get_post(post_id: str, db: Session = Depends(get_db)):
    controller = CommunityController(db)
    return controller.get_post_detail(post_id)

@router.post("/posts/{post_id}/comment")
async def add_comment(
    post_id: str,
    body: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    controller = CommunityController(db)
    return controller.add_comment(current_user.id, post_id, body)

@router.post("/posts/{post_id}/vote")
async def vote_post(
    post_id: str,
    vote_type: int = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    controller = CommunityController(db)
    return controller.vote(current_user.id, post_id, vote_type)
