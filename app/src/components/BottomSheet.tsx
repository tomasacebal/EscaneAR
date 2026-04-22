import { useCallback, useState, type ReactNode } from 'react';

/**
 * Props del bottom sheet.
 *
 * Args:
 *   open: Indica si esta visible.
 *   title: Titulo superior.
 *   children: Contenido.
 *   onClose: Cierre solicitado.
 *
 * Returns:
 *   No aplica.
 */
export interface BottomSheetProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

/**
 * Bottom sheet tactil con swipe vertical para cerrar.
 *
 * Args:
 *   open: Visibilidad actual.
 *   title: Titulo visible.
 *   children: Contenido interno.
 *   onClose: Handler de cierre.
 *
 * Returns:
 *   Overlay con panel inferior.
 */
export function BottomSheet({ open, title, children, onClose }: BottomSheetProps) {
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    setDragStart(event.clientY);
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (dragStart === null) {
        return;
      }
      setDragOffset(Math.max(0, event.clientY - dragStart));
    },
    [dragStart],
  );

  const onPointerUp = useCallback(() => {
    if (dragOffset > 90) {
      onClose();
    }
    setDragStart(null);
    setDragOffset(0);
  }, [dragOffset, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-app/70 backdrop-blur-sm">
      <button className="absolute inset-0 cursor-default" aria-label="Cerrar" onClick={onClose} />
      <section
        className="pb-safe apple-card-shadow relative z-10 max-h-dvh w-full overflow-y-auto rounded-t-xl bg-panel p-5 text-ink-dark transition-transform"
        style={{ transform: `translateY(${dragOffset}px)` }}
        aria-label={title}
      >
        <div
          className="mb-4 flex touch-none flex-col items-center gap-3"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="h-1.5 w-12 rounded-full bg-black/20" />
          <h2 className="text-center text-lg font-bold">{title}</h2>
        </div>
        {children}
      </section>
    </div>
  );
}
