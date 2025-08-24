from __future__ import annotations

import httpx
from typing import Any


async def list_openai_compatible_models(base_url: str, api_key: str, extra_headers: dict[str, str] | None = None) -> list[str]:
    headers = {"Authorization": f"Bearer {api_key}"}
    if extra_headers:
        headers.update(extra_headers)
    url = base_url.rstrip("/") + "/v1/models"
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        data: dict[str, Any] = resp.json()
        if "data" in data and isinstance(data["data"], list):
            names: list[str] = []
            for m in data["data"]:
                if isinstance(m, dict) and "id" in m:
                    names.append(str(m["id"]))
            return names
        return []

