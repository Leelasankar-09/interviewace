from fastapi import APIRouter
router = APIRouter(prefix="/community", tags=["community"])

@router.get("/posts")
def get_posts(company: str = None, round_type: str = None, page: int = 1):
    return {"posts": [], "total": 0, "page": page}

@router.post("/posts")
def create_post(title: str, body: str, company: str, role: str, round_type: str, flair: str):
    return {"id": 1, "message": "Post created"}

@router.post("/posts/{post_id}/vote")
def vote(post_id: int, vote_type: int):
    return {"upvotes": 0}

@router.get("/posts/{post_id}/comments")
def get_comments(post_id: int):
    return {"comments": []}

@router.post("/posts/{post_id}/comments")
def add_comment(post_id: int, body: str, parent_id: int = None):
    return {"id": 1, "message": "Comment added"}
