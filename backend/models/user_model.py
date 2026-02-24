from sqlalchemy import Column, String, Text, DateTime, Float, Integer, Boolean
from sqlalchemy.sql import func
from database import Base
import uuid


def _uuid():
    return uuid.uuid4().hex


class User(Base):
    __tablename__ = "users"

    id            = Column(String(32), primary_key=True, default=_uuid)
    name          = Column(String(120),  nullable=False)
    email         = Column(String(255),  nullable=False, unique=True, index=True)
    password_hash     = Column(String(255),  nullable=False)
    role              = Column(String(20),   default="user", index=True)  # user, admin, premium
    hashed_refresh_token = Column(String(255), nullable=True)
    bio               = Column(Text,         nullable=True)
    target_role       = Column(String(120),  nullable=True)
    target_companies  = Column(Text,         nullable=True)  # Comma separated
    college           = Column(String(200),  nullable=True)
    cgpa              = Column(String(10),   nullable=True)
    
    # Social Links
    linkedin_url      = Column(String(300),  nullable=True)
    github_url        = Column(String(300),  nullable=True)
    portfolio_url     = Column(String(300),  nullable=True)
    twitter_url       = Column(String(300),  nullable=True)
    avatar_url        = Column(Text,         nullable=True)
    
    # Platform Usernames
    leetcode_username   = Column(String(100),  nullable=True)
    codeforces_username = Column(String(100),  nullable=True)
    codechef_username   = Column(String(100),  nullable=True)
    gfg_username        = Column(String(100),  nullable=True)
    hackerrank_username = Column(String(100),  nullable=True)
    atcoder_username    = Column(String(100),  nullable=True)

    # Privacy Toggles
    is_public           = Column(Boolean,      default=True)
    is_college_public   = Column(Boolean,      default=True)
    is_cgpa_public      = Column(Boolean,      default=True)
    is_scores_public    = Column(Boolean,      default=True)
    is_streak_public    = Column(Boolean,      default=True)
    is_email_public     = Column(Boolean,      default=False)
    
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())
