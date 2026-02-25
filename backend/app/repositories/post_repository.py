# app/repositories/post_repository.py
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.post import Post
from app.models.comment import Comment
from app.models.vote import Vote

class PostRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_post(self, data: dict):
        post = Post(**data)
        self.db.add(post)
        self.db.commit()
        self.db.refresh(post)
        return post

    def list_posts(self, company: str = None, role: str = None, round_type: str = None, flair: str = None, limit: int = 20, offset: int = 0):
        query = self.db.query(Post)
        if company:
            query = query.filter(Post.company == company)
        if role:
            query = query.filter(Post.role == role)
        if round_type:
            query = query.filter(Post.round_type == round_type)
        if flair:
            query = query.filter(Post.flair == flair)
        
        return query.order_by(desc(Post.created_at)).offset(offset).limit(limit).all()

    def get_post(self, post_id: str):
        return self.db.query(Post).filter(Post.id == post_id).first()

    def add_comment(self, data: dict):
        comment = Comment(**data)
        self.db.add(comment)
        self.db.commit()
        self.db.refresh(comment)
        return comment

    def get_comments(self, post_id: str):
        return self.db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()

    def vote(self, user_id: str, post_id: str, vote_type: int):
        # 1. Check if vote exists
        existing = self.db.query(Vote).filter_by(user_id=user_id, post_id=post_id).first()
        post = self.get_post(post_id)
        
        if existing:
            # Change vote
            diff = vote_type - existing.vote_type
            if vote_type == 1:
                post.upvotes += 1
                post.downvotes -= 1
            else:
                post.upvotes -= 1
                post.downvotes += 1
            existing.vote_type = vote_type
        else:
            # New vote
            vote = Vote(user_id=user_id, post_id=post_id, vote_type=vote_type)
            self.db.add(vote)
            if vote_type == 1:
                post.upvotes += 1
            else:
                post.downvotes += 1
        
        self.db.commit()
        return post
