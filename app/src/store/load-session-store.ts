import { create } from 'zustand';
import type { PendingWrite } from '@/lib/offline';
import { readPendingWrites } from '@/lib/offline';
import type { Product, Supermarket } from '@/lib/schemas';

/**
 * Item del historial local de una sesion de carga.
 *
 * Args:
 *   id: Identificador local.
 *   product: Producto escaneado.
 *   supermarket: Supermercado de la sesion.
 *   price: Precio cargado.
 *   scannedAt: Fecha ISO del escaneo.
 *
 * Returns:
 *   No aplica.
 */
export interface SessionHistoryItem {
  id: string;
  product: Product;
  supermarket: Supermarket;
  price: number;
  scannedAt: string;
}

/**
 * Estado global liviano para el flujo de carga.
 *
 * Args:
 *   selectedSupermarket: Supermercado fijado para la sesion.
 *   lastBarcode: Ultimo codigo escaneado.
 *   history: Historial local de escaneos.
 *   pendingWrites: Escrituras pendientes visibles.
 *
 * Returns:
 *   No aplica.
 */
export interface LoadSessionState {
  selectedSupermarket: Supermarket | null;
  lastBarcode: string | null;
  history: SessionHistoryItem[];
  pendingWrites: PendingWrite[];
  setSelectedSupermarket: (supermarket: Supermarket | null) => void;
  setLastBarcode: (barcode: string | null) => void;
  addHistoryItem: (item: Omit<SessionHistoryItem, 'id' | 'scannedAt'>) => string;
  removeHistoryItem: (id: string) => void;
  addPendingWrite: (item: PendingWrite) => void;
  refreshPendingWrites: () => void;
}

export const useLoadSessionStore = create<LoadSessionState>((set) => ({
  selectedSupermarket: null,
  lastBarcode: null,
  history: [],
  pendingWrites: readPendingWrites(),
  setSelectedSupermarket: (selectedSupermarket) => set({ selectedSupermarket }),
  setLastBarcode: (lastBarcode) => set({ lastBarcode }),
  addHistoryItem: (item) => {
    const id = crypto.randomUUID();
    set((state) => ({
      history: [
        {
          id,
          scannedAt: new Date().toISOString(),
          ...item,
        },
        ...state.history,
      ].slice(0, 100),
    }));
    return id;
  },
  removeHistoryItem: (id) =>
    set((state) => ({
      history: state.history.filter((item) => item.id !== id),
    })),
  addPendingWrite: (item) =>
    set((state) => ({
      pendingWrites: [item, ...state.pendingWrites].slice(0, 50),
    })),
  refreshPendingWrites: () => set({ pendingWrites: readPendingWrites() }),
}));
