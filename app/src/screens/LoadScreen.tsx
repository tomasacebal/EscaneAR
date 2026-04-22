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
      <main className="h-body overflow-y-auto bg-app p-5 pt-safe text-ink">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-sm text-good">CARGA</p>
            <h1 className="text-2xl font-bold">Elegir supermercado</h1>
          </div>
          <AppButton variant="ghost" onClick={onBack}>
            Volver
          </AppButton>
        </header>
        <SupermarketPicker selected={selectedSupermarket} onSelect={setSelectedSupermarket} />
      </main>
    );
  }

  return (
    <main className="flex h-body flex-col overflow-hidden bg-app text-ink">
      <header className="z-10 border-b border-line bg-app/95 px-4 py-3 pt-safe backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs text-good">CARGA</p>
            <h1 className="truncate text-lg font-bold">{selectedSupermarket.name}</h1>
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
          <p className="mt-2 rounded-lg bg-panel-soft px-3 py-2 text-xs text-warn">
            {pendingWrites.length} escritura offline pendiente
          </p>
        ) : null}
      </header>

      <BarcodeScanner active={Boolean(selectedSupermarket)} onDetected={handleDetected} />

      <section className="border-t border-line bg-app p-3 pb-safe">
        <h2 className="mb-2 text-sm font-bold uppercase text-muted">Historial de sesion</h2>
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
