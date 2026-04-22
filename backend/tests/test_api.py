from __future__ import annotations

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def seed_base(client: AsyncClient) -> dict[str, int]:
    """Carga datos base para pruebas.

    Args:
        client: Cliente HTTP async.

    Returns:
        Identificadores creados.
    """
    market_a = (await client.post("/api/supermarkets", json={"name": "Carrefour"})).json()
    market_b = (await client.post("/api/supermarkets", json={"name": "Coto"})).json()
    product = (
        await client.post(
            "/api/products",
            json={
                "barcode": "7790001234567",
                "description": "Leche entera larga vida",
                "brand": "La Serenisima",
                "quantity": 1,
                "unit": "l",
            },
        )
    ).json()
    return {
        "market_a": market_a["id"],
        "market_b": market_b["id"],
        "product": product["id"],
    }


async def test_pragmas_are_enabled(client: AsyncClient) -> None:
    """Verifica PRAGMAs aplicados.

    Args:
        client: Cliente HTTP async.

    Returns:
        No retorna valor.
    """
    response = await client.get("/health")
    assert response.status_code == 200


async def test_barcode_latest_prices(client: AsyncClient) -> None:
    """Barcode devuelve ultimo precio por supermercado.

    Args:
        client: Cliente HTTP async.

    Returns:
        No retorna valor.
    """
    ids = await seed_base(client)
    await client.post("/api/prices", json={"product_id": ids["product"], "supermarket_id": ids["market_a"], "price": 900})
    await client.post("/api/prices", json={"product_id": ids["product"], "supermarket_id": ids["market_a"], "price": 850})
    await client.post("/api/prices", json={"product_id": ids["product"], "supermarket_id": ids["market_b"], "price": 920})

    response = await client.get("/api/products/barcode/7790001234567")

    assert response.status_code == 200
    payload = response.json()
    assert payload["barcode"] == "7790001234567"
    assert len(payload["prices"]) == 2
    assert {item["price"] for item in payload["prices"]} == {850, 920}


async def test_search_and_similar_use_fts(client: AsyncClient) -> None:
    """FTS busca productos y similares.

    Args:
        client: Cliente HTTP async.

    Returns:
        No retorna valor.
    """
    ids = await seed_base(client)
    await client.post("/api/prices", json={"product_id": ids["product"], "supermarket_id": ids["market_a"], "price": 850})

    search = await client.get("/api/products/search", params={"q": "leche", "limit": 10})
    similar = await client.get("/api/prices/similar", params={"q": "leche", "limit": 10})

    assert search.status_code == 200
    assert search.json()[0]["description"] == "Leche entera larga vida"
    assert similar.status_code == 200
    assert similar.json()[0]["price"] == 850


async def test_compare_orders_and_classifies(client: AsyncClient) -> None:
    """Compare ordena y clasifica contra mediana.

    Args:
        client: Cliente HTTP async.

    Returns:
        No retorna valor.
    """
    ids = await seed_base(client)
    await client.post("/api/prices", json={"product_id": ids["product"], "supermarket_id": ids["market_a"], "price": 800})
    await client.post("/api/prices", json={"product_id": ids["product"], "supermarket_id": ids["market_b"], "price": 1000})

    response = await client.get(f"/api/prices/compare/{ids['product']}")

    assert response.status_code == 200
    payload = response.json()
    assert [item["price"] for item in payload] == [800, 1000]
    assert payload[0]["price_signal"] == "good"
    assert response.headers["cache-control"] == "public, max-age=30"


async def test_supermarkets_cache_and_conflicts(client: AsyncClient) -> None:
    """Supermercados cachea e informa conflictos.

    Args:
        client: Cliente HTTP async.

    Returns:
        No retorna valor.
    """
    created = await client.post("/api/supermarkets", json={"name": "Disco"})
    first = await client.get("/api/supermarkets")
    second = await client.get("/api/supermarkets")
    conflict = await client.post("/api/supermarkets", json={"name": "Disco"})

    assert created.status_code == 201
    assert first.json() == second.json()
    assert first.headers["cache-control"] == "public, max-age=30"
    assert conflict.status_code == 409


async def test_product_404_and_duplicate_barcode(client: AsyncClient) -> None:
    """Verifica errores de producto.

    Args:
        client: Cliente HTTP async.

    Returns:
        No retorna valor.
    """
    missing = await client.get("/api/products/barcode/nope")
    created = await client.post(
        "/api/products",
        json={
            "barcode": "7791",
            "description": "Yerba suave",
            "brand": "Playadito",
            "quantity": 1,
            "unit": "kg",
        },
    )
    duplicate = await client.post(
        "/api/products",
        json={
            "barcode": "7791",
            "description": "Yerba suave",
            "brand": "Playadito",
            "quantity": 1,
            "unit": "kg",
        },
    )

    assert missing.status_code == 404
    assert missing.json() == {"detail": "Producto no encontrado"}
    assert created.status_code == 201
    assert duplicate.status_code == 409
    assert duplicate.json() == {"detail": "El barcode ya existe"}
