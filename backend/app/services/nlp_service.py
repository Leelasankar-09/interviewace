"""
NLP Service — InterviewAce
Uses: textstat (readability), regex NLP, HuggingFace Inference API (sentiment/tone)
No GPU needed. All pretrained model calls via HuggingFace Inference API.
"""

import re, os, math
from typing import Optional
import requests

# ── Filler word taxonomy ──────────────────────────────────────
FILLERS_MILD    = ["like", "you know", "so", "well", "okay", "right"]
FILLERS_MEDIUM  = ["basically", "literally", "honestly", "actually", "i mean", "sort of", "kind of", "anyway"]
FILLERS_HEAVY   = ["uhm", "um", "uh", "hmm", "er", "ah", "emm"]  # vocal sounds
FILLER_SEVERITY = {w: 1 for w in FILLERS_MILD} | {w: 2 for w in FILLERS_MEDIUM} | {w: 3 for w in FILLERS_HEAVY}
ALL_FILLERS     = list(FILLER_SEVERITY.keys())

# ── Power / action words ──────────────────────────────────────
POWER_WORDS = {
    "leadership":    ["led", "managed", "directed", "spearheaded", "mentored", "guided", "oversaw"],
    "achievement":   ["achieved", "delivered", "exceeded", "launched", "completed", "won", "secured"],
    "technical":     ["designed", "architected", "implemented", "built", "developed", "optimized", "refactored"],
    "collaboration": ["collaborated", "partnered", "coordinated", "aligned", "liaised", "facilitated"],
    "impact":        ["improved", "increased", "reduced", "accelerated", "doubled", "scaled", "saved"],
}
ALL_POWER = [w for words in POWER_WORDS.values() for w in words]

# ── STAR method keywords ──────────────────────────────────────
STAR_SITUATION  = ["situation", "context", "background", "when i was", "at my previous", "in my role"]
STAR_TASK       = ["task", "responsibility", "challenge", "goal", "objective", "assigned to"]
STAR_ACTION     = ["action", "i decided", "i implemented", "i built", "i led", "i worked", "i created", "i resolved"]
STAR_RESULT     = ["result", "outcome", "achieved", "reduced by", "increased by", "improved by", "learned", "% ", "percent"]


def detect_fillers(text: str) -> list:
    lower = text.lower()
    found = []
    for filler in ALL_FILLERS:
        count = len(re.findall(rf"\b{re.escape(filler)}\b", lower))
        if count:
            found.append({
                "word": filler,
                "count": count,
                "severity": FILLER_SEVERITY[filler],
                "category": "vocal" if filler in FILLERS_HEAVY else "verbal",
            })
    return sorted(found, key=lambda x: -x["severity"] * x["count"])


def detect_power_words(text: str) -> dict:
    lower = text.lower()
    found = {}
    for category, words in POWER_WORDS.items():
        matched = [w for w in words if re.search(rf"\b{w}\b", lower)]
        if matched:
            found[category] = matched
    return found


def detect_star(text: str) -> dict:
    lower = text.lower()
    return {
        "situation": any(kw in lower for kw in STAR_SITUATION),
        "task":      any(kw in lower for kw in STAR_TASK),
        "action":    any(kw in lower for kw in STAR_ACTION),
        "result":    any(kw in lower for kw in STAR_RESULT),
    }


def compute_readability(text: str) -> dict:
    """Compute readability without textstat (pure Python)."""
    sentences = [s.strip() for s in re.split(r'[.!?]', text) if s.strip()]
    words = text.split()
    syllable_count = sum(_count_syllables(w) for w in words)

    wc = len(words)
    sc = max(len(sentences), 1)
    avg_sentence_len = wc / sc
    avg_syllables = syllable_count / max(wc, 1)

    # Flesch reading ease (simplified)
    flesch = 206.835 - 1.015 * avg_sentence_len - 84.6 * avg_syllables
    flesch = max(0, min(100, flesch))

    return {
        "word_count": wc,
        "sentence_count": sc,
        "avg_sentence_length": round(avg_sentence_len, 1),
        "avg_syllables_per_word": round(avg_syllables, 2),
        "flesch_ease": round(flesch, 1),
        "reading_level": _flesch_to_level(flesch),
    }


def _count_syllables(word: str) -> int:
    word = word.lower().strip(".,!?;:")
    if len(word) <= 3:
        return 1
    count = len(re.findall(r'[aeiou]+', word))
    if word.endswith('e'):
        count -= 1
    return max(1, count)


def _flesch_to_level(score: float) -> str:
    if score >= 70:   return "Easy (conversational)"
    if score >= 50:   return "Standard (professional)"
    if score >= 30:   return "Fairly difficult"
    return "Complex"


