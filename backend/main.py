from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import json
import uuid
from typing import Dict, List, Optional
import os
from pathlib import Path
from pydantic import BaseModel
import tempfile
import shutil

# Import trae-agent components
from sdk.python import TraeAgentSDK
from trae_agent.utils.config import Config

app = FastAPI(title="Trae Agent Web API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for sessions (in production, use Redis or database)
active_sessions: Dict[str, dict] = {}
workspace_base = Path("./workspace")
workspace_base.mkdir(exist_ok=True)

class TaskRequest(BaseModel):
    task: str
    provider: str = "anthropic"
    model: str = "claude-sonnet-4-20250514"
    api_key: str
    max_steps: int = 20

class ConfigRequest(BaseModel):
    provider: str
    model: str
    api_key: str
    max_steps: int = 20

@app.get("/")
async def root():
    return {"message": "Trae Agent Web API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/validate-config")
async def validate_config(config: ConfigRequest):
    """Validate LLM configuration by creating a test config"""
    try:
        # Create a test config
        test_config = {
            "default_provider": config.provider,
            "max_steps": config.max_steps,
            "model_providers": {
                config.provider: {
                    "api_key": config.api_key,
                    "model": config.model,
                    "max_tokens": 4096,
                    "temperature": 0.5,
                    "top_p": 1,
                    "top_k": 0,
                    "parallel_tool_calls": False,
                    "max_retries": 3,
                }
            }
        }
        
        # Test the configuration by creating a Config object
        trae_config = Config(test_config)
        
        # Basic validation - check if API key is provided
        if not config.api_key or len(config.api_key.strip()) < 10:
            return {"valid": False, "message": "API key appears to be invalid or too short"}
            
        return {"valid": True, "message": "Configuration is valid"}
    except Exception as e:
        return {"valid": False, "message": f"Configuration error: {str(e)}"}

@app.post("/api/execute-task")
async def execute_task(task_request: TaskRequest, background_tasks: BackgroundTasks):
    """Execute a task using Trae Agent and return session ID for streaming"""
    try:
        # Create session
        session_id = str(uuid.uuid4())
        
        # Create workspace for this session
        session_workspace = workspace_base / session_id
        session_workspace.mkdir(exist_ok=True)
        
        # Store session info
        active_sessions[session_id] = {
            "status": "starting",
            "task": task_request.task,
            "workspace": str(session_workspace),
            "messages": [],
            "current_step": 0,
            "total_steps": task_request.max_steps,
            "result": None
        }
        
        # Start task execution in background
        background_tasks.add_task(
            execute_task_background, 
            session_id, 
            task_request, 
            str(session_workspace)
        )
        
        return {"session_id": session_id, "status": "started"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def execute_task_background(session_id: str, task_request: TaskRequest, workspace_path: str):
    """Execute task in background and update session status"""
    try:
        # Update session status
        active_sessions[session_id]["status"] = "running"
        active_sessions[session_id]["messages"].append({
            "type": "system",
            "content": f"Starting task: {task_request.task}",
            "timestamp": asyncio.get_event_loop().time()
        })
        
        # Create SDK instance
        sdk = TraeAgentSDK()
        
        # Execute task
        result = sdk.run(
            task=task_request.task,
            provider=task_request.provider,
            model=task_request.model,
            api_key=task_request.api_key,
            max_steps=task_request.max_steps,
            working_dir=workspace_path,
            verbose=False
        )
        
        # Update session with result
        active_sessions[session_id]["status"] = "completed" if result.success else "failed"
        active_sessions[session_id]["result"] = {
            "success": result.success,
            "final_result": result.result.final_result if result.result else None,
            "execution_time": result.result.execution_time if result.result else 0,
            "trajectory_path": result.trajectory_path
        }
        
        active_sessions[session_id]["messages"].append({
            "type": "result",
            "content": result.result.final_result if result.result else "Task completed",
            "success": result.success,
            "execution_time": result.result.execution_time if result.result else 0,
            "timestamp": asyncio.get_event_loop().time()
        })
        
    except Exception as e:
        active_sessions[session_id]["status"] = "error"
        active_sessions[session_id]["messages"].append({
            "type": "error",
            "content": f"Error: {str(e)}",
            "timestamp": asyncio.get_event_loop().time()
        })

@app.get("/api/session/{session_id}/status")
async def get_session_status(session_id: str):
    """Get current status of a session"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return active_sessions[session_id]

@app.get("/api/session/{session_id}/stream")
async def stream_session_updates(session_id: str):
    """Stream session updates using Server-Sent Events"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    async def event_stream():
        last_message_count = 0
        
        while True:
            session = active_sessions.get(session_id)
            if not session:
                break
                
            # Send new messages
            messages = session["messages"]
            if len(messages) > last_message_count:
                for message in messages[last_message_count:]:
                    yield f"data: {json.dumps(message)}\n\n"
                last_message_count = len(messages)
            
            # Check if session is complete
            if session["status"] in ["completed", "failed", "error"]:
                yield f"data: {json.dumps({'type': 'session_complete', 'status': session['status']})}\n\n"
                break
                
            await asyncio.sleep(1)  # Poll every second
    
    return StreamingResponse(
        event_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    )

@app.get("/api/workspace/{session_id}/files")
async def list_workspace_files(session_id: str):
    """List files in the session workspace"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    workspace_path = Path(active_sessions[session_id]["workspace"])
    if not workspace_path.exists():
        return {"files": []}
    
    files = []
    try:
        for item in workspace_path.rglob("*"):
            if item.is_file() and not item.name.startswith('.'):
                relative_path = item.relative_to(workspace_path)
                files.append({
                    "name": item.name,
                    "path": str(relative_path),
                    "size": item.stat().st_size,
                    "modified": item.stat().st_mtime,
                    "type": "file"
                })
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/workspace/{session_id}/file/{file_path:path}")
async def get_file_content(session_id: str, file_path: str):
    """Get content of a specific file"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    workspace_path = Path(active_sessions[session_id]["workspace"])
    full_path = workspace_path / file_path
    
    if not full_path.exists() or not full_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Security check - ensure file is within workspace
    try:
        full_path.resolve().relative_to(workspace_path.resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        content = full_path.read_text(encoding='utf-8')
        return {"content": content, "type": "text"}
    except UnicodeDecodeError:
        return {"content": "Binary file - cannot display", "type": "binary"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/session/{session_id}")
async def cleanup_session(session_id: str):
    """Clean up session and workspace"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        # Remove workspace directory
        workspace_path = Path(active_sessions[session_id]["workspace"])
        if workspace_path.exists():
            shutil.rmtree(workspace_path)
        
        # Remove session from memory
        del active_sessions[session_id]
        
        return {"message": "Session cleaned up successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)