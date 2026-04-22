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
    <div style={style} className="border-l border-verge-rule px-3 py-1">
      <div className="verge-card flex h-full items-center justify-between gap-3 px-4 text-white">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-none">{item.product.description}</p>
          <p className="verge-label mt-1 truncate text-muted">{item.supermarket.name}</p>
        </div>
        <p className="font-mono text-link">{formatPrice(item.price)}</p>
      </div>
    </div>
  );
}

const getHistoryItemKey = (index: number, data: SessionHistoryItem[]) => data[index]?.id ?? index;

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

  const height = Math.min(240, Math.max(88, items.length * 76));

  return (
    <FixedSizeList
      height={height}
      width="100%"
      itemCount={items.length}
      itemSize={76}
      itemData={items}
      itemKey={getHistoryItemKey}
    >
      {HistoryRow}
    </FixedSizeList>
  );
});
