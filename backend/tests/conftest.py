from __future__ import annotations

from collections.abc import AsyncIterator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from price_api.config import Settings
from price_api.database import close_engine, get_engine, init_engine
from price_api.main import create_app
from price_api.routers.supermarkets import clear_supermarkets_cache
from price_api.schema_sql import apply_schema


@pytest_asyncio.fixture
async def client() -> AsyncIterator[AsyncClient]:
    """Crea cliente HTTP con SQLite temporal.

    Args:
        Ninguno.

    Returns:
        Cliente HTTP async.
    """
    settings = Settings(
        database_url="sqlite+aiosqlite:///:memory:",
        cors_origins=("http://localhost:5173",),
        request_timeout_seconds=5,
        uvicorn_workers=1,
    )
    clear_supermarkets_cache()
    await init_engine(settings)
    async with get_engine().begin() as connection:
        await apply_schema(connection)

    app = create_app(settings=settings, lifespan_enabled=False)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        yield async_client

    await close_engine()
