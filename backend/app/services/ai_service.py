import os
import json
import logging
from typing import Optional, Dict, Any
from anthropic import Anthropic
from .nlp_service import evaluate_answer as local_nlp_eval

logger = logging.getLogger(__name__)

from anthropic import Anthropic
from tenacity import retry, stop_after_attempt, wait_exponential
from .nlp_service import evaluate_answer as local_nlp_eval

logger = logging.getLogger(__name__)

from app.utils import prompt_templates
from app.core.database import get_redis
import hashlib

class AIService:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.client = Anthropic(api_key=self.api_key) if self.api_key else None
        self.model = "claude-3-5-sonnet-20240620"
        self.redis = get_redis()

    def _get_cache_key(self, system: str, prompt: str) -> str:
        """Generates a stable cache key for a given input."""
        combined = f"{system}:{prompt}".encode('utf-8')
        return f"ai_cache:{hashlib.md5(combined).hexdigest()}"

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def _safe_claude_call(self, system: str, prompt: str, cache_ttl: int = 3600) -> str:
        """Centralized Claude call with retry logic, caching, and safety."""
        # Token optimization: trim whitespace
        prompt = prompt.strip()
        system = system.strip()
        
        # Check Cache
        cache_key = self._get_cache_key(system, prompt)
        try:
            cached = self.redis.get(cache_key)
            if cached:
                logger.info("AI Cache Hit!")
                return cached
        except Exception as e:
            logger.warning(f"AI Cache read failed: {e}")

        if not self.client:
            raise Exception("Anthropic Client not initialized")
        
        logger.info(f"AI Call: Calling {self.model}")
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            temperature=0,
            system=system,
            messages=[{"role": "user", "content": prompt}]
        )
        text = response.content[0].text

        # Store in Cache
        try:
            self.redis.set(cache_key, text, ex=cache_ttl)
        except Exception as e:
            logger.warning(f"AI Cache write failed: {e}")

        return text

    async def evaluate_interview_response(self, question: str, answer: str, context: Optional[str] = None) -> Dict[str, Any]:
        """Deep 12-parameter evaluation using prompt templates and Pydantic validation."""
        local_stats = local_nlp_eval(answer)
        prompt = prompt_templates.EVAL_PROMPT.format(
            question=question,
            answer=answer,
            context_msg=f"CONTEXT: {context}" if context else "",
            fillers=local_stats.get('fillers', []),
            readability=local_stats.get('readability', {})
        )
        
        try:
            raw = await self._safe_claude_call(prompt_templates.EVAL_SYSTEM, prompt)
            data = self._extract_json(raw)
            # Validation
            from app.schemas.ai_schemas import InterviewEvalResponse
            validated = InterviewEvalResponse(**data)
            result = validated.dict()
            result["local_nlp"] = local_stats
            return result
        except Exception as e:
            logger.error(f"AI Eval failed: {e}")
            return self._fallback_eval(question, answer, local_stats)

    async def rate_resume_ats(self, resume_text: str, job_description: str = "") -> Dict[str, Any]:
        """Analyzes resume against ATS standards."""
        prompt = prompt_templates.RESUME_ATS_PROMPT.format(
            resume_text=resume_text,
            job_description=job_description or "General Software Engineering Role"
        )
        try:
            raw = await self._safe_claude_call(prompt_templates.RESUME_ATS_SYSTEM, prompt)
            data = self._extract_json(raw)
            from app.schemas.ai_schemas import ResumeATSResponse
            return ResumeATSResponse(**data).dict()
        except Exception as e:
            logger.error(f"Resume ATS failed: {e}")
            return {"error": "Resume analysis failed", "ats_score": 0}

    async def generate_study_plan(self, target_role: str, timeframe: str = "4 weeks", weak_areas: str = "") -> Dict[str, Any]:
        """Generates a structured study plan."""
        prompt = prompt_templates.STUDY_PLAN_PROMPT.format(
            target_role=target_role,
            timeframe=timeframe,
            weak_areas=weak_areas
        )
        try:
            raw = await self._safe_claude_call(prompt_templates.STUDY_PLAN_SYSTEM, prompt)
            data = self._extract_json(raw)
            from app.schemas.ai_schemas import StudyPlanResponse
            return StudyPlanResponse(**data).dict()
        except Exception as e:
            logger.error(f"Study Plan failed: {e}")
            return {"error": "Study plan generation failed"}

    async def review_code(self, problem: str, code: str, language: str) -> Dict[str, Any]:
        """Provides expert technical code review."""
        prompt = prompt_templates.CODE_REVIEW_PROMPT.format(
            problem=problem,
            code=code,
            language=language
        )
        try:
            raw = await self._safe_claude_call(prompt_templates.CODE_REVIEW_SYSTEM, prompt)
            data = self._extract_json(raw)
            from app.schemas.ai_schemas import CodeReviewResponse
            return CodeReviewResponse(**data).dict()
        except Exception as e:
            logger.error(f"Code Review failed: {e}")
            return {"error": "Code review failed", "correctness": 0}

    async def evaluate_system_design(self, prompt_text: str, user_answer: str) -> Dict[str, Any]:
        """Evaluates system design architecture and trade-offs."""
        prompt = prompt_templates.SYSTEM_DESIGN_PROMPT.format(
            prompt=prompt_text,
            user_answer=user_answer
        )
        try:
            raw = await self._safe_claude_call(prompt_templates.SYSTEM_DESIGN_SYSTEM, prompt)
            data = self._extract_json(raw)
            from app.schemas.ai_schemas import SystemDesignResponse
            return SystemDesignResponse(**data).dict()
        except Exception as e:
            logger.error(f"System Design eval failed: {e}")
            return {"error": "System design evaluation unavailable"}

    async def evaluate_behavioral(self, question: str, answer: str) -> Dict[str, Any]:
        """Scores behavioral answers based on STAR logic."""
        prompt = prompt_templates.BEHAVIORAL_PROMPT.format(
            question=question,
            answer=answer
        )
        try:
            raw = await self._safe_claude_call(prompt_templates.BEHAVIORAL_SYSTEM, prompt)
            data = self._extract_json(raw)
            from app.schemas.ai_schemas import BehavioralResponse
            return BehavioralResponse(**data).dict()
        except Exception as e:
            logger.error(f"Behavioral eval failed: {e}")
            return {"error": "Behavioral evaluation unavailable"}

    async def generate_cover_letter(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """Generates a tailored cover letter."""
        prompt = prompt_templates.COVER_LETTER_PROMPT.format(
            resume_text=resume_text,
            job_description=job_description
        )
        try:
            raw = await self._safe_claude_call(prompt_templates.COVER_LETTER_SYSTEM, prompt)
            data = self._extract_json(raw)
            from app.schemas.ai_schemas import CoverLetterResponse
            return CoverLetterResponse(**data).dict()
        except Exception as e:
            logger.error(f"Cover Letter failed: {e}")
            return {"error": "Cover letter generation failed"}

    async def optimize_linkedin_profile(self, headline: str, summary: str, role: str) -> Dict[str, Any]:
        """Rewrites LinkedIn branding elements."""
        prompt = prompt_templates.LINKEDIN_OPTIMIZE_PROMPT.format(
            headline=headline,
            summary=summary,
            role=role
        )
        try:
            raw = await self._safe_claude_call(prompt_templates.LINKEDIN_OPTIMIZE_SYSTEM, prompt)
            data = self._extract_json(raw)
            from app.schemas.ai_schemas import LinkedInOptimizeResponse
            return LinkedInOptimizeResponse(**data).dict()
        except Exception as e:
            logger.error(f"LinkedIn Optimize failed: {e}")
            return {"error": "LinkedIn optimization failed"}

    async def get_company_preparation(self, company_name: str, role: str) -> Dict[str, Any]:
        """Fetches company-specific interview data."""
        prompt = prompt_templates.COMPANY_PREP_PROMPT.format(
            company_name=company_name,
            role=role
        )
        try:
            raw = await self._safe_claude_call(prompt_templates.COMPANY_PREP_SYSTEM, prompt)
            data = self._extract_json(raw)
            # Reusing a simple dict here or define a schema if needed
            return data
        except Exception as e:
            logger.error(f"Company Prep failed: {e}")
            return {"error": "Company data unavailable"}

    async def generate_questions(self, role: str, type: str, level: str, count: int = 5, company: str = "Any", topics: str = "") -> Dict[str, Any]:
        """Generates fresh interview questions."""
        prompt = prompt_templates.QUESTION_GEN_PROMPT.format(
            role=role, type=type, level=level, count=count, company=company, topics=topics
        )
        try:
            raw = await self._safe_claude_call(prompt_templates.QUESTION_GEN_SYSTEM, prompt)
            data = self._extract_json(raw)
            from app.schemas.ai_schemas import QuestionGenResponse
            return QuestionGenResponse(**data).dict()
        except Exception as e:
            logger.error(f"Question Generation failed: {e}")
            return {"questions": []}

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Helper to safely extract JSON from Claude's markdown-heavy response."""
        try:
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            return json.loads(text)
        except Exception:
            # Last resort: try to find the first '{' and last '}'
            start = text.find('{')
            end = text.rfind('}')
            if start != -1 and end != -1:
                return json.loads(text[start:end+1])
            raise ValueError("No valid JSON found in AI response")

    def _fallback_eval(self, question: str, answer: str, local_stats: Optional[Dict] = None) -> Dict[str, Any]:
        """Simple fallback if AI is unavailable."""
        stats = local_stats or local_nlp_eval(answer)
        scores_10 = stats.get("scores_10", {})
        return {
            "overall_score": stats.get("overall_score", 0),
            "scores": {
                "relevance": scores_10.get("relevance", 5.0),
                "star": scores_10.get("star_structure", 5.0),
                "clarity": scores_10.get("clarity", 5.0),
                "tone": scores_10.get("tone", 5.0),
                "depth": 5.0, "specificity": 5.0,
                "vocabulary": scores_10.get("vocabulary", 5.0),
                "impact": 5.0, 
                "filler_control": 10.0 - (stats.get("filler_penalty_applied", 0) * 2),
                "pacing": 5.0, "conciseness": 5.0, "enthusiasm": 5.0
            },
            "feedback": {
                "strengths": stats.get("strengths", []),
                "improvements": stats.get("improvements", []),
                "ai_summary": "Evaluation performed using local engine (AI fallback)."
            },
            "star_analysis": {"situation": "", "task": "", "action": "", "result": ""},
            "local_nlp": stats
        }

ai_service = AIService()

# ── Top-level Wrappers (for Legacy Router Support) ────────────
async def review_code(problem: str, code: str, language: str):
    return await ai_service.review_code(problem, code, language)

async def evaluate_interview_response(question: str, answer: str, context: Optional[str] = None):
    return await ai_service.evaluate_interview_response(question, answer, context)

evaluate_answer = evaluate_interview_response # Alias

async def rate_resume_ats(resume_text: str, job_description: str = ""):
    return await ai_service.rate_resume_ats(resume_text, job_description)

def mock_interview_stream(history: list, user_message: str):
    messages = history + [{"role": "user", "content": user_message}]
    if not ai_service.client:
        yield "AI Simulator unavailable."
        return

    with ai_service.client.messages.stream(
        model=ai_service.model,
        max_tokens=600,
        system=prompt_templates.MOCK_INTERVIEW_SYSTEM,
        messages=messages
    ) as stream:
        for text in stream.text_stream:
            yield text
