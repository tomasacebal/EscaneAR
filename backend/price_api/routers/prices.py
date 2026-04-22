from __future__ import annotations

from fastapi import APIRouter, Depends, Path, Query, Response, status
from fastapi.exceptions import HTTPException
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from price_api.database import get_db
from price_api.fts import sanitize_fts_query
from price_api.price_quality import classify_price, median
from price_api.schemas import ComparePriceRead, PriceCreate, PriceRead, ProductRead, SimilarProductRead

router = APIRouter(prefix="/api/prices", tags=["prices"])

COMPARE_SQL = text(
    """
    WITH latest_prices AS (
        SELECT product_id, supermarket_id, price, recorded_at
        FROM (
            SELECT
                pr.product_id,
                pr.supermarket_id,
                pr.price,
                pr.recorded_at,
                ROW_NUMBER() OVER (
                    PARTITION BY pr.product_id, pr.supermarket_id
                    ORDER BY pr.recorded_at DESC, pr.id DESC
                ) AS row_number
            FROM prices pr
            WHERE pr.product_id = :product_id
        )
        WHERE row_number = 1
    )
    SELECT
        lp.product_id,
        s.id AS supermarket_id,
        s.name AS supermarket_name,
        lp.price,
        lp.recorded_at
    FROM latest_prices lp
    JOIN supermarkets s ON s.id = lp.supermarket_id
    ORDER BY lp.price ASC, s.name ASC;
    """
)

SIMILAR_SQL = text(
    """
    WITH matched_products AS (
        SELECT p.id, p.barcode, p.description, p.brand, p.quantity, p.unit
        FROM products_fts
        JOIN products p ON p.id = products_fts.rowid
        WHERE products_fts MATCH :query
        ORDER BY rank
        LIMIT :limit
    ),
    latest_prices AS (
        SELECT product_id, supermarket_id, price, recorded_at
        FROM (
            SELECT
                pr.product_id,
                pr.supermarket_id,
                pr.price,
                pr.recorded_at,
                ROW_NUMBER() OVER (
                    PARTITION BY pr.product_id, pr.supermarket_id
                    ORDER BY pr.recorded_at DESC, pr.id DESC
                ) AS row_number
            FROM prices pr
            JOIN matched_products mp ON mp.id = pr.product_id
        )
        WHERE row_number = 1
    ),
    best_prices AS (
        SELECT product_id, supermarket_id, price, recorded_at
        FROM (
            SELECT
                lp.product_id,
                lp.supermarket_id,
                lp.price,
                lp.recorded_at,
                ROW_NUMBER() OVER (
                    PARTITION BY lp.product_id
                    ORDER BY lp.price ASC, lp.recorded_at DESC
                ) AS price_rank
            FROM latest_prices lp
        )
        WHERE price_rank = 1
    )
    SELECT
        mp.id,
        mp.barcode,
        mp.description,
        mp.brand,
        mp.quantity,
        mp.unit,
        s.id AS supermarket_id,
        s.name AS supermarket_name,
        bp.price,
        bp.recorded_at
    FROM matched_products mp
    JOIN best_prices bp ON bp.product_id = mp.id
    JOIN supermarkets s ON s.id = bp.supermarket_id
    ORDER BY bp.price ASC, mp.description ASC;
    """
)

INSERT_PRICE_SQL = text(
    """
    INSERT INTO prices (product_id, supermarket_id, price)
    VALUES (:product_id, :supermarket_id, :price)
    RETURNING id, product_id, supermarket_id, price, recorded_at;
    """
)


@router.get("/compare/{product_id}", response_model=list[ComparePriceRead])
async def compare_prices(
    response: Response,
    product_id: int = Path(gt=0),
    db: AsyncSession = Depends(get_db),
) -> list[ComparePriceRead]:
    """Compara precios vigentes de un producto.

    Args:
        response: Respuesta HTTP mutable.
        product_id: Identificador del producto.
        db: Sesion async inyectada.

    Returns:
        Precios vigentes ordenados con señal.
    """
    response.headers["Cache-Control"] = "public, max-age=30"
    result = await db.execute(COMPARE_SQL, {"product_id": product_id})
    rows = result.mappings().all()
    reference = median([row["price"] for row in rows])

    return [
        ComparePriceRead(
            product_id=row["product_id"],
            supermarket_id=row["supermarket_id"],
            supermarket_name=row["supermarket_name"],
            price=row["price"],
            recorded_at=row["recorded_at"],
            price_signal=classify_price(row["price"], reference),
        )
        for row in rows
    ]


@router.get("/similar", response_model=list[SimilarProductRead])
async def similar_prices(
    q: str = Query(default="", max_length=120),
    limit: int = Query(default=30, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> list[SimilarProductRead]:
    """Busca similares y devuelve su menor precio vigente.

    Args:
        q: Texto de busqueda.
        limit: Maximo de productos similares.
        db: Sesion async inyectada.

    Returns:
        Productos similares con precio minimo vigente.
    """
    query = sanitize_fts_query(q)
    if not query:
        return []

    result = await db.execute(SIMILAR_SQL, {"query": query, "limit": limit})
    items: list[SimilarProductRead] = []
    for row in result.mappings().all():
        product = ProductRead(
            id=row["id"],
            barcode=row["barcode"],
            description=row["description"],
            brand=row["brand"],
            quantity=row["quantity"],
            unit=row["unit"],
        )
        items.append(
            SimilarProductRead(
                product=product,
                supermarket_id=row["supermarket_id"],
                supermarket_name=row["supermarket_name"],
                price=row["price"],
                recorded_at=row["recorded_at"],
            )
        )
    return items


@router.post("", response_model=PriceRead, status_code=status.HTTP_201_CREATED)
async def create_price(payload: PriceCreate, db: AsyncSession = Depends(get_db)) -> PriceRead:
    """Registra un precio.

    Args:
        payload: Datos del precio.
        db: Sesion async inyectada.

    Returns:
        Precio creado.
    """
    try:
        result = await db.execute(INSERT_PRICE_SQL, payload.model_dump())
        row = result.mappings().one()
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Producto o supermercado invalido",
        ) from exc

    return PriceRead(**row)