def hf_sentiment(text: str) -> Optional[dict]:
    """
    Call HuggingFace Inference API for sentiment.
    Uses: distilbert-base-uncased-finetuned-sst-2-english
    Set HF_API_KEY in .env
    """
    api_key = os.getenv("HF_API_KEY")
    if not api_key:
        return None
    try:
        url = "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english"
        resp = requests.post(url,
            headers={"Authorization": f"Bearer {api_key}"},
            json={"inputs": text[:512]},
            timeout=10
        )
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and data:
                label = data[0][0]["label"]  # POSITIVE / NEGATIVE
                score = data[0][0]["score"]
                return {"label": label, "confidence": round(score * 100, 1)}
    except Exception:
        pass
    return None


def hf_zero_shot_classify(text: str, labels: list) -> Optional[dict]:
    """
    Zero-shot classification using facebook/bart-large-mnli.
    Used for: communication style, confidence detection.
    """
    api_key = os.getenv("HF_API_KEY")
    if not api_key:
        return None
    try:
        url = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
        resp = requests.post(url,
            headers={"Authorization": f"Bearer {api_key}"},
            json={"inputs": text[:512], "parameters": {"candidate_labels": labels}},
            timeout=15
        )
        if resp.status_code == 200:
            data = resp.json()
            return dict(zip(data["labels"], [round(s * 100, 1) for s in data["scores"]]))
    except Exception:
        pass
    return None


# ── Master Evaluation Engine ──────────────────────────────────
def evaluate_answer(text: str, question_type: str = "Behavioral") -> dict:
    """
    Multi-dimensional evaluation. Returns scores 0-100 with detailed breakdown.
    All scores are calibrated and weighted carefully.
    """
    if not text or len(text.strip()) < 10:
        return {"error": "Answer too short to evaluate"}

    readability = compute_readability(text)
    fillers     = detect_fillers(text)
    power_words = detect_power_words(text)
    star        = detect_star(text)
    wc          = readability["word_count"]
    sc          = readability["sentence_count"]

    # ── Individual Dimension Scores (0-10 scale) ──────────────

    # 1. RELEVANCE — Word count, question-type appropriateness
    rel_base = min(10, 3 + (wc / 15))  # scales up to 10 with ~100 words
    relevance = min(10, rel_base)

    # 2. STAR Structure
    star_filled = sum(star.values())
    star_score = min(10, star_filled * 2.5)  # 4 parts = 10

    # 3. Clarity — based on avg sentence length + flesch
    clarity_base = readability["flesch_ease"] / 10
    filler_penalty = min(4, sum(f["count"] * f["severity"] * 0.3 for f in fillers))
    clarity = max(0, min(10, clarity_base - filler_penalty))

    # 4. Tone — sentiment (HF) or positive language proxy
    positive_words = ["happy", "proud", "excited", "passionate", "enjoy", "love", "great", "excellent",
                      "succeeded", "thrilled", "grateful", "motivated", "achieved", "delivered"]
    neg_words = ["failed", "bad", "terrible", "worst", "hate", "difficult", "impossible", "struggle"]
    pos_count = sum(1 for w in positive_words if w in text.lower())
    neg_count = sum(1 for w in neg_words if w in text.lower())
    tone = min(10, 5 + pos_count - neg_count * 0.5 + len(power_words) * 0.5)
    tone = max(0, tone)

    # 5. Depth — quantified results, specific examples
    has_numbers = bool(re.search(r'\d+\s*(%|percent|x\b|times|users|hours|days|weeks|months)', text.lower()))
    has_specifics = bool(re.search(r'(for example|specifically|in particular|such as|including)', text.lower(), re.IGNORECASE))
    depth = min(10, 3 + (wc / 25) + (3 if has_numbers else 0) + (2 if has_specifics else 0))
    depth = min(10, depth)

    # 6. Vocabulary — power words diversity + unique word ratio
    words_lower = [w.lower() for w in text.split()]
    unique_ratio = len(set(words_lower)) / max(len(words_lower), 1)
    power_diversity = len(power_words)  # number of categories
    vocab = min(10, 4 + unique_ratio * 6 + power_diversity * 0.5)

    # 7. Conciseness — penalize very long answers for simple questions
    if question_type in ["HR", "Behavioral"]:
        ideal_wc = 150
    else:
        ideal_wc = 200
    deviation = abs(wc - ideal_wc) / ideal_wc
    conciseness = max(3, 10 - deviation * 6)

    # 8. Enthusiasm — exclamation, power verbs, confident starts
    exc = text.count('!')
    first_word = text.split()[0].lower() if text.split() else ""
    confident_starts = ["i", "we", "our", "my", "at", "when"]
    enthusiasm = min(10, 5 + exc + (1 if first_word in confident_starts else 0) + len(power_words) * 0.4)
    enthusiasm = min(10, enthusiasm)

    scores_10 = {
        "relevance":     round(relevance, 1),
        "star_structure": round(star_score, 1),
        "clarity":       round(clarity, 1),
        "tone":          round(tone, 1),
        "depth":         round(depth, 1),
        "vocabulary":    round(vocab, 1),
        "conciseness":   round(conciseness, 1),
        "enthusiasm":    round(enthusiasm, 1),
    }

    # ── Weighted Overall Score (out of 100) ───────────────────
    weights = {
        "relevance":     0.18,
        "star_structure": 0.15,
        "clarity":       0.15,
        "tone":          0.10,
        "depth":         0.18,
        "vocabulary":    0.10,
        "conciseness":   0.07,
        "enthusiasm":    0.07,
    }
    overall_100 = sum(scores_10[k] * weights[k] * 10 for k in scores_10)
    overall_100 = round(overall_100, 1)

    # ── Grade ────────────────────────────────────────────────
    grade = "A+" if overall_100 >= 88 else "A" if overall_100 >= 80 else "B+" if overall_100 >= 73 else "B" if overall_100 >= 65 else "C+" if overall_100 >= 55 else "C" if overall_100 >= 45 else "D"

    # ── Strengths & Improvements ─────────────────────────────
    strengths = []
    improvements = []
    for dim, s in scores_10.items():
        name = dim.replace("_", " ").title()
        if s >= 7.5:
            strengths.append(f"Strong {name} ({s}/10)")
        elif s < 5:
            improvements.append(_improvement_tip(dim, s))

    # ── Uhm/Um specific feedback ──────────────────────────────
    vocal_fillers = [f for f in fillers if f["category"] == "vocal"]
    vocal_count = sum(f["count"] for f in vocal_fillers)

    return {
        "overall_score": overall_100,
        "grade": grade,
        "scores_10": scores_10,
        "scores_radar": [
            {"name": k.replace("_", " ").title(), "score": v}
            for k, v in scores_10.items()
        ],
        "star_breakdown": star,
        "fillers": fillers,
        "vocal_filler_count": vocal_count,
        "power_words": power_words,
        "readability": readability,
        "has_quantified_result": has_numbers,
        "strengths": strengths[:3],
        "improvements": improvements[:3],
        "filler_penalty_applied": round(filler_penalty, 2),
    }


