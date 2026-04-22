import { memo, useMemo } from 'react';

/**
 * Props del sparkline.
 *
 * Args:
 *   values: Valores numericos a graficar.
 *
 * Returns:
 *   No aplica.
 */
export interface SparklineProps {
  values: number[];
}

/**
 * Grafico compacto con CSS para historial de precios.
 *
 * Args:
 *   values: Serie de precios.
 *
 * Returns:
 *   Mini grafico visual.
 */
export const Sparkline = memo(function Sparkline({ values }: SparklineProps) {
  const bars = useMemo(() => {
    const max = Math.max(...values, 1);
    return values.map((value) => Math.max(12, Math.round((value / max) * 100)));
  }, [values]);

  if (values.length === 0) {
    return <div className="h-16 rounded-lg bg-black/10" />;
  }

  return (
    <div className="flex h-20 items-end gap-1 rounded-lg bg-panel p-2 apple-card-shadow">
      {bars.map((height, index) => (
        <div
          key={`${height}-${index}`}
          className="flex-1 rounded-t bg-blue"
          style={{ height: `${height}%` }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
});
