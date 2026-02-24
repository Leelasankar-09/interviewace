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

class AIService:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.client = Anthropic(api_key=self.api_key) if self.api_key else None
        self.model = "claude-3-5-sonnet-20240620"

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def _safe_claude_call(self, system: str, prompt: str) -> str:
        """Centralized Claude call with retry logic and safety."""
        if not self.client:
            raise Exception("Anthropic Client not initialized")
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            temperature=0,
            system=system,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text

    async def evaluate_interview_response(self, question: str, answer: str, context: Optional[str] = None) -> Dict[str, Any]:
        """Performs a deep 12-parameter evaluation."""
        if not self.client:
            return self._fallback_eval(question, answer)

        local_stats = local_nlp_eval(answer)
        prompt = f"""
        Evaluate the following interview response based on 12 parameters.
        QUESTION: {question}
        ANSWER: {answer}
        {f'CONTEXT: {context}' if context else ''}

        Return a JSON object with overall_score (0-100), scores (12 params 0.0-10.0), 
        feedback (strengths, improvements, ai_summary), and star_analysis.
        Integrate: Fillers={local_stats.get('fillers', [])}, Readability={local_stats.get('readability', {})}
        """

        try:
            raw_content = await self._safe_claude_call("You are a strict technical recruiter. Return JSON only.", prompt)
            if "```json" in raw_content:
                raw_content = raw_content.split("```json")[1].split("```")[0].strip()
            
            result = json.loads(raw_content)
            result["local_nlp"] = local_stats
            return result
        except Exception as e:
            logger.error(f"AI Evaluation failed: {e}")
            return self._fallback_eval(question, answer, local_stats)

    async def rate_resume_ats(self, resume_text: str, job_description: str = "") -> Dict[str, Any]:
        """Analyzes resume against ATS standards and specific JD."""
        system = "You are an ATS (Applicant Tracking System) expert. Analyze the resume professionally. Return JSON only."
        prompt = f"""
        RESUME: {resume_text}
        JOB DESCRIPTION: {job_description or 'General Software Engineering Role'}

        Return a JSON object with:
        - ats_score: 0-100
        - matching_keywords: list
        - missing_keywords: list
        - formatting_issues: list
        - section_analysis: {{ experience: score, projects: score, skills: score }}
        - suggestions: [ list of actionable tips ]
        - summary: "Executive summary of the candidate suitability"
        """
        try:
            raw = await self._safe_claude_call(system, prompt)
            if "```json" in raw: raw = raw.split("```json")[1].split("```")[0].strip()
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Resume ATS failed: {e}")
            return {"error": "AI analysis unavailable", "ats_score": 0}

    async def generate_study_plan(self, target_role: str, timeframe: str = "4 weeks", current_skills: str = "") -> Dict[str, Any]:
        """Generates a structured weekly study plan."""
        system = "You are an expert career coach. Plan a highly structured, professional study curriculum. Return JSON only."
        prompt = f"""
        TARGET ROLE: {target_role}
        TIMEFRAME: {timeframe}
        CURRENT SKILLS: {current_skills}

        Return a JSON object with:
        - title: "Plan title"
        - weekly_milestones: [
            {{ week: 1, focus: "...", tasks: [...], resource_links: [...] }},
            ...
          ]
        - readiness_checkpoints: [ list of goals ]
        - difficulty_curve: "Description of the plan intensity"
        """
        try:
            raw = await self._safe_claude_call(system, prompt)
            if "```json" in raw: raw = raw.split("```json")[1].split("```")[0].strip()
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Study Plan failed: {e}")
            return {"error": "AI Plan generator unavailable"}

    async def get_company_preparation(self, company_name: str, role: str) -> Dict[str, Any]:
        """Provides company-specific interview insights."""
        system = "You are a professional recruiter with deep knowledge of top-tier company interview loops. Return JSON only."
        prompt = f"""
        COMPANY: {company_name}
        ROLE: {role}

        Return a JSON object with:
        - interview_rounds: [ list of typical rounds ]
        - core_values: [ company values/leadership principles ]
        - key_focus_areas: [ what they care about most ]
        - common_questions: [ typical behavioral/technical questions ]
        - insider_tips: [ specific advice for this company ]
        """
        try:
            raw = await self._safe_claude_call(system, prompt)
            if "```json" in raw: raw = raw.split("```json")[1].split("```")[0].strip()
            return json.loads(raw)
        except Exception as e:
            logger.error(f"Company Prep failed: {e}")
            return {"error": "Company data currently unavailable"}

    def _fallback_eval(self, question: str, answer: str, local_stats: Optional[Dict] = None) -> Dict[str, Any]:
        # ... (rest of old code)
        """Simple fallback if AI is unavailable."""
        stats = local_stats or local_nlp_eval(answer)
        scores_10 = stats.get("scores_10", {})
        
        # Map local 8 scores to 12 parameters tentatively
        return {
            "overall_score": stats.get("overall_score", 0) / 10,
            "scores": {
                "clarity": scores_10.get("clarity", 5.0),
                "pace": 5.0, # Placeholder
                "tone": scores_10.get("tone", 5.0),
                "filler_words": 10.0 - (stats.get("filler_penalty_applied", 0) * 2),
                "technical_accuracy": 5.0,
                "problem_solving": 5.0,
                "star_method": scores_10.get("star_structure", 5.0),
                "soft_skills": 5.0,
                "domain_knowledge": 5.0,
                "consistency": 5.0,
                "relevancy": scores_10.get("relevance", 5.0),
                "grammar_vocab": scores_10.get("vocabulary", 5.0)
            },
            "feedback": {
                "strengths": stats.get("strengths", []),
                "improvements": stats.get("improvements", []),
                "ai_summary": "Evaluation performed using local NLP engine (AI fallback)."
            },
            "local_nlp": stats
        }

ai_service = AIService()
