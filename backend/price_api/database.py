from __future__ import annotations

from collections.abc import AsyncIterator

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from price_api.config import Settings
from price_api.schema_sql import SQLITE_PRAGMAS

_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def _apply_sqlite_pragmas(dbapi_connection, _connection_record) -> None:
    """Aplica PRAGMAs de rendimiento a una conexion SQLite.

    Args:
        dbapi_connection: Conexion DBAPI adaptada por SQLAlchemy.
        _connection_record: Registro interno del pool.

    Returns:
        No retorna valor.
    """
    cursor = dbapi_connection.cursor()
    try:
        for statement in SQLITE_PRAGMAS:
            cursor.execute(statement)
    finally:
        cursor.close()


def build_engine(settings: Settings) -> AsyncEngine:
    """Construye un AsyncEngine SQLite optimizado.

    Args:
        settings: Configuracion de runtime.

    Returns:
        Engine async configurado con StaticPool.
    """
    engine = create_async_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )

    @event.listens_for(engine.sync_engine, "connect")
    def receive_connect(dbapi_connection, connection_record) -> None:
        """Aplica PRAGMAs al abrir una conexion del pool.

        Args:
            dbapi_connection: Conexion DBAPI adaptada.
            connection_record: Registro interno del pool.

        Returns:
            No retorna valor.
        """
        _apply_sqlite_pragmas(dbapi_connection, connection_record)

    return engine


async def init_engine(settings: Settings) -> None:
    """Inicializa engine y session factory globales.

    Args:
        settings: Configuracion de runtime.

    Returns:
        No retorna valor.
    """
    global _engine, _session_factory
    _engine = build_engine(settings)
    _session_factory = async_sessionmaker(_engine, expire_on_commit=False)


async def close_engine() -> None:
    """Cierra el engine global.

    Args:
        Ninguno.

    Returns:
        No retorna valor.
    """
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
    _engine = None
    _session_factory = None


def get_engine() -> AsyncEngine:
    """Obtiene el engine inicializado.

    Args:
        Ninguno.

    Returns:
        Engine async activo.
    """
    if _engine is None:
        raise RuntimeError("El engine no esta inicializado")
    return _engine


async def get_db() -> AsyncIterator[AsyncSession]:
    """Entrega una sesion async por request.

    Args:
        Ninguno.

    Returns:
        Iterador async con una sesion SQLAlchemy.
    """
    if _session_factory is None:
        raise RuntimeError("La session factory no esta inicializada")

    async with _session_factory() as session:
        yield session
