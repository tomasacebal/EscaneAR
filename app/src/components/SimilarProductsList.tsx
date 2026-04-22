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
    <div style={style} className="border-l border-verge-rule px-3 py-1">
      <div className="verge-card flex h-full items-center justify-between gap-3 px-4 text-white">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-none">{item.product.description}</p>
          <p className="verge-label mt-1 truncate text-muted">
            {item.product.brand} - {item.supermarket_name}
          </p>
        </div>
        <p className="font-mono text-link">{formatPrice(item.price)}</p>
      </div>
    </div>
  );
}

const getSimilarItemKey = (index: number, data: SimilarProduct[]) => {
  const item = data[index];
  return item ? `${item.product.id}-${item.supermarket_id}-${item.recorded_at}` : index;
};

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
      height={Math.min(240, Math.max(84, items.length * 82))}
      width="100%"
      itemCount={items.length}
      itemSize={82}
      itemData={items}
      itemKey={getSimilarItemKey}
    >
      {SimilarRow}
    </FixedSizeList>
  );
});
