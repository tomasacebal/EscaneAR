import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from '@/App';
import { getSupermarkets } from '@/lib/api';
import './styles.css';

registerSW({ immediate: true });

async function loadInitialFallback() {
  const timeout = new Promise<[]>((resolve) => {
    window.setTimeout(() => resolve([]), 800);
  });
  const supermarkets = await Promise.race([getSupermarkets(), timeout]).catch(() => []);
  return { '/api/supermarkets': supermarkets };
}

async function bootstrap() {
  const fallback = await loadInitialFallback();

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App fallback={fallback} />
    </React.StrictMode>,
  );
}

void bootstrap();
