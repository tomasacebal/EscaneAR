from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from price_api.database import get_db
from price_api.schemas import SupermarketCreate, SupermarketRead

router = APIRouter(prefix="/api/supermarkets", tags=["supermarkets"])

_cache: dict[str, list[SupermarketRead]] = {}

LIST_SUPERMARKETS_SQL = text(
    """
    SELECT id, name
    FROM supermarkets
    ORDER BY name ASC;
    """
)

INSERT_SUPERMARKET_SQL = text(
    """
    INSERT INTO supermarkets (name)
    VALUES (:name)
    RETURNING id, name;
    """
)


def clear_supermarkets_cache() -> None:
    """Invalida cache de supermercados.

    Args:
        Ninguno.

    Returns:
        No retorna valor.
    """
    _cache.clear()


@router.get("", response_model=list[SupermarketRead])
async def list_supermarkets(response: Response, db: AsyncSession = Depends(get_db)) -> list[SupermarketRead]:
    """Lista supermercados usando cache en memoria.

    Args:
        response: Respuesta HTTP mutable.
        db: Sesion async inyectada.

    Returns:
        Supermercados ordenados por nombre.
    """
    response.headers["Cache-Control"] = "public, max-age=30"
    if "items" in _cache:
        return _cache["items"]

    result = await db.execute(LIST_SUPERMARKETS_SQL)
    items = [SupermarketRead(**row) for row in result.mappings().all()]
    _cache["items"] = items
    return items


@router.post("", response_model=SupermarketRead, status_code=status.HTTP_201_CREATED)
async def create_supermarket(
    payload: SupermarketCreate,
    db: AsyncSession = Depends(get_db),
) -> SupermarketRead:
    """Crea un supermercado e invalida cache.

    Args:
        payload: Nombre del supermercado.
        db: Sesion async inyectada.

    Returns:
        Supermercado creado.
    """
    try:
        result = await db.execute(INSERT_SUPERMARKET_SQL, payload.model_dump())
        row = result.mappings().one()
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El supermercado ya existe") from exc

    clear_supermarkets_cache()
    return SupermarketRead(**row)
