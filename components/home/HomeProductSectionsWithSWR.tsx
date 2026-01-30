"use client";

import { NewArrivalsSection } from "./NewArrivalsSection";
import { GirlsCollectionSection } from "./GirlsCollectionSection";
import type { Product } from "@/types";

interface HomeProductSectionsWithSWRProps {
  /** Products from server (app/page.tsx via getProducts()). No client fetch. */
  initialProducts: Product[];
}

/**
 * Home product sections. Uses only server-passed products — no client-side fetching.
 */
export function HomeProductSectionsWithSWR({
  initialProducts,
}: HomeProductSectionsWithSWRProps): JSX.Element {
  return (
    <>
      <NewArrivalsSection products={initialProducts} />
      <GirlsCollectionSection products={initialProducts} />
    </>
  );
}
