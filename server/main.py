from __future__ import annotations

import asyncio
import json
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.responses import StreamingResponse
from .db import init_db
from .routers import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="Trae Agent Server", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> JSONResponse:
    return JSONResponse({"status": "ok"})


@app.get("/sse")
async def sse() -> StreamingResponse:
    async def event_stream() -> AsyncGenerator[bytes, None]:
        for i in range(3):
            yield f"data: {json.dumps({'tick': i})}\n\n".encode()
            await asyncio.sleep(0.2)
    return StreamingResponse(event_stream(), media_type="text/event-stream")


def run() -> None:
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    init_db()
    app.include_router(router)
    uvicorn.run("server.main:app", host="0.0.0.0", port=port, reload=False)

