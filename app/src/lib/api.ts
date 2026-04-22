import type { z } from 'zod';
import {
  backendErrorSchema,
  barcodeProductResponseSchema,
  comparePriceSchema,
  createPriceInputSchema,
  createProductInputSchema,
  createSupermarketInputSchema,
  parseList,
  priceSchema,
  productSchema,
  similarProductSchema,
  supermarketSchema,
  type BarcodeProductResponse,
  type ComparePrice,
  type CreatePriceInput,
  type CreateProductInput,
  type CreateSupermarketInput,
  type Price,
  type Product,
  type SimilarProduct,
  type Supermarket,
} from '@/lib/schemas';
import { registerPendingWrite } from '@/lib/offline';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

class ApiClientError extends Error {
  readonly status: number;

  /**
   * Crea un error tipado de API.
   *
   * Args:
   *   message: Mensaje visible para la UI.
   *   status: Codigo HTTP asociado.
   *
   * Returns:
   *   Instancia de error de API.
   */
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

/**
 * Arma una URL absoluta o relativa segun la configuracion de entorno.
 *
 * Args:
 *   path: Ruta de API que comienza con `/`.
 *
 * Returns:
 *   URL final para fetch.
 */
export function apiUrl(path: string): string {
  return `${apiBaseUrl}${path}`;
}

async function parseError(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return `Error ${response.status}`;
  }

  const payload: unknown = await response.json();
  const parsed = backendErrorSchema.safeParse(payload);
  return parsed.success ? parsed.data.detail : `Error ${response.status}`;
}

/**
 * Ejecuta una llamada HTTP validando el limite de API con Zod.
 *
 * Args:
 *   path: Ruta del endpoint.
 *   schema: Esquema Zod de respuesta esperada.
 *   init: Opciones estandar de fetch.
 *
 * Returns:
 *   Respuesta validada y tipada.
 */
export async function apiRequest<S extends z.ZodTypeAny>(
  path: string,
  schema: S,
  init: RequestInit = {},
): Promise<z.output<S>> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const method = (init.method || 'GET').toUpperCase();

  const requestBody = init.body;

  try {
    const response = await fetch(apiUrl(path), {
      ...init,
      method,
      headers,
    });

    if (!response.ok) {
      throw new ApiClientError(await parseError(response), response.status);
    }

    const data: unknown = await response.json();
    return schema.parse(data);
  } catch (error) {
    const isNetworkError = error instanceof TypeError || navigator.onLine === false;
    if (method === 'POST' && isNetworkError) {
      registerPendingWrite(path, requestBody ? JSON.parse(String(requestBody)) : null);
    }
    throw error;
  }
}

/**
 * Obtiene supermercados disponibles.
 *
 * Args:
 *   Ninguno.
 *
 * Returns:
 *   Lista de supermercados.
 */
export async function getSupermarkets(): Promise<Supermarket[]> {
  const data: unknown = await fetch(apiUrl('/api/supermarkets')).then(async (response) => {
    if (!response.ok) {
      throw new ApiClientError(await parseError(response), response.status);
    }
    return response.json();
  });
  return parseList(data, supermarketSchema);
}

/**
 * Busca un producto por codigo de barras.
 *
 * Args:
 *   barcode: Codigo de barras escaneado.
 *
 * Returns:
 *   Producto encontrado y su historial de precios.
 */
export function getProductByBarcode(barcode: string): Promise<BarcodeProductResponse> {
  return apiRequest(`/api/products/barcode/${encodeURIComponent(barcode)}`, barcodeProductResponseSchema);
}

/**
 * Busca productos por texto.
 *
 * Args:
 *   query: Texto de busqueda.
 *   limit: Maximo de resultados.
 *
 * Returns:
 *   Productos encontrados.
 */
export async function searchProducts(query: string, limit: number): Promise<Product[]> {
  const data: unknown = await fetch(
    apiUrl(`/api/products/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  ).then(async (response) => {
    if (!response.ok) {
      throw new ApiClientError(await parseError(response), response.status);
    }
    return response.json();
  });
  return parseList(data, productSchema);
}

/**
 * Obtiene comparativa de precios.
 *
 * Args:
 *   productId: Identificador del producto.
 *
 * Returns:
 *   Precios por supermercado ordenables por la UI.
 */
export async function comparePrices(productId: string): Promise<ComparePrice[]> {
  const data: unknown = await fetch(apiUrl(`/api/prices/compare/${encodeURIComponent(productId)}`)).then(
    async (response) => {
      if (!response.ok) {
        throw new ApiClientError(await parseError(response), response.status);
      }
      return response.json();
    },
  );
  return parseList(data, comparePriceSchema);
}

/**
 * Obtiene productos similares con mejor precio.
 *
 * Args:
 *   query: Texto de similitud o busqueda manual.
 *   limit: Maximo de resultados.
 *
 * Returns:
 *   Productos similares con precio minimo.
 */
export async function getSimilarPrices(query: string, limit: number): Promise<SimilarProduct[]> {
  const data: unknown = await fetch(
    apiUrl(`/api/prices/similar?q=${encodeURIComponent(query)}&limit=${limit}`),
  ).then(async (response) => {
    if (!response.ok) {
      throw new ApiClientError(await parseError(response), response.status);
    }
    return response.json();
  });
  return parseList(data, similarProductSchema);
}

/**
 * Crea un supermercado nuevo.
 *
 * Args:
 *   input: Nombre del supermercado.
 *
 * Returns:
 *   Supermercado creado.
 */
export function createSupermarket(input: CreateSupermarketInput): Promise<Supermarket> {
  const payload = createSupermarketInputSchema.parse(input);
  return apiRequest('/api/supermarkets', supermarketSchema, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Crea un producto nuevo.
 *
 * Args:
 *   input: Datos del producto.
 *
 * Returns:
 *   Producto creado.
 */
export function createProduct(input: CreateProductInput): Promise<Product> {
  const payload = createProductInputSchema.parse(input);
  return apiRequest('/api/products', productSchema, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Registra un precio.
 *
 * Args:
 *   input: Producto, supermercado y precio.
 *
 * Returns:
 *   Precio creado.
 */
export function createPrice(input: CreatePriceInput): Promise<Price> {
  const payload = createPriceInputSchema.parse(input);
  return apiRequest('/api/prices', priceSchema, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
