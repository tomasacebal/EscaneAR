from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection


SQLITE_PRAGMAS: tuple[str, ...] = (
    "PRAGMA journal_mode = WAL;",
    "PRAGMA synchronous = NORMAL;",
    "PRAGMA cache_size = -64000;",
    "PRAGMA temp_store = MEMORY;",
    "PRAGMA mmap_size = 536870912;",
    "PRAGMA foreign_keys = ON;",
    "PRAGMA busy_timeout = 5000;",
    "PRAGMA optimize;",
)

SCHEMA_STATEMENTS: tuple[str, ...] = (
    """
    CREATE TABLE IF NOT EXISTS supermarkets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        brand TEXT,
        quantity REAL,
        unit TEXT CHECK(unit IN ('kg','g','l','ml','un','pack')),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL REFERENCES products(id),
        supermarket_id INTEGER NOT NULL REFERENCES supermarkets(id),
        price REAL NOT NULL,
        recorded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );
    """,
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);",
    "CREATE INDEX IF NOT EXISTS idx_prices_product_id ON prices(product_id);",
    "CREATE INDEX IF NOT EXISTS idx_prices_product_supermarket ON prices(product_id, supermarket_id);",
    "CREATE INDEX IF NOT EXISTS idx_prices_latest ON prices(product_id, supermarket_id, recorded_at DESC);",
    """
    CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
        description,
        brand,
        content='products',
        content_rowid='id',
        tokenize='unicode61 remove_diacritics 2'
    );
    """,
    """
    CREATE TRIGGER IF NOT EXISTS products_fts_insert AFTER INSERT ON products BEGIN
        INSERT INTO products_fts(rowid, description, brand)
        VALUES (new.id, new.description, new.brand);
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS products_fts_update AFTER UPDATE ON products BEGIN
        INSERT INTO products_fts(products_fts, rowid, description, brand)
        VALUES ('delete', old.id, old.description, old.brand);
        INSERT INTO products_fts(rowid, description, brand)
        VALUES (new.id, new.description, new.brand);
    END;
    """,
    """
    CREATE TRIGGER IF NOT EXISTS products_fts_delete AFTER DELETE ON products BEGIN
        INSERT INTO products_fts(products_fts, rowid, description, brand)
        VALUES ('delete', old.id, old.description, old.brand);
    END;
    """,
)


async def apply_schema(connection: AsyncConnection, statements: Sequence[str] = SCHEMA_STATEMENTS) -> None:
    """Aplica DDL base de SQLite.

    Args:
        connection: Conexion async abierta.
        statements: Sentencias DDL a ejecutar en orden.

    Returns:
        No retorna valor.
    """
    for statement in statements:
        await connection.execute(text(statement))
