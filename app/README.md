# EscaneAR PWA

PWA mobile-first para cargar y consultar precios de supermercado por codigo de barras.

## Stack

- Vite + React 18 + TypeScript strict
- TailwindCSS v4 con `@tailwindcss/vite`
- SWR para consultas y cache
- Zustand para sesion de carga
- Zod para validar limites de API
- @zxing/library para scanner por camara
- react-window para listas virtualizadas
- react-hot-toast para feedback
- vite-plugin-pwa + Workbox para cache offline y Background Sync

## Setup

```bash
cd app
npm install
cp .env.example .env
npm run dev
```

La variable principal es:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

El proxy de desarrollo tambien apunta `/api` a `http://localhost:8000`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

## Backend esperado

- `GET /api/products/barcode/:code`
- `GET /api/products/search?q=&limit=`
- `GET /api/supermarkets`
- `POST /api/supermarkets`
- `POST /api/products`
- `POST /api/prices`
- `GET /api/prices/compare/:product_id`
- `GET /api/prices/similar?q=&limit=`

Los errores deben usar `{ "detail": "mensaje" }`.

## Offline

La lectura usa cache `NetworkFirst` para `/api` y puede mostrar datos cacheados sin red.
Las escrituras `POST` a productos, precios y supermercados usan Workbox Background Sync.
Ademas se registra una cola local minima para mostrar escrituras pendientes en la UI.

## Notas de UX

- La pantalla inicial ofrece CARGA y LECTURA con targets tactiles grandes.
- CARGA fija un supermercado por sesion antes de activar camara.
- LECTURA usa busqueda con debounce de 300 ms y listas virtualizadas.
- La UI usa modo oscuro por defecto con acento verde lima para buenos precios.
