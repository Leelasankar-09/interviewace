from fastapi import APIRouter
router = APIRouter(prefix="/dsa", tags=["dsa"])

@router.get("/problems")
def get_problems(topic: str = None, difficulty: str = None):
    return {"problems": [], "total": 0}

@router.post("/evaluate")
def evaluate_code(problem_id: int, code: str, language: str):
    return {"result": "pending"}
