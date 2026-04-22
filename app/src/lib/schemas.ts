import { z } from 'zod';

const idSchema = z.coerce.string().min(1);

export const unitSchema = z.enum(['kg', 'g', 'l', 'ml', 'un', 'pack']);
export const priceSignalSchema = z.enum(['good', 'average', 'high']);

const optionalTextSchema = z.string().nullable().optional().transform((value) => value ?? '');
const optionalQuantitySchema = z.coerce.number().positive().nullable().optional().transform((value) => value ?? 1);
const optionalUnitSchema = unitSchema.nullable().optional().transform((value) => value ?? 'un');

export const backendErrorSchema = z.object({
  detail: z.string(),
});

export const supermarketSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
});

export const productSchema = z.object({
  id: idSchema,
  barcode: z.string().min(1),
  description: z.string().min(1),
  brand: optionalTextSchema,
  quantity: optionalQuantitySchema,
  unit: optionalUnitSchema,
  supermarket_ids: z.array(idSchema).default([]),
});

export const priceSchema = z.object({
  id: idSchema,
  product_id: idSchema,
  supermarket_id: idSchema,
  price: z.coerce.number().nonnegative(),
  recorded_at: z.string().min(1),
});

export const priceWithSupermarketSchema = z.object({
  supermarket_id: idSchema,
  supermarket_name: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  recorded_at: z.string().min(1),
});

export const barcodeProductResponseSchema = productSchema.extend({
  prices: z.array(priceWithSupermarketSchema).default([]),
});

export const comparePriceSchema = z.object({
  product_id: idSchema,
  supermarket_id: idSchema,
  supermarket_name: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  recorded_at: z.string().min(1),
  price_signal: priceSignalSchema,
});

export const similarProductSchema = z.object({
  product: productSchema,
  supermarket_id: idSchema,
  supermarket_name: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  recorded_at: z.string().min(1),
});

export const createProductInputSchema = z.object({
  barcode: z.string().min(1),
  description: z.string().min(2),
  brand: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unit: unitSchema,
});

export const createPriceInputSchema = z.object({
  product_id: idSchema,
  supermarket_id: idSchema,
  price: z.coerce.number().nonnegative(),
});

export const createSupermarketInputSchema = z.object({
  name: z.string().min(2),
});

export type Unit = z.infer<typeof unitSchema>;
export type PriceSignal = z.infer<typeof priceSignalSchema>;
export type BackendError = z.infer<typeof backendErrorSchema>;
export type Supermarket = z.infer<typeof supermarketSchema>;
export type Product = z.infer<typeof productSchema>;
export type Price = z.infer<typeof priceSchema>;
export type PriceWithSupermarket = z.infer<typeof priceWithSupermarketSchema>;
export type BarcodeProductResponse = z.infer<typeof barcodeProductResponseSchema>;
export type ComparePrice = z.infer<typeof comparePriceSchema>;
export type SimilarProduct = z.infer<typeof similarProductSchema>;
export type CreateProductInput = z.infer<typeof createProductInputSchema>;
export type CreatePriceInput = z.infer<typeof createPriceInputSchema>;
export type CreateSupermarketInput = z.infer<typeof createSupermarketInputSchema>;

/**
 * Normaliza respuestas que pueden llegar como array directo o como `{ items }`.
 *
 * Args:
 *   value: Respuesta desconocida recibida del backend.
 *   itemSchema: Esquema Zod usado para validar cada item.
 *
 * Returns:
 *   Lista validada y tipada.
 */
export function parseList<S extends z.ZodTypeAny>(value: unknown, itemSchema: S): Array<z.output<S>> {
  const arrayValue = Array.isArray(value)
    ? value
    : typeof value === 'object' && value !== null && 'items' in value
      ? (value as { items: unknown }).items
      : [];

  return z.array(itemSchema).parse(arrayValue);
}
