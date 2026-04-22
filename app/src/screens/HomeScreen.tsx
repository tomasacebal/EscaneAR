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
      <nav className="verge-nav flex min-h-12 shrink-0 items-center justify-between gap-4 px-5 pt-safe">
        <p className="verge-label text-white">EscaneAR</p>
        <p className="verge-label hidden text-blue sm:block">PRECIOS</p>
      </nav>

      <header className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-5 py-6 md:px-12 md:py-10">
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <div>
            <p className="verge-whisper mb-3 text-blue">
              Comparador mobile
            </p>
            <h1 className="verge-display max-w-4xl text-5xl text-white sm:text-6xl md:text-8xl">
              EscaneAR
            </h1>
          </div>
          <div className="verge-card p-5">
            <p className="verge-label text-muted">STREAM</p>
            <p className="mt-3 text-2xl font-bold leading-none text-white">
              Precios claros.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Escanea y compara en segundos.
            </p>
          </div>
        </div>

        <section className="mt-auto grid gap-4 pb-safe pt-8 md:grid-cols-2 md:pt-12">
          <article className="verge-accent-card p-6 md:p-8">
            <p className="verge-label text-black">CARGA</p>
            <h2 className="mt-4 text-3xl font-bold leading-none text-black md:text-4xl">
              Alta de precios
            </h2>
            <AppButton className="mt-6 w-full border border-black bg-black text-white hover:bg-white/20" onClick={onLoad}>
              CARGA
            </AppButton>
          </article>
          <article className="verge-card border-verge-purple bg-verge-purple p-6 md:p-8">
            <p className="verge-label text-white">LECTURA</p>
            <h2 className="mt-4 text-3xl font-bold leading-none text-white md:text-4xl">
              Comparativa
            </h2>
            <AppButton className="mt-6 w-full" variant="ghost" onClick={onRead}>
              LECTURA
            </AppButton>
          </article>
        </section>
      </header>
    </main>
  );
}
