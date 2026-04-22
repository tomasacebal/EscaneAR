import { lazy, Suspense, useCallback, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { SWRConfig, type SWRConfiguration } from 'swr';
import { SkeletonBlock } from '@/components/ui';
import { runViewTransition } from '@/lib/view-transition';
import type { Product } from '@/lib/schemas';

const HomeScreen = lazy(() => import('@/screens/HomeScreen'));
const LoadScreen = lazy(() => import('@/screens/LoadScreen'));
const ReadScreen = lazy(() => import('@/screens/ReadScreen'));
const ProductDetailScreen = lazy(() => import('@/screens/ProductDetailScreen'));

type RouteName = 'home' | 'load' | 'read' | 'detail';

/**
 * Props de la app raiz.
 *
 * Args:
 *   fallback: Datos iniciales para SWR.
 *
 * Returns:
 *   No aplica.
 */
export interface AppProps {
  fallback: SWRConfiguration['fallback'];
}

/**
 * Componente raiz con navegacion liviana y SWR global.
 *
 * Args:
 *   fallback: Cache inicial precargada.
 *
 * Returns:
 *   Aplicacion PWA.
 */
export function App({ fallback }: AppProps) {
  const [route, setRoute] = useState<RouteName>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const navigate = useCallback((nextRoute: RouteName) => {
    runViewTransition(() => setRoute(nextRoute));
  }, []);

  const openProduct = useCallback((product: Product) => {
    runViewTransition(() => {
      setSelectedProduct(product);
      setRoute('detail');
    });
  }, []);

  return (
    <SWRConfig
      value={{
        fallback,
        dedupingInterval: 10_000,
        focusThrottleInterval: 30_000,
        revalidateOnFocus: false,
      }}
    >
      <Suspense
        fallback={
          <main className="h-body bg-app p-5 pt-safe text-ink">
            <SkeletonBlock className="h-28" />
          </main>
        }
      >
        {route === 'home' ? (
          <HomeScreen onLoad={() => navigate('load')} onRead={() => navigate('read')} />
        ) : null}
        {route === 'load' ? <LoadScreen onBack={() => navigate('home')} /> : null}
        {route === 'read' ? (
          <ReadScreen onBack={() => navigate('home')} onOpenProduct={openProduct} />
        ) : null}
        {route === 'detail' && selectedProduct ? (
          <ProductDetailScreen product={selectedProduct} onBack={() => navigate('read')} />
        ) : null}
      </Suspense>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#272729',
            color: '#ffffff',
            boxShadow: 'rgba(0, 0, 0, 0.22) 3px 5px 30px 0',
          },
        }}
      />
    </SWRConfig>
  );
}
