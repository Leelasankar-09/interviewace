from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.ai_service import mock_interview_stream

router = APIRouter(prefix="/mock", tags=["mock"])

class ChatMessage(BaseModel):
    history: list
    message: str

@router.post("/chat")
def mock_chat(body: ChatMessage):
    def generate():
        for chunk in mock_interview_stream(body.history, body.message):
            yield chunk
    return StreamingResponse(generate(), media_type="text/plain")
