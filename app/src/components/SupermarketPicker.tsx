import { memo, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useCreateSupermarket, useSupermarkets } from '@/hooks/use-api';
import type { Supermarket } from '@/lib/schemas';
import { AppButton, EmptyState, SkeletonBlock, TextInput } from '@/components/ui';

/**
 * Props del selector de supermercado.
 *
 * Args:
 *   selected: Supermercado seleccionado.
 *   onSelect: Callback al elegir supermercado.
 *
 * Returns:
 *   No aplica.
 */
export interface SupermarketPickerProps {
  selected: Supermarket | null;
  onSelect: (supermarket: Supermarket) => void;
}

/**
 * Selector buscable con alta rapida de supermercado.
 *
 * Args:
 *   selected: Supermercado actual.
 *   onSelect: Handler de seleccion.
 *
 * Returns:
 *   UI de seleccion.
 */
export const SupermarketPicker = memo(function SupermarketPicker({
  selected,
  onSelect,
}: SupermarketPickerProps) {
  const [query, setQuery] = useState('');
  const { data, isLoading, mutate } = useSupermarkets();
  const createSupermarket = useCreateSupermarket();
  const supermarkets = useMemo(() => data ?? [], [data]);

  const filteredSupermarkets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return supermarkets;
    }
    return supermarkets.filter((item) => item.name.toLowerCase().includes(normalizedQuery));
  }, [query, supermarkets]);

  const canCreate = query.trim().length >= 2;

  const handleCreate = async () => {
    try {
      const created = await createSupermarket.create(query.trim());
      await mutate();
      onSelect(created);
      setQuery('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear el supermercado');
    }
  };

  return (
    <section className="grid gap-4">
      <TextInput
        label="Buscar supermercado"
        value={query}
        placeholder="Nombre del supermercado"
        onChange={(event) => setQuery(event.target.value)}
      />

      {selected ? (
        <div className="verge-accent-card p-4 text-sm text-black">
          Sesion actual: <strong>{selected.name}</strong>
        </div>
      ) : null}

      <div className="grid max-h-80 gap-2 overflow-y-auto">
        {isLoading ? (
          <>
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock />
          </>
        ) : filteredSupermarkets.length > 0 ? (
          filteredSupermarkets.map((item) => (
            <button
              key={item.id}
              type="button"
              className="min-tap verge-card px-4 text-left font-semibold text-white transition-colors duration-150 hover:border-blue hover:text-verge-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verge-focus active:bg-button-active"
              onClick={() => onSelect(item)}
            >
              {item.name}
            </button>
          ))
        ) : (
          <EmptyState title="Sin coincidencias" detail="Podes agregarlo como nuevo." />
        )}
      </div>

      <AppButton
        type="button"
        variant="secondary"
        disabled={!canCreate || createSupermarket.isMutating}
        onClick={handleCreate}
      >
        Agregar nuevo
      </AppButton>
    </section>
  );
});
