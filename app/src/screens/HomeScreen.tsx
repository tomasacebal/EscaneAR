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
    <main className="flex h-body flex-col overflow-hidden bg-app text-ink">
      <nav className="apple-glass flex h-12 shrink-0 items-center justify-center px-5 pt-safe">
        <p className="text-xs tracking-normal text-white">EscaneAR</p>
      </nav>

      <header className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="mb-3 text-sm text-link-dark">Comparador mobile</p>
        <h1 className="w-full max-w-xs break-words font-display text-3xl font-semibold leading-tight md:max-w-4xl md:text-6xl">
          Precios claros.
        </h1>
        <p className="mt-4 w-full max-w-72 text-lg leading-tight text-muted-dark md:max-w-lg md:text-xl">
          Escanea y compara en segundos.
        </p>
      </header>

      <section className="mx-auto grid w-full max-w-xs gap-3 pb-safe md:max-w-md">
        <AppButton className="w-full" onClick={onLoad}>
          CARGA
        </AppButton>
        <AppButton className="w-full" variant="ghost" onClick={onRead}>
          LECTURA
        </AppButton>
      </section>
    </main>
  );
}
