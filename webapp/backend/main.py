import uvicorn
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from webapp.backend.database import (
    initialize_db,
    create_new_session,
    add_message_to_session,
    get_session_messages,
)

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",  # The default Next.js development port
    "localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    """Initialize the database when the server starts."""
    initialize_db()

@app.get("/")
async def read_root():
    return {"message": "Trae Agent Backend is running"}

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """Handles WebSocket connections for a specific session."""
    await websocket.accept()

    # Load and send history
    history = get_session_messages(session_id)
    await websocket.send_text(json.dumps({"type": "history", "data": history}))

    try:
        while True:
            data = await websocket.receive_text()

            # Save user message
            add_message_to_session(session_id, "user", data)
            await websocket.send_text(json.dumps({"type": "user_message", "data": data}))

            # Placeholder for agent logic
            agent_response = f"This is a placeholder response to: {data}"

            # Save agent message and send to client
            add_message_to_session(session_id, "agent", agent_response)
            await websocket.send_text(json.dumps({"type": "agent_message", "data": agent_response}))

    except WebSocketDisconnect:
        print(f"Client disconnected from session {session_id}")
    except Exception as e:
        print(f"WebSocket Error in session {session_id}: {e}")
    finally:
        await websocket.close()

@app.post("/sessions/new")
async def create_session():
    """Creates a new chat session."""
    session_id = create_new_session()
    return {"session_id": session_id}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
