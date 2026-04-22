from __future__ import annotations

import re

TOKEN_RE = re.compile(r"[^\W_]+", re.UNICODE)


def sanitize_fts_query(value: str) -> str:
    """Sanitiza texto de usuario para FTS5 MATCH.

    Args:
        value: Texto libre enviado por el usuario.

    Returns:
        Query FTS5 con tokens entre comillas y operador AND.
    """
    tokens = [token for token in TOKEN_RE.findall(value.strip()) if token]
    return " AND ".join(f'"{token}"' for token in tokens)