def evaluate_minute_segment(text: str, minute: int) -> dict:
    """
    Evaluate a per-minute transcript segment.
    Lightweight version of full evaluation for live feedback.
    """
    if not text.strip():
        return {"minute": minute, "score": 0, "feedback": "No speech detected", "fillers": []}

    fillers = detect_fillers(text)
    wc    = len(text.split())
    filler_count = sum(f["count"] for f in fillers)
    vocal_count  = sum(f["count"] for f in fillers if f["category"] == "vocal")

    # Speaking pace score (ideal: 120-160 wpm)
    wpm = wc  # we get ~1 min of text
    pace_score = 100 - abs(wpm - 140) * 0.5
    pace_score = max(20, min(100, pace_score))

    # Filler density score
    filler_density = filler_count / max(wc, 1)
    filler_score = max(0, 100 - filler_density * 300)

    # Vocal filler penalty (uhm/um most penalized)
    vocal_penalty = min(30, vocal_count * 10)
    clarity_score = max(0, filler_score - vocal_penalty)

    combined = round((pace_score * 0.4 + clarity_score * 0.6), 1)

    # Descriptive feedback
    issues = []
    if vocal_count >= 3:
        issues.append(f"⚠️ {vocal_count} 'uhm/um' sounds — take a breath instead")
    if filler_count >= 5:
        issues.append(f"🔴 {filler_count} filler words — slow down")
    if wpm < 60:
        issues.append("🐢 Speaking too slowly")
    elif wpm > 200:
        issues.append("🚀 Speaking too fast — pace yourself")
    if not issues:
        issues.append("✅ Clear and well-paced speech!")

    return {
        "minute": minute,
        "score": combined,
        "wpm": wpm,
        "filler_count": filler_count,
        "vocal_filler_count": vocal_count,
        "filler_density_pct": round(filler_density * 100, 1),
        "fillers_found": [f["word"] for f in fillers[:5]],
        "feedback": " | ".join(issues),
        "grade": "Good" if combined >= 75 else "Fair" if combined >= 50 else "Needs Work",
    }


def _improvement_tip(dim: str, score: float) -> str:
    tips = {
        "relevance":     "Add more context — your answer is too brief",
        "star_structure": "Structure with STAR: Situation → Task → Action → Result",
        "clarity":       "Reduce filler words — pause instead of saying 'uhm/um'",
        "tone":          "Use more positive, action-oriented language",
        "depth":         "Add specific numbers/metrics to quantify your impact",
        "vocabulary":    "Use stronger action verbs: 'implemented', 'optimized', 'led'",
        "conciseness":   "Be more concise — aim for 120-180 words",
        "enthusiasm":    "Show more energy — recruiters hire passionate people",
    }
    return tips.get(dim, f"Improve {dim}")
