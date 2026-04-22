import { memo, useMemo } from 'react';
import { EmptyState, SkeletonBlock } from '@/components/ui';
import { formatPrice } from '@/lib/format';
import type { ComparePrice } from '@/lib/schemas';

/**
 * Props de comparativa de precios.
 *
 * Args:
 *   prices: Precios por supermercado.
 *   currentSupermarketId: Supermercado de la sesion.
 *   loading: Estado de carga.
 *
 * Returns:
 *   No aplica.
 */
export interface PriceComparisonProps {
  prices: ComparePrice[];
  currentSupermarketId: string;
  loading: boolean;
}

/**
 * Tabla compacta con ranking y señal visual de precio.
 *
 * Args:
 *   prices: Comparativa recibida del backend.
 *   currentSupermarketId: Supermercado actual.
 *   loading: Indica si hay fetch en curso.
 *
 * Returns:
 *   Seccion de comparativa.
 */
export const PriceComparison = memo(function PriceComparison({
  prices,
  currentSupermarketId,
  loading,
}: PriceComparisonProps) {
  const sortedPrices = useMemo(() => [...prices].sort((a, b) => a.price - b.price), [prices]);
  const currentPrice = sortedPrices.find((item) => item.supermarket_id === currentSupermarketId);
  const signal = currentPrice?.price_signal ?? 'average';
  const isBest = currentPrice ? sortedPrices[0]?.supermarket_id === currentSupermarketId : false;

  const signalText = {
    good: 'Buen precio',
    average: 'Precio promedio',
    high: 'Precio alto',
  }[signal];

  const signalClass = {
    good: 'text-link',
    average: 'text-muted',
    high: 'text-ink-dark',
  }[signal];

  if (loading) {
    return (
      <div className="grid gap-2">
        <SkeletonBlock />
        <SkeletonBlock />
      </div>
    );
  }

  if (sortedPrices.length === 0) {
    return <EmptyState title="Sin comparativa" detail="Todavia no hay precios en otros supers." />;
  }

  return (
    <section className="grid gap-3">
      {currentPrice ? (
        <div className={`rounded-lg bg-panel p-4 font-semibold apple-card-shadow ${signalClass}`}>
          {signalText}
          {isBest ? (
            <span className="ml-2 rounded-full bg-blue px-3 py-1 text-xs text-white">
              MEJOR PRECIO
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg bg-panel apple-card-shadow">
        {sortedPrices.map((item, index) => (
          <div
            key={`${item.supermarket_id}-${item.recorded_at}`}
            className="flex min-h-12 items-center justify-between gap-3 px-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{item.supermarket_name}</p>
              {index === 0 ? <p className="text-xs text-link">MEJOR PRECIO</p> : null}
            </div>
            <p className="font-mono text-link">{formatPrice(item.price)}</p>
          </div>
        ))}
      </div>
    </section>
  );
});
