from fastapi import APIRouter
from pydantic import BaseModel
import json

router = APIRouter(prefix="/questions", tags=["questions"])

# ─── Question bank (local fallback) ──────────────────────────
QUESTION_BANK = {
    "DSA / Coding": {
        "Easy":   ["Two Sum", "Valid Parentheses", "Reverse Linked List", "Merge Sorted Arrays"],
        "Medium": ["Longest Substring Without Repeating", "LRU Cache", "Number of Islands", "Clone Graph", "Coin Change"],
        "Hard":   ["Median of Two Sorted Arrays", "Trapping Rain Water", "N-Queens", "Word Ladder II"],
    },
    "System Design": {
        "Medium": ["Design URL Shortener", "Design Rate Limiter", "Design Pastebin"],
        "Hard":   ["Design Instagram", "Design Uber", "Design WhatsApp", "Design YouTube"],
    },
    "Behavioral / HR": {
        "Easy":   ["Tell me about yourself", "Why this company?", "Greatest strengths?"],
        "Medium": ["Challenging project?", "Conflict with teammate?", "Missed deadline?"],
        "Hard":   ["Leadership under pressure?", "Ethical dilemma at work?"],
    },
}


class GenerateRequest(BaseModel):
    role: str
    type: str
    level: str
    company: str = "Any"
    count: int = 5
    topics: str = ""
    useAI: bool = False


@router.post("/generate")
def generate_questions(body: GenerateRequest):
    """
    Generate interview questions.
    If ANTHROPIC_API_KEY is set and useAI=True, use Claude.
    Otherwise return from local bank.
    """
    import os
    if body.useAI and os.getenv("ANTHROPIC_API_KEY"):
        return _generate_with_ai(body)
    return _generate_local(body)


def _generate_local(body: GenerateRequest) -> dict:
    import random
    level_map = {
        "Fresher / Entry": "Easy",
        "Mid-Level (2-4 yrs)": "Medium",
        "Senior (5+ yrs)":    "Hard",
    }
    diff = level_map.get(body.level, "Medium")
    bank = QUESTION_BANK.get(body.type, {})

    pool = []
    for d in ["Easy", "Medium", "Hard"]:
        if body.level == "Fresher / Entry" and d == "Hard":
            continue
        if body.level == "Senior (5+ yrs)" and d == "Easy":
            continue
        pool += [{"q": q, "diff": d, "tag": body.type} for q in bank.get(d, [])]

    random.shuffle(pool)
    questions = pool[:body.count]
    return {"questions": questions, "source": "local", "total": len(questions)}


def _generate_with_ai(body: GenerateRequest) -> dict:
    import anthropic, os
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    prompt = f"""
You are an expert technical interviewer. Generate exactly {body.count} interview questions.

Configuration:
- Role: {body.role}
- Question Type: {body.type}
- Experience Level: {body.level}
- Target Company Style: {body.company}
{f'- Required Topics: {body.topics}' if body.topics else ''}

Return ONLY valid JSON in this exact format (no markdown):
{{
  "questions": [
    {{
      "q": "Full question text here",
      "hint": "Key concepts or approach hint",
      "tag": "Main topic tag",
      "diff": "Easy|Medium|Hard"
    }}
  ]
}}
"""
    msg = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}],
    )
    result = json.loads(msg.content[0].text)
    result["source"] = "claude-ai"
    return result


@router.get("/topics")
def get_topics(type: str = "DSA / Coding"):
    bank = QUESTION_BANK.get(type, {})
    return {"topics": list(bank.keys()), "type": type}


@router.get("/bank")
def get_question_bank():
    return {"types": list(QUESTION_BANK.keys())}
