from __future__ import annotations

import os
from dataclasses import dataclass


def parse_cors_origins(value: str | None) -> tuple[str, ...]:
    """Parsea origenes CORS desde entorno.

    Args:
        value: Texto con origenes separados por punto y coma.

    Returns:
        Tupla de origenes limpios.
    """
    if not value:
        return ("http://localhost:5173",)

    return tuple(origin.strip() for origin in value.split(";") if origin.strip())


@dataclass(frozen=True)
class Settings:
    """Configuracion de runtime.

    Args:
        database_url: URL SQLAlchemy async.
        cors_origins: Origenes permitidos por CORS.
        request_timeout_seconds: Timeout maximo por request.
        uvicorn_workers: Cantidad sugerida de workers.

    Returns:
        Configuracion inmutable de la app.
    """

    database_url: str = "sqlite+aiosqlite:///./prices.db"
    cors_origins: tuple[str, ...] = ("http://localhost:5173",)
    request_timeout_seconds: float = 5.0
    uvicorn_workers: int = 1

    @classmethod
    def from_env(cls) -> "Settings":
        """Construye configuracion desde variables de entorno.

        Args:
            Ninguno.

        Returns:
            Settings con defaults seguros para desarrollo.
        """
        return cls(
            database_url=os.getenv("DATABASE_URL", cls.database_url),
            cors_origins=parse_cors_origins(os.getenv("CORS_ORIGINS")),
            request_timeout_seconds=float(os.getenv("REQUEST_TIMEOUT_SECONDS", cls.request_timeout_seconds)),
            uvicorn_workers=int(os.getenv("UVICORN_WORKERS", cls.uvicorn_workers)),
        )
