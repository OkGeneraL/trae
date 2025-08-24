from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from sqlmodel import Session, SQLModel, create_engine


DATA_DIR = Path(os.getenv("TRAE_APP_DATA_DIR", "/workspace/data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "app.db"

engine = create_engine(f"sqlite:///{DB_PATH}", echo=False)


def init_db() -> None:
    from .models import Provider, ModelInfo, Task, TaskEvent  # noqa: F401

    SQLModel.metadata.create_all(engine)


@asynccontextmanager
async def get_session() -> AsyncGenerator[Session, None]:
    with Session(engine) as session:
        yield session

