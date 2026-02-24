import anthropic
import json
from typing import Iterator

client = anthropic.Anthropic()  # Uses ANTHROPIC_API_KEY from env


# ── ATS Resume Rating ─────────────────────────────────────────────────────────
def rate_resume_ats(resume_text: str, job_description: str = "") -> dict:
    prompt = f"""
You are an expert ATS (Applicant Tracking System) evaluator.

Resume:
{resume_text}

{f'Job Description: {job_description}' if job_description else ''}

Evaluate this resume and return ONLY valid JSON with this exact structure:
{{
  "ats_score": 0-100,
  "sections": {{
    "summary": {{"score": 0-10, "feedback": "...", "rewrite": "..."}},
    "skills": {{"score": 0-10, "feedback": "...", "missing_keywords": ["..."]}},
    "experience": {{"score": 0-10, "feedback": "...", "improved_bullets": ["..."]}},
    "education": {{"score": 0-10, "feedback": "..."}}
  }},
  "keyword_gaps": ["..."],
  "overall_suggestions": ["..."],
  "ats_friendly_tips": ["..."]
}}
"""
    msg = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(msg.content[0].text)


# ── Behavioral / HR Evaluation ────────────────────────────────────────────────
def evaluate_answer(question: str, answer: str, round_type: str) -> dict:
    prompt = f"""
You are a senior interviewer evaluating a candidate's answer.

Round Type: {round_type}
Question: {question}
Candidate's Answer: {answer}

Evaluate and return ONLY valid JSON:
{{
  "overall_score": 0-100,
  "parameters": {{
    "relevance": {{"score": 0-10, "comment": "..."}},
    "star_structure": {{"score": 0-10, "comment": "..."}},
    "clarity": {{"score": 0-10, "comment": "..."}},
    "tone": {{"score": 0-10, "comment": "..."}},
    "depth": {{"score": 0-10, "comment": "..."}},
    "vocabulary": {{"score": 0-10, "comment": "..."}},
    "conciseness": {{"score": 0-10, "comment": "..."}},
    "enthusiasm": {{"score": 0-10, "comment": "..."}}
  }},
  "filler_words": ["..."],
  "power_words": ["..."],
  "strengths": ["..."],
  "improvements": ["..."],
  "sample_answer": "..."
}}
"""
    msg = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(msg.content[0].text)


# ── DSA Code Review ───────────────────────────────────────────────────────────
def review_code(problem: str, code: str, language: str) -> dict:
    prompt = f"""
You are a senior software engineer reviewing code.

Problem: {problem}
Language: {language}
Code:
```{language}
{code}
```

Review and return ONLY valid JSON:
{{
  "correctness": 0-10,
  "time_complexity": "O(...)",
  "space_complexity": "O(...)",
  "bugs": ["..."],
  "edge_cases_missed": ["..."],
  "optimized_solution": "// optimized code here",
  "explanation": "..."
}}
"""
    msg = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(msg.content[0].text)


# ── Mock Interview Streaming ──────────────────────────────────────────────────
def mock_interview_stream(history: list, user_message: str) -> Iterator[str]:
    messages = history + [{"role": "user", "content": user_message}]
    with client.messages.stream(
        model="claude-opus-4-5",
        max_tokens=500,
        system="""You are a senior software engineer at a top tech company conducting a real technical interview. 
        Ask follow-up questions based on candidate answers. Be professional but challenging. 
        Simulate a realistic interview — don't reveal you're an AI unless directly asked.""",
        messages=messages
    ) as stream:
        for text in stream.text_stream:
            yield text
