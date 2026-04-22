import { useCallback } from 'react';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { ScanResultSheet } from '@/components/ScanResultSheet';
import { SessionHistoryList } from '@/components/SessionHistoryList';
import { SupermarketPicker } from '@/components/SupermarketPicker';
import { AppButton, SkeletonBlock } from '@/components/ui';
import { useProductByBarcode } from '@/hooks/use-api';
import { vibrate } from '@/lib/haptics';
import type { Product } from '@/lib/schemas';
import { useLoadSessionStore } from '@/store/load-session-store';

/**
 * Props del flujo de carga.
 *
 * Args:
 *   onBack: Regresa al Home.
 *
 * Returns:
 *   No aplica.
 */
export interface LoadScreenProps {
  onBack: () => void;
}

/**
 * Flujo de carga con seleccion de supermercado, scanner e historial.
 *
 * Args:
 *   onBack: Handler de retorno.
 *
 * Returns:
 *   Pantalla de carga.
 */
export default function LoadScreen({ onBack }: LoadScreenProps) {
  const selectedSupermarket = useLoadSessionStore((state) => state.selectedSupermarket);
  const setSelectedSupermarket = useLoadSessionStore((state) => state.setSelectedSupermarket);
  const lastBarcode = useLoadSessionStore((state) => state.lastBarcode);
  const setLastBarcode = useLoadSessionStore((state) => state.setLastBarcode);
  const history = useLoadSessionStore((state) => state.history);
  const addHistoryItem = useLoadSessionStore((state) => state.addHistoryItem);
  const removeHistoryItem = useLoadSessionStore((state) => state.removeHistoryItem);
  const pendingWrites = useLoadSessionStore((state) => state.pendingWrites);
  const refreshPendingWrites = useLoadSessionStore((state) => state.refreshPendingWrites);
  const productByBarcode = useProductByBarcode(lastBarcode);

  const handleDetected = useCallback(
    (barcode: string) => {
      vibrate([20, 20, 20]);
      setLastBarcode(barcode);
    },
    [setLastBarcode],
  );

  const handleOptimisticSave = useCallback(
    (product: Product, price: number) => {
      if (!selectedSupermarket) {
        return () => undefined;
      }
      const id = addHistoryItem({ product, price, supermarket: selectedSupermarket });
      refreshPendingWrites();
      return () => removeHistoryItem(id);
    },
    [addHistoryItem, refreshPendingWrites, removeHistoryItem, selectedSupermarket],
  );

  if (!selectedSupermarket) {
    return (
      <main className="h-body overflow-y-auto bg-page text-white">
        <header className="verge-nav sticky top-0 z-10 flex min-h-12 items-center justify-between gap-3 px-4 pt-safe text-white">
          <div>
            <p className="verge-label text-muted">CARGA</p>
            <h1 className="text-base font-bold uppercase tracking-wide">Elegir supermercado</h1>
          </div>
          <AppButton variant="ghost" onClick={onBack}>
            Volver
          </AppButton>
        </header>
        <section className="mx-auto max-w-4xl px-5 py-8 md:px-12">
          <p className="verge-label mb-3 text-blue">SETUP</p>
          <h2 className="mb-5 text-3xl font-bold leading-none text-white md:text-4xl">
            Selecciona tu sesion.
          </h2>
          <SupermarketPicker selected={selectedSupermarket} onSelect={setSelectedSupermarket} />
        </section>
      </main>
    );
  }

  return (
    <main className="flex h-body flex-col overflow-hidden bg-app text-ink">
      <header className="verge-nav z-10 px-4 py-2 pt-safe">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="verge-label text-muted">CARGA</p>
            <h1 className="truncate text-base font-bold uppercase tracking-wide">{selectedSupermarket.name}</h1>
          </div>
          <div className="flex gap-2">
            <AppButton variant="ghost" onClick={() => setSelectedSupermarket(null)}>
              Cambiar
            </AppButton>
            <AppButton variant="ghost" onClick={onBack}>
              Salir
            </AppButton>
          </div>
        </div>
        {pendingWrites.length > 0 ? (
          <p className="verge-card mt-2 px-3 py-2 text-xs text-muted-dark">
            {pendingWrites.length} escritura offline pendiente
          </p>
        ) : null}
      </header>

      <BarcodeScanner active={Boolean(selectedSupermarket)} onDetected={handleDetected} />

      <section className="bg-page p-3 pb-safe text-white">
        <h2 className="verge-label mb-2 text-muted">Historial de sesion</h2>
        <SessionHistoryList items={history} />
      </section>

      {lastBarcode && productByBarcode.isLoading ? (
        <div className="fixed inset-x-4 bottom-6 z-30">
          <SkeletonBlock className="h-24" />
        </div>
      ) : null}

      <ScanResultSheet
        open={Boolean(lastBarcode) && !productByBarcode.isLoading}
        barcode={lastBarcode}
        result={productByBarcode.data}
        supermarket={selectedSupermarket}
        onClose={() => setLastBarcode(null)}
        onSaved={handleOptimisticSave}
      />
    </main>
  );
}
