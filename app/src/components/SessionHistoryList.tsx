import { memo } from 'react';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import { EmptyState } from '@/components/ui';
import { formatPrice } from '@/lib/format';
import type { SessionHistoryItem } from '@/store/load-session-store';

/**
 * Props del historial de sesion.
 *
 * Args:
 *   items: Items escaneados durante la sesion.
 *
 * Returns:
 *   No aplica.
 */
export interface SessionHistoryListProps {
  items: SessionHistoryItem[];
}

function HistoryRow({ index, style, data }: ListChildComponentProps<SessionHistoryItem[]>) {
  const item = data[index];
  return (
    <div style={style} className="px-1 py-1">
      <div className="flex h-full items-center justify-between gap-3 rounded-lg bg-panel-soft px-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.product.description}</p>
          <p className="truncate text-xs text-muted">{item.supermarket.name}</p>
        </div>
        <p className="font-mono text-good">{formatPrice(item.price)}</p>
      </div>
    </div>
  );
}

/**
 * Lista virtualizada de productos escaneados en la sesion.
 *
 * Args:
 *   items: Historial de sesion.
 *
 * Returns:
 *   Lista o estado vacio.
 */
export const SessionHistoryList = memo(function SessionHistoryList({ items }: SessionHistoryListProps) {
  if (items.length === 0) {
    return <EmptyState title="Sin escaneos aun" detail="Los ultimos productos aparecen aca." />;
  }

  const height = Math.min(220, Math.max(84, items.length * 70));

  return (
    <FixedSizeList
      height={height}
      width="100%"
      itemCount={items.length}
      itemSize={70}
      itemData={items}
    >
      {HistoryRow}
    </FixedSizeList>
  );
});
