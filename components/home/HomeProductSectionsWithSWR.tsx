"use client";

import useSWR from "swr";
import { NewArrivalsSection } from "./NewArrivalsSection";
import { GirlsCollectionSection } from "./GirlsCollectionSection";
import type { Product } from "@/types";

/** API response shape from /api/products */
interface ProductsApiResponse {
  success?: boolean;
  data?: {
    products: Product[];
    pagination: { total: number; limit: number; offset: number; hasMore: boolean };
  };
}

// cache: 'no-store' so list always revalidates; avoids stale list vs fresh detail mismatch
const fetcher = (url: string): Promise<ProductsApiResponse> =>
  fetch(url, { cache: "no-store" }).then((r) => r.json());

interface HomeProductSectionsWithSWRProps {
  initialProducts: Product[];
}

/**
 * Renders homepage product sections (New Arrivals, Girls) with SWR.
 * Uses server-passed products as initial data and refetches on interval/focus/reconnect
 * so all browsers see fresh products without manual refresh.
 */
export function HomeProductSectionsWithSWR({
  initialProducts,
}: HomeProductSectionsWithSWRProps): JSX.Element {
  const fallbackData: ProductsApiResponse = {
    success: true,
    data: {
      products: initialProducts,
      pagination: {
        total: initialProducts.length,
        limit: 20,
        offset: 0,
        hasMore: false,
      },
    },
  };

  const { data, error } = useSWR<ProductsApiResponse>("/api/products", fetcher, {
    fallbackData,
    refreshInterval: 10000, // Refresh every 10 seconds
    revalidateOnFocus: true, // Refresh when user returns to tab
    revalidateOnReconnect: true, // Refresh when internet reconnects
    keepPreviousData: true, // Show previous data while revalidating
  });

  // CRITICAL: Never replace valid initial data with an empty API response.
  // Empty list from API can be stale cache or transient failure; keep showing server-passed products.
  const apiProducts = data?.data?.products;
  const products: Product[] =
    apiProducts && apiProducts.length > 0 ? apiProducts : initialProducts;

  if (error) {
    // On error, still show initial/previous products
    return (
      <>
        <NewArrivalsSection products={products} />
        <GirlsCollectionSection products={products} />
      </>
    );
  }

  return (
    <>
      <NewArrivalsSection products={products} />
      <GirlsCollectionSection products={products} />
    </>
  );
}
