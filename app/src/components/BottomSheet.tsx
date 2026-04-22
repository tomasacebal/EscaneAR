import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';

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
  const titleId = useId();
  const sheetRef = useRef<HTMLElement | null>(null);
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

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    sheetRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-app/80">
      <button
        className="absolute inset-0 cursor-default focus-visible:outline-none"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <section
        ref={sheetRef}
        className="pb-safe verge-ring relative z-10 max-h-dvh w-full overflow-y-auto rounded-t-3xl bg-panel p-5 text-white transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-verge-focus"
        style={{ transform: `translateY(${dragOffset}px)` }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div
          className="mb-4 flex touch-none flex-col items-center gap-3"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="h-1.5 w-12 rounded-full bg-blue" />
          <h2 id={titleId} className="verge-label text-center text-blue">
            {title}
          </h2>
        </div>
        {children}
      </section>
    </div>
  );
}
