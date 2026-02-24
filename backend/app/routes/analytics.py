"""
Analytics router — track events, user activity, and platform stats.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel
from typing import Optional
import datetime

from app.core.database import get_db
from app.models.analytics_model import AnalyticsEvent
from app.models.session_model import InterviewSession
from app.models.user_model import User
from app.routes.auth import get_current_user, get_optional_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


class TrackEventRequest(BaseModel):
    event_type: str           # page_view, feature_use, button_click, session_complete
    page: Optional[str] = None
    feature: Optional[str] = None
    meta: Optional[dict] = None
    session_id: Optional[str] = None


@router.post("/event")
def track_event(
    body: TrackEventRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    event = AnalyticsEvent(
        user_id=current_user.id if current_user else None,
        event_type=body.event_type,
        page=body.page,
        feature=body.feature,
        meta=body.meta,
        session_id=body.session_id,
    )
    db.add(event)
    db.commit()
    return {"status": "tracked"}


@router.get("/dashboard")
def user_dashboard(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """User-level analytics: activity heatmap, most-visited pages, feature usage."""
    since = datetime.datetime.now() - datetime.timedelta(days=days)

    events = db.query(AnalyticsEvent).filter(
        AnalyticsEvent.user_id == current_user.id,
        AnalyticsEvent.created_at >= since,
    ).all()

    # Page visit counts
    page_counts: dict = {}
    feature_counts: dict = {}
    daily_activity: dict = {}

    for e in events:
        if e.page:
            page_counts[e.page] = page_counts.get(e.page, 0) + 1
        if e.feature:
            feature_counts[e.feature] = feature_counts.get(e.feature, 0) + 1
        if e.created_at:
            day = e.created_at.strftime("%Y-%m-%d")
            daily_activity[day] = daily_activity.get(day, 0) + 1

    top_pages = sorted(page_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_features = sorted(feature_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        "total_events": len(events),
        "top_pages": [{"page": p, "count": c} for p, c in top_pages],
        "top_features": [{"feature": f, "count": c} for f, c in top_features],
        "daily_activity": [{"date": d, "count": c} for d, c in sorted(daily_activity.items())],
    }


@router.get("/platform")
def platform_stats(db: Session = Depends(get_db)):
    """Overall platform stats (public)."""
    total_users = db.query(User).count()
    total_sessions = db.query(InterviewSession).count()
    total_events = db.query(AnalyticsEvent).count()

    # Sessions by type
    type_counts = db.query(
        InterviewSession.session_type,
        func.count(InterviewSession.id)
    ).group_by(InterviewSession.session_type).all()

    # Average score overall
    avg_score_row = db.query(func.avg(InterviewSession.overall_score)).scalar()
    avg_score = round(float(avg_score_row), 1) if avg_score_row else 0

    return {
        "total_users": total_users,
        "total_sessions": total_sessions,
        "total_events": total_events,
        "sessions_by_type": {t: c for t, c in type_counts},
        "avg_score": avg_score,
    }
