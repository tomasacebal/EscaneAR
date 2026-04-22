import { AppButton } from '@/components/ui';

/**
 * Props de pantalla inicial.
 *
 * Args:
 *   onLoad: Navega al flujo CARGA.
 *   onRead: Navega al flujo LECTURA.
 *
 * Returns:
 *   No aplica.
 */
export interface HomeScreenProps {
  onLoad: () => void;
  onRead: () => void;
}

/**
 * Entrada principal con acciones tactiles grandes.
 *
 * Args:
 *   onLoad: Handler para carga.
 *   onRead: Handler para lectura.
 *
 * Returns:
 *   Pantalla Home.
 */
export default function HomeScreen({ onLoad, onRead }: HomeScreenProps) {
  return (
    <main className="flex h-body flex-col justify-between overflow-hidden bg-app p-5 pt-safe text-ink">
      <header>
        <p className="font-mono text-sm uppercase text-good">EscaneAR</p>
        <h1 className="mt-2 break-words text-3xl font-bold leading-tight md:text-4xl">
          Comparador de precios
        </h1>
        <p className="mt-3 max-w-md text-muted">
          Escanea productos, carga precios y consulta mejores opciones desde el super.
        </p>
      </header>

      <section className="grid gap-4 pb-safe">
        <AppButton className="min-h-28 text-2xl" onClick={onLoad}>
          CARGA
        </AppButton>
        <AppButton className="min-h-28 text-2xl" variant="secondary" onClick={onRead}>
          LECTURA
        </AppButton>
      </section>
    </main>
  );
}
