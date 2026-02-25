# app/routes/mock.py
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.controllers.mock_controller import MockController
from app.services.ai_service import ai_service
from app.models.user import User
import json

router = APIRouter(prefix="/mock", tags=["mock"])

@router.post("/chat")
async def chat_mock(
    history: list = Body(...),
    message: str = Body(...),
    role: str = Body("Software Engineer")
):
    """Streaming chat for mock interview."""
    async def event_generator():
        from app.services.ai_service import mock_interview_stream
        for chunk in mock_interview_stream(history, message):
            yield chunk

    return StreamingResponse(event_generator(), media_type="text/plain")

@router.websocket("/session")
async def mock_interview_session(websocket: WebSocket, db: Session = Depends(get_db)):
    """Live WebSocket session for mock interview."""
    await websocket.accept()
    
    # Simple history for the session
    history = []
    
    try:
        while True:
            data = await websocket.receive_text()
            user_msg = json.loads(data)
            
            # Streaming AI response back over WebSocket
            full_response = ""
            from app.services.ai_service import mock_interview_stream
            for chunk in mock_interview_stream(history, user_msg.get("message")):
                await websocket.send_text(json.dumps({"type": "chunk", "text": chunk}))
                full_response += chunk
            
            history.append({"role": "user", "content": user_msg.get("message")})
            history.append({"role": "assistant", "content": full_response})
            
            await websocket.send_text(json.dumps({"type": "done", "history": history}))
            
    except WebSocketDisconnect:
        # Save session on disconnect if user finished
        print("WebSocket disconnected")

@router.post("/save")
async def save_mock_session(
    body: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    controller = MockController(db)
    return controller.save_session(user.id, body)

@router.get("/history")
async def get_mock_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    controller = MockController(db)
    return controller.get_history(user.id)
