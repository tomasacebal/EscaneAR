import { memo } from 'react';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import { EmptyState } from '@/components/ui';
import type { Product } from '@/lib/schemas';

/**
 * Props de lista de productos.
 *
 * Args:
 *   products: Productos a renderizar.
 *   onSelect: Handler de apertura.
 *
 * Returns:
 *   No aplica.
 */
export interface ProductListProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

interface ProductRowData {
  products: Product[];
  onSelect: (product: Product) => void;
}

function ProductRow({ index, style, data }: ListChildComponentProps<ProductRowData>) {
  const product = data.products[index];
  return (
    <div style={style} className="px-1 py-1">
      <button
        className="flex h-full w-full items-center justify-between gap-3 rounded-lg bg-panel px-4 text-left text-ink-dark transition active:bg-button-active apple-card-shadow"
        onClick={() => data.onSelect(product)}
      >
        <span className="min-w-0">
          <span className="block truncate font-semibold">{product.description}</span>
          <span className="block truncate text-sm text-muted">
            {product.brand} · {product.quantity} {product.unit}
          </span>
        </span>
        <span className="rounded-full text-xs text-link">
          Ver
        </span>
      </button>
    </div>
  );
}

/**
 * Lista virtualizada para catalogo de productos.
 *
 * Args:
 *   products: Productos filtrados.
 *   onSelect: Handler de seleccion.
 *
 * Returns:
 *   Lista virtualizada o estado vacio.
 */
export const ProductList = memo(function ProductList({ products, onSelect }: ProductListProps) {
  if (products.length === 0) {
    return <EmptyState title="Sin productos" detail="Proba con otra busqueda o filtro." />;
  }

  return (
    <FixedSizeList
      height={Math.min(window.innerHeight - 270, 560)}
      width="100%"
      itemCount={products.length}
      itemSize={78}
      itemData={{ products, onSelect }}
    >
      {ProductRow}
    </FixedSizeList>
  );
});
