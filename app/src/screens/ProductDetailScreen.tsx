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
    <main className="h-body overflow-y-auto bg-page text-white">
      <header className="verge-nav sticky top-0 z-10 flex min-h-12 items-center justify-between gap-3 px-4 pt-safe text-white">
        <div className="min-w-0">
          <p className="verge-label text-muted">DETALLE</p>
          <h1 className="truncate text-base font-bold uppercase tracking-wide">{product.description}</h1>
        </div>
        <AppButton variant="ghost" onClick={onBack}>
          Volver
        </AppButton>
      </header>

      <section className="mx-auto grid max-w-4xl gap-5 px-4 py-6 md:px-12">
        <div className="verge-card p-5">
          <p className="verge-label text-blue">PRODUCTO</p>
          <h2 className="mt-2 text-3xl font-bold leading-none text-white md:text-4xl">{product.description}</h2>
          <p className="mt-2 text-lg text-muted">
            {product.brand} - {product.quantity} {product.unit}
          </p>
        </div>
        <div>
          <h2 className="verge-label mb-2 text-blue">Evolucion</h2>
          <Sparkline values={sortedPrices.map((item) => item.price)} />
        </div>

        <div>
          <h2 className="verge-label mb-2 text-blue">Precios por supermercado</h2>
          {compare.isLoading ? (
            <div className="grid gap-2">
              <SkeletonBlock />
              <SkeletonBlock />
            </div>
          ) : sortedPrices.length > 0 ? (
            <div className="grid gap-2">
              {sortedPrices.map((item) => (
                <article
                  key={`${item.supermarket_id}-${item.recorded_at}`}
                  className="verge-card p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-white">{item.supermarket_name}</p>
                    <p className="font-mono text-link">{formatPrice(item.price)}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted">{formatRelativeDate(item.recorded_at)}</p>
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
