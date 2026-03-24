/**
 * Maps between admin form fields (Regular price + optional Sale price) and API/DB:
 * - DB `price` (pesewas) = amount the customer pays
 * - DB `originalPrice` (pesewas) = compare-at / MSRP when on sale (must be > price)
 */

export function formPricesFromDb(
  priceCents: number,
  originalCents: number | null | undefined
): { price: number; salePrice?: number } {
  const oc = originalCents ?? null;
  const pc = priceCents;

  if (oc != null && oc > 0 && oc < pc) {
    // Legacy inverted save: "regular" was stored in price, "sale" in originalPrice
    return { price: pc / 100, salePrice: oc / 100 };
  }

  if (oc != null && oc > 0 && oc > pc) {
    return { price: oc / 100, salePrice: pc / 100 };
  }

  return { price: pc / 100 };
}

export function apiPricesFromForm(
  regularCedis: number,
  saleCedis?: number | null
): { price: number; originalPrice: number | null } {
  if (
    saleCedis != null &&
    saleCedis > 0 &&
    !Number.isNaN(saleCedis) &&
    saleCedis < regularCedis
  ) {
    return { price: saleCedis, originalPrice: regularCedis };
  }
  return { price: regularCedis, originalPrice: null };
}
