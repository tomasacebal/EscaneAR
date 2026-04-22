import { memo } from 'react';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import { EmptyState, SkeletonBlock } from '@/components/ui';
import { formatPrice } from '@/lib/format';
import type { SimilarProduct } from '@/lib/schemas';

/**
 * Props de lista de similares.
 *
 * Args:
 *   items: Productos similares.
 *   loading: Estado de carga.
 *
 * Returns:
 *   No aplica.
 */
export interface SimilarProductsListProps {
  items: SimilarProduct[];
  loading: boolean;
}

function SimilarRow({ index, style, data }: ListChildComponentProps<SimilarProduct[]>) {
  const item = data[index];
  return (
    <div style={style} className="px-1 py-1">
      <div className="flex h-full items-center justify-between gap-3 rounded-lg bg-panel px-4 text-ink-dark apple-card-shadow">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.product.description}</p>
          <p className="truncate text-xs text-muted">
            {item.product.brand} · {item.supermarket_name}
          </p>
        </div>
        <p className="font-mono text-link">{formatPrice(item.price)}</p>
      </div>
    </div>
  );
}

/**
 * Lista virtualizada de productos parecidos con mejor precio.
 *
 * Args:
 *   items: Productos similares.
 *   loading: Estado de carga.
 *
 * Returns:
 *   Lista o estado vacio.
 */
export const SimilarProductsList = memo(function SimilarProductsList({
  items,
  loading,
}: SimilarProductsListProps) {
  if (loading) {
    return (
      <div className="grid gap-2">
        <SkeletonBlock />
        <SkeletonBlock />
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState title="Sin similares detectados" detail="Usa la busqueda manual." />;
  }

  return (
    <FixedSizeList
      height={Math.min(220, Math.max(76, items.length * 74))}
      width="100%"
      itemCount={items.length}
      itemSize={74}
      itemData={items}
    >
      {SimilarRow}
    </FixedSizeList>
  );
});
