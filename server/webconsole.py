from __future__ import annotations

import asyncio
import json
from dataclasses import asdict
from typing import AsyncGenerator, Optional

from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool

from trae_agent.agent.agent_basics import AgentExecution, AgentStep
from trae_agent.utils.cli import CLIConsole, ConsoleMode


class EventBus:
    def __init__(self) -> None:
        self._subscribers: dict[int, asyncio.Queue[bytes]] = {}

    async def publish(self, task_id: int, event: dict) -> None:
        data = f"data: {json.dumps(event)}\n\n".encode()
        queue = self._subscribers.get(task_id)
        if queue:
            await queue.put(data)

    async def subscribe(self, task_id: int) -> AsyncGenerator[bytes, None]:
        queue: asyncio.Queue[bytes] = asyncio.Queue()
        self._subscribers[task_id] = queue
        try:
            while True:
                chunk = await queue.get()
                yield chunk
        finally:
            self._subscribers.pop(task_id, None)


event_bus = EventBus()


class WebConsole(CLIConsole):
    def __init__(self, task_id: int):
        super().__init__(mode=ConsoleMode.RUN, lakeview_config=None)
        self.task_id = task_id

    async def start(self):
        return None

    def update_status(
        self, agent_step: Optional[AgentStep] = None, agent_execution: Optional[AgentExecution] = None
    ):
        event: dict = {"type": "status"}
        if agent_step:
            event["step"] = {
                "step_number": agent_step.step_number,
                "state": agent_step.state.value,
                "tool_calls": [tc.name for tc in (agent_step.tool_calls or [])],
                "error": agent_step.error,
                "reflection": agent_step.reflection,
                "llm_content": agent_step.llm_response.content if agent_step.llm_response else None,
            }
        if agent_execution:
            event["execution"] = {
                "state": agent_execution.agent_state.value,
                "success": agent_execution.success,
                "final_result": agent_execution.final_result,
            }
        asyncio.create_task(event_bus.publish(self.task_id, event))

    def print(self, message: str, color: str = "blue", bold: bool = False):
        event = {"type": "log", "message": message, "color": color, "bold": bold}
        asyncio.create_task(event_bus.publish(self.task_id, event))

    def print_task_details(self, details: dict[str, str]):
        event = {"type": "task_details", "details": details}
        asyncio.create_task(event_bus.publish(self.task_id, event))

    def get_task_input(self) -> str | None:
        raise HTTPException(status_code=400, detail="Interactive input not supported via web")

    def get_working_dir_input(self) -> str:
        raise HTTPException(status_code=400, detail="Interactive input not supported via web")

    def stop(self):
        pass

