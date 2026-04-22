/**
 * Dispara feedback haptico si el navegador lo soporta.
 *
 * Args:
 *   pattern: Patron de vibracion en milisegundos.
 *
 * Returns:
 *   No retorna valor.
 */
export function vibrate(pattern: number | number[] = 16): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}
