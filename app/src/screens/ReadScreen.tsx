import { useMemo, useState } from 'react';
import { ProductList } from '@/components/ProductList';
import { AppButton, SelectField, SkeletonBlock, TextInput } from '@/components/ui';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useProductSearch, useSupermarkets } from '@/hooks/use-api';
import type { Product, Unit } from '@/lib/schemas';

const unitFilters: Array<Unit | 'all'> = ['all', 'kg', 'g', 'l', 'ml', 'un', 'pack'];

/**
 * Props de pantalla lectura.
 *
 * Args:
 *   onBack: Vuelve al Home.
 *   onOpenProduct: Abre el detalle de producto.
 *
 * Returns:
 *   No aplica.
 */
export interface ReadScreenProps {
  onBack: () => void;
  onOpenProduct: (product: Product) => void;
}

/**
 * Catalogo virtualizado con busqueda y filtros.
 *
 * Args:
 *   onBack: Handler de retorno.
 *   onOpenProduct: Handler de detalle.
 *
 * Returns:
 *   Pantalla de lectura.
 */
export default function ReadScreen({ onBack, onOpenProduct }: ReadScreenProps) {
  const [query, setQuery] = useState('');
  const [supermarketId, setSupermarketId] = useState('all');
  const [unit, setUnit] = useState<Unit | 'all'>('all');
  const debouncedQuery = useDebouncedValue(query, 300);
  const products = useProductSearch(debouncedQuery, 200);
  const supermarkets = useSupermarkets();

  const filteredProducts = useMemo(() => {
    return (products.data ?? []).filter((product) => {
      const matchesUnit = unit === 'all' || product.unit === unit;
      const matchesSupermarket =
        supermarketId === 'all' ||
        product.supermarket_ids.length === 0 ||
        product.supermarket_ids.includes(supermarketId);
      return matchesUnit && matchesSupermarket;
    });
  }, [products.data, supermarketId, unit]);

  return (
    <main className="h-body overflow-y-auto bg-app p-4 pt-safe text-ink">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-good">LECTURA</p>
          <h1 className="text-2xl font-bold">Productos</h1>
        </div>
        <AppButton variant="ghost" onClick={onBack}>
          Volver
        </AppButton>
      </header>

      <section className="grid gap-3">
        <TextInput
          label="Buscar"
          value={query}
          placeholder="Producto, marca o termino"
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Supermercado"
            value={supermarketId}
            onChange={(event) => setSupermarketId(event.target.value)}
          >
            <option value="all">Todos</option>
            {(supermarkets.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </SelectField>
          <SelectField label="Unidad" value={unit} onChange={(event) => setUnit(event.target.value as Unit | 'all')}>
            {unitFilters.map((item) => (
              <option key={item} value={item}>
                {item === 'all' ? 'Todas' : item}
              </option>
            ))}
          </SelectField>
        </div>
      </section>

      <section className="mt-4">
        {products.isLoading ? (
          <div className="grid gap-2">
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock />
          </div>
        ) : (
          <ProductList products={filteredProducts} onSelect={onOpenProduct} />
        )}
      </section>
    </main>
  );
}
