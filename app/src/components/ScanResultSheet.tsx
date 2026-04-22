import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { BottomSheet } from '@/components/BottomSheet';
import { PriceComparison } from '@/components/PriceComparison';
import { SimilarProductsList } from '@/components/SimilarProductsList';
import { AppButton, SelectField, TextInput } from '@/components/ui';
import { useComparePrices, useCreatePrice, useCreateProduct, useSimilarPrices } from '@/hooks/use-api';
import { formatPrice } from '@/lib/format';
import type { BarcodeProductResponse, Product, Supermarket, Unit } from '@/lib/schemas';

const units: Unit[] = ['kg', 'g', 'l', 'ml', 'un', 'pack'];

/**
 * Props del resultado de escaneo.
 *
 * Args:
 *   open: Indica si se muestra el sheet.
 *   barcode: Codigo escaneado.
 *   result: Resultado del backend.
 *   supermarket: Supermercado activo.
 *   onClose: Handler de cierre.
 *   onSaved: Handler optimista que devuelve rollback.
 *
 * Returns:
 *   No aplica.
 */
export interface ScanResultSheetProps {
  open: boolean;
  barcode: string | null;
  result: BarcodeProductResponse | undefined;
  supermarket: Supermarket;
  onClose: () => void;
  onSaved: (product: Product, price: number) => () => void;
}

/**
 * Bottom sheet con detalle del producto escaneado y acciones de guardado.
 *
 * Args:
 *   open: Visibilidad actual.
 *   barcode: Codigo detectado.
 *   result: Respuesta de producto.
 *   supermarket: Supermercado de la sesion.
 *   onClose: Cierre del sheet.
 *   onSaved: Callback de guardado optimista con rollback.
 *
 * Returns:
 *   Sheet contextual.
 */
export function ScanResultSheet({
  open,
  barcode,
  result,
  supermarket,
  onClose,
  onSaved,
}: ScanResultSheetProps) {
  const product = result ?? null;
  const latestPrice = useMemo(
    () =>
      result?.prices
        .filter((item) => item.supermarket_id === supermarket.id)
        .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))[0] ?? null,
    [result?.prices, supermarket.id],
  );
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [manualSimilarQuery, setManualSimilarQuery] = useState('');
  const [form, setForm] = useState({
    description: '',
    brand: '',
    quantity: '1',
    unit: 'un' as Unit,
    price: '',
  });
  const [changedPrice, setChangedPrice] = useState('');
  const compare = useComparePrices(product?.id ?? null);
  const similarQuery = manualSimilarQuery || product?.description || '';
  const similar = useSimilarPrices(similarQuery, 30);
  const createProduct = useCreateProduct();
  const createPrice = useCreatePrice();

  const savePrice = async (targetProduct: Product, priceValue: number) => {
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      toast.error('Ingresa un precio valido');
      return;
    }

    const rollback = onSaved(targetProduct, priceValue);
    try {
      await createPrice.create({
        product_id: targetProduct.id,
        supermarket_id: supermarket.id,
        price: priceValue,
      });
      toast.success('Precio guardado');
      onClose();
    } catch (error) {
      if (navigator.onLine) {
        rollback();
      }
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el precio');
    }
  };

  const handleCreateProduct = async () => {
    if (!barcode) {
      toast.error('No hay codigo de barras');
      return;
    }

    const priceValue = Number(form.price);
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      toast.error('Ingresa un precio valido');
      return;
    }

    try {
      const created = await createProduct.create({
        barcode,
        description: form.description,
        brand: form.brand,
        quantity: Number(form.quantity),
        unit: form.unit,
      });
      await savePrice(created, priceValue);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el producto');
    }
  };

  const title = product ? 'Producto encontrado' : 'Producto nuevo';

  return (
    <BottomSheet open={open} title={title} onClose={onClose}>
      {product ? (
        <div className="grid gap-5">
          <section className="verge-card p-5">
            <p className="verge-label text-blue">PRODUCTO</p>
            <p className="mt-2 text-2xl font-bold leading-none text-white">{product.description}</p>
            <p className="text-sm text-muted">
              {product.brand} - {product.quantity} {product.unit}
            </p>
          </section>

          {latestPrice ? (
            <section className="grid gap-3">
              <p className="verge-label text-muted">Sigue al mismo precio?</p>
              <p className="font-mono text-2xl text-link">{formatPrice(latestPrice.price)}</p>
              <div className="grid grid-cols-2 gap-2">
                <AppButton onClick={() => savePrice(product, latestPrice.price)}>Si</AppButton>
                <AppButton variant="danger" onClick={() => setShowPriceInput(true)}>
                  No, cambio
                </AppButton>
              </div>
            </section>
          ) : (
            <p className="verge-card p-4 text-sm text-muted">
              No hay precio previo para este supermercado.
            </p>
          )}

          {showPriceInput || !latestPrice ? (
            <section className="grid gap-3">
              <TextInput
                label="Nuevo precio"
                type="number"
                inputMode="decimal"
                value={changedPrice}
                onChange={(event) => setChangedPrice(event.target.value)}
              />
              <AppButton onClick={() => savePrice(product, Number(changedPrice))}>
                Guardar precio
              </AppButton>
            </section>
          ) : null}

          <section className="grid gap-3">
            <h3 className="verge-label text-blue">Comparativa</h3>
            <PriceComparison
              prices={compare.data ?? []}
              currentSupermarketId={supermarket.id}
              loading={compare.isLoading}
            />
          </section>

          <section className="grid gap-3">
            <h3 className="verge-label text-blue">Productos similares - mejores precios</h3>
            {(similar.data ?? []).length === 0 ? (
              <TextInput
                label="Buscar comparable"
                value={manualSimilarQuery}
                onChange={(event) => setManualSimilarQuery(event.target.value)}
              />
            ) : null}
            <SimilarProductsList items={similar.data ?? []} loading={similar.isLoading} />
          </section>
        </div>
      ) : (
        <div className="grid gap-4">
          <TextInput
            label="Descripcion"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
          <TextInput
            label="Marca"
            value={form.brand}
            onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="Cantidad"
              type="number"
              inputMode="decimal"
              value={form.quantity}
              onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
            />
            <SelectField
              label="Unidad"
              value={form.unit}
              onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value as Unit }))}
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </SelectField>
          </div>
          <TextInput
            label="Precio"
            type="number"
            inputMode="decimal"
            value={form.price}
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
          />
          <AppButton
            disabled={createProduct.isMutating || createPrice.isMutating}
            onClick={handleCreateProduct}
          >
            Guardar producto
          </AppButton>
        </div>
      )}
    </BottomSheet>
  );
}
