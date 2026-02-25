# app/repositories/tracker_repository.py
from sqlalchemy.orm import Session
from app.models.interview_tracker import JobApplication

class TrackerRepository:
    def __init__(self, db: Session):
        self.db = db

    def add_application(self, data: dict):
        app = JobApplication(**data)
        self.db.add(app)
        self.db.commit()
        self.db.refresh(app)
        return app

    def list_applications(self, user_id: str):
        return self.db.query(JobApplication).filter_by(user_id=user_id).all()

    def update_status(self, app_id: str, status: str):
        app = self.db.query(JobApplication).filter_by(id=app_id).first()
        if app:
            app.current_status = status
            self.db.commit()
            self.db.refresh(app)
        return app

    def delete_application(self, app_id: str):
        app = self.db.query(JobApplication).filter_by(id=app_id).first()
        if app:
            self.db.delete(app)
            self.db.commit()
        return True
