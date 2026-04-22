import { useMemo } from 'react';
import { Sparkline } from '@/components/Sparkline';
import { AppButton, EmptyState, SkeletonBlock } from '@/components/ui';
import { useComparePrices } from '@/hooks/use-api';
import { formatPrice, formatRelativeDate } from '@/lib/format';
import type { Product } from '@/lib/schemas';

/**
 * Props del detalle de producto.
 *
 * Args:
 *   product: Producto abierto.
 *   onBack: Vuelve a lectura.
 *
 * Returns:
 *   No aplica.
 */
export interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
}

/**
 * Detalle con historial compacto y sparkline CSS.
 *
 * Args:
 *   product: Producto seleccionado.
 *   onBack: Handler de retorno.
 *
 * Returns:
 *   Pantalla de detalle.
 */
export default function ProductDetailScreen({ product, onBack }: ProductDetailScreenProps) {
  const compare = useComparePrices(product.id);
  const sortedPrices = useMemo(
    () => [...(compare.data ?? [])].sort((a, b) => a.price - b.price),
    [compare.data],
  );

  return (
    <main className="h-body overflow-y-auto bg-app p-4 pt-safe text-ink">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm text-good">DETALLE</p>
          <h1 className="text-2xl font-bold leading-tight">{product.description}</h1>
          <p className="mt-1 text-sm text-muted">
            {product.brand} · {product.quantity} {product.unit}
          </p>
        </div>
        <AppButton variant="ghost" onClick={onBack}>
          Volver
        </AppButton>
      </header>

      <section className="grid gap-4">
        <div>
          <h2 className="mb-2 font-bold">Evolucion</h2>
          <Sparkline values={sortedPrices.map((item) => item.price)} />
        </div>

        <div>
          <h2 className="mb-2 font-bold">Precios por supermercado</h2>
          {compare.isLoading ? (
            <div className="grid gap-2">
              <SkeletonBlock />
              <SkeletonBlock />
            </div>
          ) : sortedPrices.length > 0 ? (
            <div className="grid gap-2">
              {sortedPrices.map((item) => (
                <article key={`${item.supermarket_id}-${item.created_at}`} className="rounded-lg bg-panel p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{item.supermarket_name}</p>
                    <p className="font-mono text-good">{formatPrice(item.price)}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted">{formatRelativeDate(item.created_at)}</p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin precios" detail="No hay historial cacheado para este producto." />
          )}
        </div>
      </section>
    </main>
  );
}
