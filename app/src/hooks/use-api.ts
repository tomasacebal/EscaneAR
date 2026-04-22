import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  comparePrices,
  createPrice,
  createProduct,
  createSupermarket,
  getProductByBarcode,
  getSimilarPrices,
  getSupermarkets,
  searchProducts,
} from '@/lib/api';
import type {
  BarcodeProductResponse,
  ComparePrice,
  CreatePriceInput,
  CreateProductInput,
  Price,
  Product,
  SimilarProduct,
  Supermarket,
} from '@/lib/schemas';

const swrOptions = {
  dedupingInterval: 10_000,
  focusThrottleInterval: 30_000,
  revalidateOnFocus: false,
};

/**
 * Consulta supermercados con cache SWR.
 *
 * Args:
 *   Ninguno.
 *
 * Returns:
 *   Estado SWR de supermercados.
 */
export function useSupermarkets() {
  return useSWR<Supermarket[]>('/api/supermarkets', getSupermarkets, swrOptions);
}

/**
 * Consulta producto por codigo de barras.
 *
 * Args:
 *   barcode: Codigo escaneado o null.
 *
 * Returns:
 *   Estado SWR del producto escaneado.
 */
export function useProductByBarcode(barcode: string | null) {
  return useSWR<BarcodeProductResponse>(
    barcode ? `/api/products/barcode/${barcode}` : null,
    () => getProductByBarcode(barcode ?? ''),
    swrOptions,
  );
}

/**
 * Busca productos por texto.
 *
 * Args:
 *   query: Texto de busqueda.
 *   limit: Maximo de resultados.
 *
 * Returns:
 *   Estado SWR de productos.
 */
export function useProductSearch(query: string, limit = 80) {
  const normalizedQuery = query.trim();
  return useSWR<Product[]>(
    ['/api/products/search', normalizedQuery, limit],
    () => searchProducts(normalizedQuery, limit),
    swrOptions,
  );
}

/**
 * Consulta comparativa de precios.
 *
 * Args:
 *   productId: Identificador del producto o null.
 *
 * Returns:
 *   Estado SWR de comparativa.
 */
export function useComparePrices(productId: string | null) {
  return useSWR<ComparePrice[]>(
    productId ? `/api/prices/compare/${productId}` : null,
    () => comparePrices(productId ?? ''),
    swrOptions,
  );
}

/**
 * Consulta productos similares.
 *
 * Args:
 *   query: Texto base para similitud.
 *   limit: Maximo de resultados.
 *
 * Returns:
 *   Estado SWR de similares.
 */
export function useSimilarPrices(query: string, limit = 30) {
  const normalizedQuery = query.trim();
  return useSWR<SimilarProduct[]>(
    normalizedQuery ? ['/api/prices/similar', normalizedQuery, limit] : null,
    () => getSimilarPrices(normalizedQuery, limit),
    swrOptions,
  );
}

/**
 * Mutacion para crear supermercados con actualizacion optimista.
 *
 * Args:
 *   Ninguno.
 *
 * Returns:
 *   Helper tipado para crear supermercados.
 */
export function useCreateSupermarket() {
  const mutation = useSWRMutation<Supermarket, Error, string, { name: string }>(
    '/api/supermarkets',
    (_key, { arg }) => createSupermarket(arg),
  );

  const create = (name: string) =>
    mutation.trigger(
      { name },
      {
        optimisticData: {
          id: `tmp-${crypto.randomUUID()}`,
          name,
        },
        rollbackOnError: true,
        revalidate: true,
      },
    );

  return { ...mutation, create };
}

/**
 * Mutacion para crear productos con datos optimistas.
 *
 * Args:
 *   Ninguno.
 *
 * Returns:
 *   Helper tipado para crear productos.
 */
export function useCreateProduct() {
  const mutation = useSWRMutation<Product, Error, string, CreateProductInput>(
    '/api/products',
    (_key, { arg }) => createProduct(arg),
  );

  const create = (input: CreateProductInput) =>
    mutation.trigger(input, {
      optimisticData: {
        id: `tmp-${crypto.randomUUID()}`,
        supermarket_ids: [],
        ...input,
      },
      rollbackOnError: true,
      revalidate: false,
    });

  return { ...mutation, create };
}

/**
 * Mutacion para registrar precios con datos optimistas.
 *
 * Args:
 *   Ninguno.
 *
 * Returns:
 *   Helper tipado para guardar precios.
 */
export function useCreatePrice() {
  const mutation = useSWRMutation<Price, Error, string, CreatePriceInput>(
    '/api/prices',
    (_key, { arg }) => createPrice(arg),
  );

  const create = (input: CreatePriceInput) =>
    mutation.trigger(input, {
      optimisticData: {
        id: `tmp-${crypto.randomUUID()}`,
        created_at: new Date().toISOString(),
        ...input,
      },
      rollbackOnError: true,
      revalidate: false,
    });

  return { ...mutation, create };
}
