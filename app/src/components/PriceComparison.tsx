import { memo, useMemo } from 'react';
import { EmptyState, SkeletonBlock } from '@/components/ui';
import { formatPrice, median, priceSignal } from '@/lib/format';
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
  const otherPrices = sortedPrices.filter((item) => item.supermarket_id !== currentSupermarketId);
  const signal = priceSignal(currentPrice?.price ?? 0, median(otherPrices.map((item) => item.price)));
  const isBest = currentPrice ? sortedPrices[0]?.supermarket_id === currentSupermarketId : false;

  const signalText = {
    good: 'Buen precio',
    average: 'Precio promedio',
    bad: 'Precio alto',
  }[signal];

  const signalClass = {
    good: 'text-good',
    average: 'text-warn',
    bad: 'text-bad',
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
        <div className={`rounded-lg border border-line bg-panel-soft p-3 font-semibold ${signalClass}`}>
          {signalText}
          {isBest ? (
            <span className="ml-2 rounded-full bg-good px-2 py-1 text-xs text-app">MEJOR PRECIO</span>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-line">
        {sortedPrices.map((item, index) => (
          <div
            key={`${item.supermarket_id}-${item.created_at}`}
            className="flex min-h-12 items-center justify-between gap-3 border-b border-line bg-panel px-3 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{item.supermarket_name}</p>
              {index === 0 ? <p className="text-xs text-good">MEJOR PRECIO</p> : null}
            </div>
            <p className="font-mono text-good">{formatPrice(item.price)}</p>
          </div>
        ))}
      </div>
    </section>
  );
});
