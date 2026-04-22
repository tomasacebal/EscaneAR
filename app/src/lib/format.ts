import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea un precio en pesos argentinos.
 *
 * Args:
 *   value: Valor numerico del precio.
 *
 * Returns:
 *   Texto monetario compacto.
 */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formatea una fecha relativa en español.
 *
 * Args:
 *   value: Fecha ISO.
 *
 * Returns:
 *   Texto relativo legible.
 */
export function formatRelativeDate(value: string): string {
  return formatDistanceToNowStrict(parseISO(value), {
    addSuffix: true,
    locale: es,
  })
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/**
 * Calcula la mediana de una lista de precios.
 *
 * Args:
 *   values: Valores numericos.
 *
 * Returns:
 *   Mediana o null si no hay valores.
 */
export function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

/**
 * Clasifica un precio contra una mediana de referencia.
 *
 * Args:
 *   price: Precio actual.
 *   referenceMedian: Mediana de otros supermercados.
 *
 * Returns:
 *   Estado visual de precio.
 */
export function priceSignal(
  price: number,
  referenceMedian: number | null,
): 'good' | 'average' | 'high' {
  if (referenceMedian === null || referenceMedian === 0) {
    return 'average';
  }

  if (price <= referenceMedian * 0.95) {
    return 'good';
  }

  if (price >= referenceMedian * 1.1) {
    return 'high';
  }

  return 'average';
}
