from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from .base_repository import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_verification_token(self, token: str) -> Optional[User]:
        return self.db.query(User).filter(User.verification_token == token).first()

    def get_by_reset_token(self, token: str) -> Optional[User]:
        return self.db.query(User).filter(User.reset_token == token).first()
