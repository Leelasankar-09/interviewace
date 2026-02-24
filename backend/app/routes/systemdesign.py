from fastapi import APIRouter
router = APIRouter(prefix="/system-design", tags=["system-design"])

@router.get("/prompts")
def get_prompts():
    return {"prompts": ["Design Twitter", "Design Uber", "Design YouTube", "Design Notification System"]}

@router.post("/evaluate")
def evaluate(prompt: str, answer: str):
    return {"result": "pending"}
