# app/models/user.py
from sqlalchemy import Column, String, Text, DateTime, Float, Integer, Boolean, JSON
from sqlalchemy.sql import func
from .base import Base

class User(Base):
    __tablename__ = "users"

    name          = Column(String(120),  nullable=False)
    email         = Column(String(255),  nullable=False, unique=True, index=True)
    password_hash = Column(String(255),  nullable=False)
    role          = Column(String(20),   default="user", index=True)  # user, admin, moderator
    
    # Session Management
    hashed_refresh_token = Column(String(255), nullable=True)
    
    # Profile Information
    bio              = Column(Text,          nullable=True)
    target_role      = Column(String(120),   nullable=True)
    target_companies = Column(JSON,          nullable=True)
    college          = Column(String(200),   nullable=True)
    cgpa             = Column(String(10),    nullable=True)
    graduation_year  = Column(Integer,       nullable=True)
    avatar_url       = Column(Text,          nullable=True)
    
    # Social Links
    linkedin_url     = Column(String(300),   nullable=True)
    github_url       = Column(String(300),   nullable=True)
    portfolio_url    = Column(String(300),   nullable=True)
    twitter_url      = Column(String(300),   nullable=True)
    
    # Platform Usernames
    leetcode_username   = Column(String(100), nullable=True)
    codeforces_username = Column(String(100), nullable=True)
    codechef_username   = Column(String(100), nullable=True)
    gfg_username        = Column(String(100), nullable=True)
    hackerrank_username = Column(String(100), nullable=True)
    atcoder_username    = Column(String(100), nullable=True)

    # Privacy Toggles
    is_college_public   = Column(Boolean,     default=True)
    is_cgpa_public      = Column(Boolean,     default=True)
    is_scores_public    = Column(Boolean,     default=True)
    is_streak_public    = Column(Boolean,     default=True)
    is_email_public     = Column(Boolean,     default=False)
    
    # Security, Verification & Status
    is_verified           = Column(Boolean,  default=False)
    is_active             = Column(Boolean,  default=True)
    last_login            = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer,   default=0)
    lockout_until         = Column(DateTime, nullable=True)
    verification_token    = Column(String,   nullable=True)
    reset_token           = Column(String,   nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "bio": self.bio or "",
            "target_role": self.target_role or "",
            "college": self.college or "",
            "cgpa": self.cgpa or "",
            "avatar_url": self.avatar_url or "",
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
