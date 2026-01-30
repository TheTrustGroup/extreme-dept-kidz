/**
 * Server-side sort and filter for "Just dropped" section.
 * World-class approach: all logic on server, URL-driven filter.
 */

import type { Product } from "@/types";

export type JustDroppedFilter = "all" | "boys" | "girls" | "new";

/** Sort products newest-first (new tag, then createdAt desc). */
export function sortJustDropped(products: Product[]): Product[] {
  const unique = products.filter(
    (p, i, self) => i === self.findIndex((x) => x.id === p.id || x.slug === p.slug)
  );
  return [...unique].sort((a, b) => {
    const aNew = a.tags?.includes("new") ? 1 : 0;
    const bNew = b.tags?.includes("new") ? 1 : 0;
    if (aNew !== bNew) return bNew - aNew;
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

/** Filter by category / tag. Safe for missing category. */
export function filterJustDropped(
  products: Product[],
  filter: JustDroppedFilter
): Product[] {
  if (filter === "all") return products;
  const slug = (p: Product) => p.category?.slug ?? "";
  const name = (p: Product) => (p.category?.name ?? "").toLowerCase();
  if (filter === "boys") return products.filter((p) => slug(p) === "boys" || name(p) === "boys");
  if (filter === "girls") return products.filter((p) => slug(p) === "girls" || name(p) === "girls");
  if (filter === "new") return products.filter((p) => p.tags?.includes("new"));
  return products;
}

/** Parse filter from URL searchParams. Default "all". */
export function parseJustDroppedFilter(
  searchParams: { filter?: string | string[] } | null | undefined
): JustDroppedFilter {
  const raw = searchParams?.filter;
  if (!raw) return "all";
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "boys" || value === "girls" || value === "new" || value === "all") return value;
  return "all";
}

export const JUST_DROPPED_FILTERS: Array<{ id: JustDroppedFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "boys", label: "Boys" },
  { id: "girls", label: "Girls" },
  { id: "new", label: "New Arrivals" },
];
