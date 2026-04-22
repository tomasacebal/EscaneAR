from __future__ import annotations

from price_api.config import parse_cors_origins
from price_api.fts import sanitize_fts_query
from price_api.price_quality import classify_price, median


def test_sanitize_fts_query_quotes_tokens() -> None:
    """Verifica sanitizacion FTS5.

    Args:
        Ninguno.

    Returns:
        No retorna valor.
    """
    assert sanitize_fts_query('leche "entera" OR x') == '"leche" AND "entera" AND "OR" AND "x"'


def test_price_classification() -> None:
    """Verifica mediana y señal de precio.

    Args:
        Ninguno.

    Returns:
        No retorna valor.
    """
    reference = median([100, 200, 300])
    assert reference == 200
    assert classify_price(199, reference) == "good"
    assert classify_price(210, reference) == "average"
    assert classify_price(240, reference) == "high"


def test_parse_cors_origins() -> None:
    """Verifica parseo de CORS por entorno.

    Args:
        Ninguno.

    Returns:
        No retorna valor.
    """
    assert parse_cors_origins("http://a; https://b ;") == ("http://a", "https://b")
