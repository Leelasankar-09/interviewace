# app/controllers/community_controller.py
from sqlalchemy.orm import Session
from app.repositories.post_repository import PostRepository
from fastapi import HTTPException

class CommunityController:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PostRepository(db)

    def create_post(self, user_id: str, body: dict):
        data = {**body, "user_id": user_id}
        return self.repo.create_post(data)

    def get_posts(self, filters: dict):
        return self.repo.list_posts(**filters)

    def get_post_detail(self, post_id: str):
        post = self.repo.get_post(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        post.view_count += 1
        self.db.commit()
        
        comments = self.repo.get_comments(post_id)
        return {
            "post": post,
            "comments": comments
        }

    def add_comment(self, user_id: str, post_id: str, body: dict):
        data = {**body, "user_id": user_id, "post_id": post_id}
        return self.repo.add_comment(data)

    def vote(self, user_id: str, post_id: str, vote_type: int):
        return self.repo.vote(user_id, post_id, vote_type)
