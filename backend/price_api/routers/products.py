from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from price_api.database import get_db
from price_api.fts import sanitize_fts_query
from price_api.schemas import BarcodeProductResponse, LatestPriceRead, ProductCreate, ProductRead

router = APIRouter(prefix="/api/products", tags=["products"])

BARCODE_SQL = text(
    """
    WITH target_product AS (
        SELECT id, barcode, description, brand, quantity, unit
        FROM products
        WHERE barcode = :barcode
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
            JOIN target_product tp ON tp.id = pr.product_id
        )
        WHERE row_number = 1
    )
    SELECT
        tp.id,
        tp.barcode,
        tp.description,
        tp.brand,
        tp.quantity,
        tp.unit,
        s.id AS supermarket_id,
        s.name AS supermarket_name,
        lp.price,
        lp.recorded_at
    FROM target_product tp
    LEFT JOIN latest_prices lp ON lp.product_id = tp.id
    LEFT JOIN supermarkets s ON s.id = lp.supermarket_id
    ORDER BY s.name;
    """
)

SEARCH_SQL = text(
    """
    SELECT p.id, p.barcode, p.description, p.brand, p.quantity, p.unit
    FROM products_fts
    JOIN products p ON p.id = products_fts.rowid
    WHERE products_fts MATCH :query
    ORDER BY rank
    LIMIT :limit;
    """
)

INSERT_PRODUCT_SQL = text(
    """
    INSERT INTO products (barcode, description, brand, quantity, unit)
    VALUES (:barcode, :description, :brand, :quantity, :unit)
    RETURNING id, barcode, description, brand, quantity, unit;
    """
)


@router.get("/barcode/{code}", response_model=BarcodeProductResponse)
async def get_product_by_barcode(code: str, db: AsyncSession = Depends(get_db)) -> BarcodeProductResponse:
    """Obtiene producto por barcode con ultimos precios.

    Args:
        code: Codigo de barras.
        db: Sesion async inyectada.

    Returns:
        Producto con precios vigentes por supermercado.
    """
    result = await db.execute(BARCODE_SQL, {"barcode": code})
    rows = result.mappings().all()
    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")

    first = rows[0]
    prices = [
        LatestPriceRead(
            supermarket_id=row["supermarket_id"],
            supermarket_name=row["supermarket_name"],
            price=row["price"],
            recorded_at=row["recorded_at"],
        )
        for row in rows
        if row["supermarket_id"] is not None
    ]
    return BarcodeProductResponse(
        id=first["id"],
        barcode=first["barcode"],
        description=first["description"],
        brand=first["brand"],
        quantity=first["quantity"],
        unit=first["unit"],
        prices=prices,
    )


@router.get("/search", response_model=list[ProductRead])
async def search_products(
    q: str = Query(default="", max_length=120),
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
) -> list[ProductRead]:
    """Busca productos con FTS5.

    Args:
        q: Texto de busqueda.
        limit: Maximo de resultados.
        db: Sesion async inyectada.

    Returns:
        Productos encontrados por relevancia.
    """
    query = sanitize_fts_query(q)
    if not query:
        return []

    result = await db.execute(SEARCH_SQL, {"query": query, "limit": limit})
    return [ProductRead(**row) for row in result.mappings().all()]


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate, db: AsyncSession = Depends(get_db)) -> ProductRead:
    """Crea un producto.

    Args:
        payload: Datos del producto.
        db: Sesion async inyectada.

    Returns:
        Producto creado.
    """
    try:
        result = await db.execute(INSERT_PRODUCT_SQL, payload.model_dump(mode="json"))
        row = result.mappings().one()
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        message = str(exc.orig).lower()
        if "barcode" in message or "unique" in message:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El barcode ya existe") from exc
        raise

    return ProductRead(**row)
