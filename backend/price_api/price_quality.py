from __future__ import annotations

from typing import Literal

PriceSignal = Literal["good", "average", "high"]


def median(values: list[float]) -> float | None:
    """Calcula la mediana de una lista numerica.

    Args:
        values: Precios a evaluar.

    Returns:
        Mediana o None si la lista esta vacia.
    """
    if not values:
        return None

    ordered = sorted(values)
    middle = len(ordered) // 2
    if len(ordered) % 2 == 0:
        return (ordered[middle - 1] + ordered[middle]) / 2
    return ordered[middle]


def classify_price(price: float, reference_median: float | None) -> PriceSignal:
    """Clasifica un precio contra la mediana.

    Args:
        price: Precio vigente.
        reference_median: Mediana del grupo.

    Returns:
        Señal de precio: good, average o high.
    """
    if reference_median is None or reference_median <= 0:
        return "average"
    if price > reference_median * 1.15:
        return "high"
    if price < reference_median:
        return "good"
    return "average"
