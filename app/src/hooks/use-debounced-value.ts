import { useEffect, useState } from 'react';

/**
 * Devuelve un valor con demora controlada.
 *
 * Args:
 *   value: Valor original.
 *   delayMs: Demora en milisegundos.
 *
 * Returns:
 *   Valor actualizado luego del debounce.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debouncedValue;
}
