"""Initial optimized SQLite schema.

Revision ID: 20260422_0001
Revises:
Create Date: 2026-04-22
"""

from __future__ import annotations

from alembic import op

from price_api.schema_sql import SCHEMA_STATEMENTS

revision = "20260422_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Crea tablas, indices, FTS5 y triggers.

    Args:
        Ninguno.

    Returns:
        No retorna valor.
    """
    for statement in SCHEMA_STATEMENTS:
        op.execute(statement)


def downgrade() -> None:
    """Elimina schema inicial.

    Args:
        Ninguno.

    Returns:
        No retorna valor.
    """
    op.execute("DROP TRIGGER IF EXISTS products_fts_delete;")
    op.execute("DROP TRIGGER IF EXISTS products_fts_update;")
    op.execute("DROP TRIGGER IF EXISTS products_fts_insert;")
    op.execute("DROP TABLE IF EXISTS products_fts;")
    op.execute("DROP INDEX IF EXISTS idx_prices_latest;")
    op.execute("DROP INDEX IF EXISTS idx_prices_product_supermarket;")
    op.execute("DROP INDEX IF EXISTS idx_prices_product_id;")
    op.execute("DROP INDEX IF EXISTS idx_products_barcode;")
    op.execute("DROP TABLE IF EXISTS prices;")
    op.execute("DROP TABLE IF EXISTS products;")
    op.execute("DROP TABLE IF EXISTS supermarkets;")
