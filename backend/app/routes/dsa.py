"""
DSA router — problems list, AI code review, submission persistence.
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional, List
import uuid

from app.core.database import get_db
from app.models.analytics_model import DSAProblem, DSASubmission
from app.models.session_model import InterviewSession, PracticeStreak
from app.routes.auth import get_current_user, get_optional_user
from app.models.user_model import User
from app.services.ai_service import review_code
import datetime

router = APIRouter(prefix="/dsa", tags=["dsa"])

# ── Seed problems (inserted on first call if DB empty) ──────────────────────
SEED_PROBLEMS = [
    {"title": "Two Sum", "slug": "two-sum", "difficulty": "Easy", "topic": "Arrays",
     "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
     "examples": [{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"}],
     "constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9",
     "companies": ["Google", "Amazon", "Meta"]},
    {"title": "Valid Parentheses", "slug": "valid-parentheses", "difficulty": "Easy", "topic": "Stack",
     "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
     "examples": [{"input": "s = \"()[]{}\"", "output": "true"}],
     "constraints": "1 <= s.length <= 10^4",
     "companies": ["Google", "Microsoft"]},
    {"title": "Reverse Linked List", "slug": "reverse-linked-list", "difficulty": "Easy", "topic": "Linked List",
     "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
     "examples": [{"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"}],
     "constraints": "0 <= n <= 5000",
     "companies": ["Amazon", "Microsoft"]},
    {"title": "Longest Substring Without Repeating Characters", "slug": "longest-substring", "difficulty": "Medium", "topic": "Sliding Window",
     "description": "Given a string s, find the length of the longest substring without repeating characters.",
     "examples": [{"input": "s = \"abcabcbb\"", "output": "3"}],
     "constraints": "0 <= s.length <= 5 * 10^4",
     "companies": ["Google", "Amazon", "Adobe"]},
    {"title": "Number of Islands", "slug": "number-of-islands", "difficulty": "Medium", "topic": "BFS/DFS",
     "description": "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
     "examples": [{"input": "grid = [[1,1,0],[0,1,0],[0,0,1]]", "output": "2"}],
     "constraints": "m == grid.length, n == grid[i].length",
     "companies": ["Amazon", "Google", "Bloomberg"]},
    {"title": "LRU Cache", "slug": "lru-cache", "difficulty": "Medium", "topic": "Design",
     "description": "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
     "examples": [{"input": "capacity = 2", "output": "use get/put methods"}],
     "constraints": "1 <= capacity <= 3000",
     "companies": ["Amazon", "Microsoft", "Google"]},
    {"title": "Coin Change", "slug": "coin-change", "difficulty": "Medium", "topic": "Dynamic Programming",
     "description": "Given an integer array coins and an integer amount, return the fewest number of coins that you need to make up that amount.",
     "examples": [{"input": "coins = [1,5,2], amount = 11", "output": "3"}],
     "constraints": "1 <= coins.length <= 12",
     "companies": ["Amazon", "Apple"]},
    {"title": "Trapping Rain Water", "slug": "trapping-rain-water", "difficulty": "Hard", "topic": "Two Pointers",
     "description": "Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.",
     "examples": [{"input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6"}],
     "constraints": "n == height.length, 0 <= height[i] <= 10^5",
     "companies": ["Google", "Amazon", "Meta"]},
    {"title": "Median of Two Sorted Arrays", "slug": "median-two-sorted-arrays", "difficulty": "Hard", "topic": "Binary Search",
     "description": "Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.",
     "examples": [{"input": "nums1 = [1,3], nums2 = [2]", "output": "2.0"}],
     "constraints": "0 <= nums1.length <= 1000",
     "companies": ["Google", "Amazon", "Apple"]},
    {"title": "Clone Graph", "slug": "clone-graph", "difficulty": "Medium", "topic": "BFS/DFS",
     "description": "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.",
     "examples": [{"input": "adjList = [[2,4],[1,3],[2,4],[1,3]]", "output": "[[2,4],[1,3],[2,4],[1,3]]"}],
     "constraints": "The number of nodes in the graph is in the range [0, 100].",
     "companies": ["Facebook", "Amazon"]},
]


def _seed_problems(db: Session):
    if db.query(DSAProblem).count() == 0:
        for p in SEED_PROBLEMS:
            db.add(DSAProblem(
                title=p["title"], slug=p["slug"], difficulty=p["difficulty"],
                topic=p["topic"], description=p["description"],
                examples=p.get("examples"), constraints=p.get("constraints"),
                companies=p.get("companies"),
            ))
        db.commit()


def _upsert_streak(user_id: str, db: Session):
    today = datetime.date.today().isoformat()
    row = db.query(PracticeStreak).filter_by(user_id=user_id, date=today).first()
    if row:
        row.sessions += 1
    else:
        from app.models.session_model import PracticeStreak as PS
        db.add(PS(user_id=user_id, date=today, sessions=1))
    db.commit()


class SubmitRequest(BaseModel):
    problem_id: Optional[str] = None
    problem_title: str = ""
    code: str
    language: str = "python"


@router.get("/problems")
def get_problems(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
):
    _seed_problems(db)
    q = db.query(DSAProblem)
    if topic:
        q = q.filter(DSAProblem.topic == topic)
    if difficulty:
        q = q.filter(DSAProblem.difficulty == difficulty)
    total = q.count()
    problems = q.offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "problems": [
            {
                "id": p.id, "title": p.title, "slug": p.slug,
                "difficulty": p.difficulty, "topic": p.topic,
                "companies": p.companies or [],
            }
            for p in problems
        ],
    }


@router.get("/problems/{slug}")
def get_problem(slug: str, db: Session = Depends(get_db)):
    _seed_problems(db)
    p = db.query(DSAProblem).filter(DSAProblem.slug == slug).first()
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")
    return {
        "id": p.id, "title": p.title, "slug": p.slug,
        "difficulty": p.difficulty, "topic": p.topic,
        "description": p.description, "examples": p.examples,
        "constraints": p.constraints, "hints": p.hints, "companies": p.companies,
    }


@router.post("/submit")
def submit_code(
    body: SubmitRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    # Fetch problem title if ID provided
    problem_title = body.problem_title
    if body.problem_id:
        p = db.query(DSAProblem).filter(DSAProblem.id == body.problem_id).first()
        if p:
            problem_title = p.title

    # AI code review
    try:
        ai_result = review_code(problem_title or "Coding Problem", body.code, body.language)
        score = ai_result.get("correctness", 5) * 10
        status = "passed" if score >= 60 else "failed"
    except Exception:
        ai_result = {"error": "AI review unavailable"}
        score = None
        status = "submitted"

    user_id = current_user.id if current_user else None

    submission = DSASubmission(
        user_id=user_id,
        problem_id=body.problem_id,
        problem_title=problem_title,
        language=body.language,
        code=body.code,
        status=status,
        score=score,
        ai_feedback=ai_result,
    )
    db.add(submission)

    if user_id:
        # Also save as InterviewSession for unified history
        session = InterviewSession(
            user_id=user_id,
            session_type="dsa",
            question_text=problem_title,
            answer_text=body.code,
            overall_score=score,
            grade="A" if score and score >= 80 else "B" if score and score >= 60 else "C",
            ai_feedback=str(ai_result.get("explanation", "")),
        )
        db.add(session)
        _upsert_streak(user_id, db)

    db.commit()
    return {"submission_id": submission.id, "status": status, "score": score, "feedback": ai_result}


@router.get("/submissions")
def get_submissions(
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(DSASubmission).filter(
        DSASubmission.user_id == current_user.id
    ).order_by(desc(DSASubmission.created_at))
    total = q.count()
    subs = q.offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "submissions": [
            {
                "id": s.id, "problem_title": s.problem_title,
                "language": s.language, "status": s.status,
                "score": s.score,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in subs
        ],
    }


@router.get("/topics")
def get_topics(db: Session = Depends(get_db)):
    _seed_problems(db)
    topics = db.query(DSAProblem.topic).distinct().all()
    return {"topics": [t[0] for t in topics if t[0]]}
