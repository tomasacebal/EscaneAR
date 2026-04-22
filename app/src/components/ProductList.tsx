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
    <div style={style} className="border-l border-verge-rule px-3 py-1">
      <button
        type="button"
        className="group verge-card flex h-full w-full items-center justify-between gap-3 px-5 text-left text-white transition-colors duration-150 hover:border-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verge-focus active:bg-button-active"
        onClick={() => data.onSelect(product)}
      >
        <span className="min-w-0">
          <span className="verge-label block text-blue">PRODUCTO</span>
          <span className="block truncate text-xl font-bold leading-none transition-colors duration-150 group-hover:text-verge-blue">
            {product.description}
          </span>
          <span className="mt-1 block truncate text-sm text-muted">
            {product.brand} - {product.quantity} {product.unit}
          </span>
        </span>
        <span className="verge-label rounded-full border border-blue px-3 py-1 text-blue">Ver</span>
      </button>
    </div>
  );
}

const getProductItemKey = (index: number, data: ProductRowData) => data.products[index]?.id ?? index;

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

  const listHeight = Math.min(620, Math.max(96, products.length * 96));

  return (
    <FixedSizeList
      height={listHeight}
      width="100%"
      itemCount={products.length}
      itemSize={96}
      itemData={{ products, onSelect }}
      itemKey={getProductItemKey}
    >
      {ProductRow}
    </FixedSizeList>
  );
});
