"use server";

import { searchProducts } from "@/lib/data/products";

/** Server action: search products. Used by SearchOverlay — no client fetch. */
export async function searchProductsAction(query: string) {
  return searchProducts(query);
}
