from __future__ import annotations

import asyncio

from sqlalchemy import text

from price_api.config import Settings
from price_api.database import build_engine
from price_api.schema_sql import apply_schema


async def init_db() -> None:
    """Inicializa la base SQLite.

    Args:
        Ninguno.

    Returns:
        No retorna valor.
    """
    settings = Settings.from_env()
    engine = build_engine(settings)
    async with engine.begin() as connection:
        await apply_schema(connection)
        await connection.execute(text("PRAGMA optimize;"))
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(init_db())
