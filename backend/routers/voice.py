from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import os, uuid, datetime, json
from pathlib import Path

router = APIRouter(prefix="/voice", tags=["voice"])

# Directory to save recordings
RECORDINGS_DIR = Path("recordings")
RECORDINGS_DIR.mkdir(exist_ok=True)
TRANSCRIPTS_FILE = Path("recordings/transcripts.json")


def load_transcripts():
    if TRANSCRIPTS_FILE.exists():
        with open(TRANSCRIPTS_FILE) as f:
            return json.load(f)
    return []


def save_transcripts(data):
    with open(TRANSCRIPTS_FILE, "w") as f:
        json.dump(data, f, indent=2)


@router.post("/save")
async def save_recording(
    audio: UploadFile = File(...),
    question_id: str = Form(""),
    transcript: str = Form(""),
):
    """Save voice recording to disk and persist transcript metadata."""
    # Save audio file
    ext = "webm"
    filename = f"{uuid.uuid4().hex}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.{ext}"
    filepath = RECORDINGS_DIR / filename

    content = await audio.read()
    with open(filepath, "wb") as f:
        f.write(content)

    # Save metadata
    records = load_transcripts()
    record = {
        "id": uuid.uuid4().hex,
        "file": filename,
        "question_id": question_id,
        "transcript": transcript,
        "filler_words": detect_fillers(transcript),
        "word_count": len(transcript.split()),
        "duration_secs": None,
        "created_at": datetime.datetime.now().isoformat(),
        "size_bytes": len(content),
    }
    records.append(record)
    save_transcripts(records)

    return {
        "message": "Recording saved successfully",
        "id": record["id"],
        "filename": filename,
        "word_count": record["word_count"],
        "filler_count": sum(f["count"] for f in record["filler_words"]),
    }


@router.get("/recordings")
def list_recordings(page: int = 1, limit: int = 10):
    """List all saved recordings with metadata."""
    records = load_transcripts()
    total = len(records)
    start = (page - 1) * limit
    return {
        "total": total,
        "page": page,
        "recordings": records[start: start + limit],
    }


@router.get("/recordings/{recording_id}")
def get_recording(recording_id: str):
    records = load_transcripts()
    for r in records:
        if r["id"] == recording_id:
            return r
    raise HTTPException(status_code=404, detail="Recording not found")


@router.delete("/recordings/{recording_id}")
def delete_recording(recording_id: str):
    records = load_transcripts()
    updated = []
    deleted = None
    for r in records:
        if r["id"] == recording_id:
            deleted = r
            filepath = RECORDINGS_DIR / r["file"]
            if filepath.exists():
                filepath.unlink()
        else:
            updated.append(r)
    if not deleted:
        raise HTTPException(status_code=404, detail="Not found")
    save_transcripts(updated)
    return {"message": "Deleted", "id": recording_id}


# ─── Filler word detection (server-side) ─────────────────────
FILLERS = ["uhm", "um", "uh", "hmm", "like", "basically", "literally",
           "you know", "i mean", "sort of", "kind of", "so yeah", "right", "okay so"]


def detect_fillers(text: str) -> list:
    import re
    lower = text.lower()
    result = []
    for f in FILLERS:
        count = len(re.findall(rf"\b{re.escape(f)}\b", lower))
        if count:
            result.append({"word": f, "count": count})
    return result


@router.post("/analyze-transcript")
def analyze_transcript(transcript: str):
    """Server-side NLP analysis of a transcript."""
    import re
    words = transcript.split()
    sentences = len(re.split(r'[.!?]', transcript))
    fillers = detect_fillers(transcript)
    power_words = ["implemented", "led", "built", "designed", "optimized",
                   "achieved", "delivered", "managed", "created", "developed"]
    found_power = [w for w in power_words if w.lower() in transcript.lower()]
    has_numbers = bool(re.search(r'\d+', transcript))

    return {
        "word_count": len(words),
        "sentence_count": sentences,
        "filler_words": fillers,
        "filler_total": sum(f["count"] for f in fillers),
        "power_words": found_power,
        "has_quantified_result": has_numbers,
        "avg_words_per_sentence": round(len(words) / max(sentences, 1)),
    }
