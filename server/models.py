from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Provider(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    base_url: Optional[str] = None
    api_key: str
    api_version: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    models: list["ModelInfo"] = Relationship(back_populates="provider")


class ModelInfo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    provider_id: int = Field(foreign_key="provider.id")
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    provider: Provider = Relationship(back_populates="models")


class TaskStatus(StrEnum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class ExecutionMode(StrEnum):
    local = "local"
    docker = "docker"
    e2b = "e2b"


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    issue: str
    working_dir: str
    provider_id: int = Field(foreign_key="provider.id")
    model: str
    must_patch: bool = False
    execution_mode: ExecutionMode = Field(default=ExecutionMode.local)
    status: TaskStatus = Field(default=TaskStatus.pending)
    trajectory_file: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TaskEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="task.id")
    step_number: Optional[int] = None
    kind: str
    payload: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Setting(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str
    value: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

