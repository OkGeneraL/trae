from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from starlette.responses import StreamingResponse
from sqlmodel import Session, select

from trae_agent.agent import Agent
from trae_agent.utils.config import Config

from .db import get_session
from .models import ExecutionMode, ModelInfo, Provider, Task, TaskEvent, TaskStatus
from .providers import list_openai_compatible_models
from .webconsole import WebConsole, event_bus


router = APIRouter()


@router.post("/providers")
async def add_provider(payload: dict[str, Any], session: Session = Depends(get_session)) -> JSONResponse:
    name = str(payload.get("name") or "custom")
    base_url = payload.get("base_url")
    api_key = payload.get("api_key")
    api_version = payload.get("api_version")
    if not api_key:
        raise HTTPException(status_code=400, detail="api_key is required")
    provider = Provider(name=name, base_url=base_url, api_key=api_key, api_version=api_version)
    session.add(provider)
    session.commit()
    session.refresh(provider)

    # Try fetch models if base_url is provided
    models: list[str] = []
    if base_url:
        try:
            models = await list_openai_compatible_models(base_url, api_key)
        except Exception:
            models = []
    for m in models:
        session.add(ModelInfo(provider_id=provider.id, name=m))
    session.commit()

    return JSONResponse({"id": provider.id, "models": models})


@router.get("/providers")
async def list_providers(session: Session = Depends(get_session)) -> list[dict[str, Any]]:
    providers = session.exec(select(Provider)).all()
    out: list[dict[str, Any]] = []
    for p in providers:
        out.append({"id": p.id, "name": p.name, "base_url": p.base_url})
    return out


@router.get("/providers/{provider_id}/models")
async def list_provider_models(provider_id: int, session: Session = Depends(get_session)) -> list[str]:
    models = session.exec(select(ModelInfo.name).where(ModelInfo.provider_id == provider_id)).all()
    return list(models)


@router.post("/tasks")
async def create_task(payload: dict[str, Any], session: Session = Depends(get_session)) -> JSONResponse:
    issue = str(payload.get("issue") or "")
    working_dir = str(payload.get("working_dir") or Path.cwd().as_posix())
    provider_id = int(payload.get("provider_id"))
    model = str(payload.get("model"))
    must_patch = bool(payload.get("must_patch", False))
    trajectory_file = payload.get("trajectory_file")
    execution_mode = ExecutionMode(str(payload.get("execution_mode", ExecutionMode.local)))
    if not issue:
        raise HTTPException(status_code=400, detail="issue is required")

    task = Task(
        issue=issue,
        working_dir=working_dir,
        provider_id=provider_id,
        model=model,
        must_patch=must_patch,
        trajectory_file=trajectory_file,
        execution_mode=execution_mode,
        status=TaskStatus.pending,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    # Launch background worker
    asyncio.create_task(_run_task(task.id))

    return JSONResponse({"id": task.id})


async def _run_task(task_id: int) -> None:
    from .db import engine
    with Session(engine) as session:
        task = session.get(Task, task_id)
        if not task:
            return
        provider = session.get(Provider, task.provider_id)
        if not provider:
            return
        task.status = TaskStatus.running
        session.add(task)
        session.commit()

        # Build config on the fly
        yaml_config = f"""
model_providers:
  custom:
    provider: {provider.name}
    api_key: {provider.api_key}
    base_url: {provider.base_url or ''}
models:
  selected:
    model_provider: custom
    model: {task.model}
    max_tokens: 4096
    temperature: 0
    top_p: 1
    top_k: 0
    parallel_tool_calls: true
    max_retries: 3
agents:
  trae_agent:
    enable_lakeview: false
    model: selected
    max_steps: 60
    tools:
      - bash
      - str_replace_based_edit_tool
      - sequentialthinking
      - task_done
"""

        config = Config.create(config_string=yaml_config)
        console = WebConsole(task_id=task_id)
        from trae_agent.agent import Agent
        from trae_agent.utils.trajectory_recorder import TrajectoryRecorder

        agent = Agent("trae_agent", config, TrajectoryRecorder(task.trajectory_file), console)

        task_args = {
            "project_path": task.working_dir,
            "issue": task.issue,
            "must_patch": "true" if task.must_patch else "false",
        }
        try:
            _ = await agent.run(task.issue, task_args)
            task.status = TaskStatus.completed
        except Exception as e:
            await event_bus.publish(task_id, {"type": "error", "message": str(e)})
            task.status = TaskStatus.failed
        finally:
            session.add(task)
            session.commit()


@router.get("/tasks")
async def list_tasks(session: Session = Depends(get_session)) -> list[dict[str, Any]]:
    tasks = session.exec(select(Task)).all()
    out: list[dict[str, Any]] = []
    for t in tasks:
        out.append({
            "id": t.id,
            "status": t.status.value,
            "issue": t.issue,
            "model": t.model,
            "execution_mode": t.execution_mode.value,
        })
    return out


@router.get("/tasks/{task_id}/events")
async def stream_task_events(task_id: int) -> StreamingResponse:
    async def gen():
        async for chunk in event_bus.subscribe(task_id):
            yield chunk
    return StreamingResponse(gen(), media_type="text/event-stream")

