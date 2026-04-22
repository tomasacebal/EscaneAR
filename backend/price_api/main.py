from __future__ import annotations

import asyncio
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from price_api.config import Settings
from price_api.database import close_engine, init_engine
from price_api.routers import prices, products, supermarkets

logger = logging.getLogger("price_api")


def create_app(settings: Settings | None = None, lifespan_enabled: bool = True) -> FastAPI:
    """Crea la aplicacion FastAPI.

    Args:
        settings: Configuracion opcional.
        lifespan_enabled: Indica si inicializa engine en lifespan.

    Returns:
        Instancia FastAPI configurada.
    """
    resolved_settings = settings or Settings.from_env()

    @asynccontextmanager
    async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
        await init_engine(resolved_settings)
        try:
            yield
        finally:
            await close_engine()

    app = FastAPI(
        title="EscaneAR Prices API",
        version="0.1.0",
        lifespan=lifespan if lifespan_enabled else None,
    )
    app.state.settings = resolved_settings

    app.add_middleware(GZipMiddleware, minimum_size=500)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(resolved_settings.cors_origins),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def request_timeout_middleware(request: Request, call_next):
        """Limita tiempo total de request.

        Args:
            request: Request entrante.
            call_next: Siguiente handler ASGI.

        Returns:
            Respuesta HTTP o timeout 504.
        """
        try:
            return await asyncio.wait_for(call_next(request), timeout=resolved_settings.request_timeout_seconds)
        except TimeoutError:
            return JSONResponse(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                content={"detail": "Tiempo de request agotado"},
            )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(_request: Request, exc: SQLAlchemyError) -> JSONResponse:
        """Maneja errores SQLAlchemy sin filtrar detalles.

        Args:
            _request: Request que disparo el error.
            exc: Error real de SQLAlchemy.

        Returns:
            Respuesta generica 500.
        """
        logger.exception("Error SQLAlchemy no controlado", exc_info=exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Error interno de base de datos"},
        )

    app.include_router(products.router)
    app.include_router(prices.router)
    app.include_router(supermarkets.router)

    @app.get("/health")
    async def health() -> dict[str, str]:
        """Expone healthcheck simple.

        Args:
            Ninguno.

        Returns:
            Estado de la API.
        """
        return {"status": "ok"}

    return app


app = create_app()
