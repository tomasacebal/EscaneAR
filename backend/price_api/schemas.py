from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field

from price_api.price_quality import PriceSignal


class Unit(StrEnum):
    """Unidad admitida para productos.

    Args:
        Ninguno.

    Returns:
        Valores validos de unidad.
    """

    KG = "kg"
    G = "g"
    L = "l"
    ML = "ml"
    UN = "un"
    PACK = "pack"


class ProductCreate(BaseModel):
    """Payload para crear producto.

    Args:
        barcode: Codigo de barras unico.
        description: Descripcion visible.
        brand: Marca opcional.
        quantity: Cantidad opcional.
        unit: Unidad opcional.

    Returns:
        Datos validados para insercion.
    """

    barcode: str = Field(min_length=1, max_length=64)
    description: str = Field(min_length=2, max_length=240)
    brand: str | None = Field(default=None, max_length=120)
    quantity: float | None = Field(default=None, gt=0)
    unit: Unit | None = None


class ProductRead(BaseModel):
    """Producto devuelto por API.

    Args:
        id: Identificador interno.
        barcode: Codigo de barras.
        description: Descripcion visible.
        brand: Marca opcional.
        quantity: Cantidad opcional.
        unit: Unidad opcional.

    Returns:
        Producto serializable.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    barcode: str
    description: str
    brand: str | None = None
    quantity: float | None = None
    unit: Unit | None = None


class LatestPriceRead(BaseModel):
    """Precio vigente por supermercado.

    Args:
        supermarket_id: Identificador del supermercado.
        supermarket_name: Nombre del supermercado.
        price: Precio vigente.
        recorded_at: Fecha ISO de registro.

    Returns:
        Precio serializable.
    """

    supermarket_id: int
    supermarket_name: str
    price: float
    recorded_at: str


class BarcodeProductResponse(ProductRead):
    """Producto con ultimos precios por supermercado.

    Args:
        prices: Ultimos precios vigentes.

    Returns:
        Producto enriquecido para escaneo.
    """

    prices: list[LatestPriceRead] = Field(default_factory=list)


class PriceCreate(BaseModel):
    """Payload para registrar precio.

    Args:
        product_id: Identificador del producto.
        supermarket_id: Identificador del supermercado.
        price: Precio observado.

    Returns:
        Datos validados para insercion.
    """

    product_id: int = Field(gt=0)
    supermarket_id: int = Field(gt=0)
    price: float = Field(ge=0)


class PriceRead(BaseModel):
    """Precio creado.

    Args:
        id: Identificador del precio.
        product_id: Identificador del producto.
        supermarket_id: Identificador del supermercado.
        price: Precio registrado.
        recorded_at: Fecha ISO de registro.

    Returns:
        Precio serializable.
    """

    id: int
    product_id: int
    supermarket_id: int
    price: float
    recorded_at: str


class ComparePriceRead(LatestPriceRead):
    """Precio comparado con señal.

    Args:
        product_id: Identificador del producto.
        price_signal: Clasificacion contra mediana.

    Returns:
        Precio vigente con señal.
    """

    product_id: int
    price_signal: PriceSignal


class SimilarProductRead(BaseModel):
    """Producto similar con precio minimo vigente.

    Args:
        product: Producto encontrado por FTS5.
        supermarket_id: Identificador del supermercado mas barato.
        supermarket_name: Nombre del supermercado mas barato.
        price: Precio minimo vigente.
        recorded_at: Fecha ISO de registro.

    Returns:
        Producto similar serializable.
    """

    product: ProductRead
    supermarket_id: int
    supermarket_name: str
    price: float
    recorded_at: str


class SupermarketCreate(BaseModel):
    """Payload para crear supermercado.

    Args:
        name: Nombre unico.

    Returns:
        Datos validados para insercion.
    """

    name: str = Field(min_length=2, max_length=120)


class SupermarketRead(BaseModel):
    """Supermercado devuelto por API.

    Args:
        id: Identificador interno.
        name: Nombre visible.

    Returns:
        Supermercado serializable.
    """

    id: int
    name: str
