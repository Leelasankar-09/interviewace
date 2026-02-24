# app/utils/prompt_templates.py

# ── Authentication & Security ──────────────────────────────────────

# ── Interview Evaluation ───────────────────────────────────────────
EVAL_SYSTEM = "You are a strict technical recruiter. Return JSON only."
EVAL_PROMPT = """
Evaluate the following interview response based on 12 parameters: 
(Relevance, STAR, Clarity, Tone, Depth, Specificity, Vocabulary, Impact, Filler Control, Pacing, Conciseness, Enthusiasm).

QUESTION: {question}
ANSWER: {answer}
{context_msg}

Return a JSON object with:
- overall_score: 0-100
- scores: {{ relevance: 0-10, star: 0-10, clarity: 0-10, ... (all 12) }}
- feedback: {{ strengths: [], improvements: [], ai_summary: "" }}
- star_analysis: {{ situation: "", task: "", action: "", result: "" }}
Integrate: Fillers={fillers}, Readability={readability}
"""

# ── Resume ATS ─────────────────────────────────────────────────────
RESUME_ATS_SYSTEM = "You are an ATS (Applicant Tracking System) expert. Analyze the resume professionally. Return JSON only."
RESUME_ATS_PROMPT = """
RESUME: {resume_text}
JOB DESCRIPTION: {job_description}

Return a JSON object with:
- ats_score: 0-100
- matching_keywords: []
- missing_keywords: []
- formatting_issues: []
- section_analysis: {{ experience: 0-10, projects: 0-10, skills: 0-10 }}
- suggestions: []
- summary: ""
"""

# ── Code Review ────────────────────────────────────────────────────
CODE_REVIEW_SYSTEM = "You are a senior software engineer. Review code strictly and accurately. Return JSON only."
CODE_REVIEW_PROMPT = """
PROBLEM: {problem}
LANGUAGE: {language}
CODE:
```{language}
{code}
```

Return JSON object with:
- correctness: 0-10
- time_complexity: "O(...)"
- space_complexity: "O(...)"
- bugs: []
- edge_cases_missed: []
- optimized_solution: ""
- explanation: ""
"""

# ── System Design ──────────────────────────────────────────────────
SYSTEM_DESIGN_SYSTEM = "You are a Principal Architect. Evaluate the system design proposal. Return JSON only."
SYSTEM_DESIGN_PROMPT = """
PROMPT: {prompt}
USER_ANSWER: {user_answer}

Return JSON with:
- overall_score: 0-100
- scalability: 0-10
- components: 0-10
- tradeoffs: 0-10
- missing_pieces: []
- optimized_architecture: "Description or diagram notation"
- feedback: ""
"""

# ── Behavioral ─────────────────────────────────────────────────────
BEHAVIORAL_SYSTEM = "You are a senior HR manager. Evaluate the behavioral answer based on STAR method. Return JSON only."
BEHAVIORAL_PROMPT = """
QUESTION: {question}
ANSWER: {answer}

Return JSON with:
- star_score: 0-100
- clarity: 0-10
- relevance: 0-10
- feedback: ""
- sample_answer: "A better version of this answer"
"""

# ── Company Prep ───────────────────────────────────────────────────
COMPANY_PREP_SYSTEM = "You are a professional recruiter with deep knowledge of top-tier company interview loops. Return JSON only."
COMPANY_PREP_PROMPT = """
COMPANY: {company_name}
ROLE: {role}

Return JSON object with:
- interview_rounds: []
- core_values: []
- key_focus_areas: []
- common_questions: []
- insider_tips: []
"""

# ── Study Plan ─────────────────────────────────────────────────────
STUDY_PLAN_SYSTEM = "You are an expert career coach. Plan a highly structured curriculum. Return JSON only."
STUDY_PLAN_PROMPT = """
TARGET ROLE: {target_role}
TIMEFRAME: {timeframe}
WEAK_AREAS: {weak_areas}

Return JSON object with:
- title: ""
- weekly_milestones: [{{ week: 1, focus: "", tasks: [], resource_links: [] }}]
- readiness_checkpoints: []
"""

# ── Career Tools ───────────────────────────────────────────────────
COVER_LETTER_SYSTEM = "You are a professional career writer. Write a compelling cover letter. Return JSON only."
COVER_LETTER_PROMPT = """
RESUME: {resume_text}
JOB_DESCRIPTION: {job_description}

Return JSON with:
- cover_letter: "Full text of the letter"
- key_selling_points: []
"""

LINKEDIN_OPTIMIZE_SYSTEM = "You are a LinkedIn branding expert. Return JSON only."
LINKEDIN_OPTIMIZE_PROMPT = """
HEADLINE: {headline}
SUMMARY: {summary}
ROLE: {role}

Return JSON with:
- optimized_headline: ""
- optimized_summary: ""
- keyword_suggestions: []
"""

# ── Questions ──────────────────────────────────────────────────────
QUESTION_GEN_SYSTEM = "You are an expert technical interviewer. Generate professional questions. Return JSON only."
QUESTION_GEN_PROMPT = """
ROLE: {role}
TYPE: {type}
LEVEL: {level}
COUNT: {count}
COMPANY: {company}
TOPICS: {topics}

Return JSON: {{ "questions": [ {{ "q": "...", "hint": "...", "tag": "...", "diff": "..." }} ] }}
"""

# ── Mock Interview ─────────────────────────────────────────────────
MOCK_INTERVIEW_SYSTEM = "You are a senior technical interviewer. Be professional and challenging."
