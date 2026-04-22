# EscaneAR Prices API

Backend async con FastAPI, SQLite, SQLAlchemy 2.x, aiosqlite y FTS5 para comparacion de precios.

## Requisitos

- Python 3.12+
- SQLite con FTS5 habilitado

## Instalacion

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Variables de entorno

Copiar `.env.example` y configurar:

```bash
DATABASE_URL=sqlite+aiosqlite:///./prices.db
CORS_ORIGINS=http://localhost:5173;https://escanear.acebal.dev
REQUEST_TIMEOUT_SECONDS=5
UVICORN_WORKERS=1
```

`CORS_ORIGINS` usa `;` como separador.

## Inicializar base

```bash
python init_db.py
```

Tambien se puede usar Alembic:

```bash
alembic upgrade head
```

## Ejecutar

```bash
uvicorn price_api.main:app --host 0.0.0.0 --port 8000 --workers %UVICORN_WORKERS%
```

En PowerShell:

```powershell
$env:UVICORN_WORKERS="1"
uvicorn price_api.main:app --host 0.0.0.0 --port 8000 --workers $env:UVICORN_WORKERS
```

## Tests

```bash
pytest
```

## Endpoints

- `GET /api/products/barcode/{code}`
- `GET /api/products/search?q={term}&limit={n}`
- `POST /api/products`
- `GET /api/prices/compare/{product_id}`
- `GET /api/prices/similar?q={term}&limit={n}`
- `POST /api/prices`
- `GET /api/supermarkets`
- `POST /api/supermarkets`
