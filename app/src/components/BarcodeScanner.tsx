import { BrowserMultiFormatReader } from '@zxing/library';
import { memo, useEffect, useRef, useState } from 'react';
import { EmptyState } from '@/components/ui';

/**
 * Props del scanner de codigo de barras.
 *
 * Args:
 *   active: Indica si debe usar la camara.
 *   onDetected: Callback con el codigo detectado.
 *
 * Returns:
 *   No aplica.
 */
export interface BarcodeScannerProps {
  active: boolean;
  onDetected: (barcode: string) => void;
}

/**
 * Visor de camara usando ZXing para detectar codigos.
 *
 * Args:
 *   active: Estado de lectura.
 *   onDetected: Handler invocado con el codigo.
 *
 * Returns:
 *   Video con overlay de escaneo.
 */
export const BarcodeScanner = memo(function BarcodeScanner({ active, onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastCodeRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active || !videoRef.current) {
      return undefined;
    }

    const reader = new BrowserMultiFormatReader();
    let mounted = true;

    reader
      .decodeFromVideoDevice(null, videoRef.current, (result) => {
        const text = result?.getText();
        if (!mounted || !text || text === lastCodeRef.current) {
          return;
        }
        lastCodeRef.current = text;
        window.setTimeout(() => {
          lastCodeRef.current = null;
        }, 2500);
        onDetected(text);
      })
      .catch(() => {
        if (mounted) {
          setError('No se pudo abrir la camara');
        }
      });

    return () => {
      mounted = false;
      reader.reset();
    };
  }, [active, onDetected]);

  return (
    <div className="relative min-h-96 flex-1 overflow-hidden bg-black">
      <video ref={videoRef} className="h-full min-h-96 w-full object-cover" muted playsInline />
      <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/20">
        <div className="h-28 w-72 max-w-xs rounded-xl border-2 border-blue bg-app/10" />
      </div>
      <div className="apple-glass absolute bottom-4 left-4 right-4 rounded-lg p-3 text-center text-sm text-white">
        Alinea el codigo dentro del marco
      </div>
      {error ? (
        <div className="absolute inset-x-4 top-4">
          <EmptyState title={error} detail="Revisa permisos del navegador." />
        </div>
      ) : null}
    </div>
  );
});
