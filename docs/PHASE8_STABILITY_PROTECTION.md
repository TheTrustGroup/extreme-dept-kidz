# Phase 8 — Stability Protection Layer (No Regressions)

## Build Stability Rules

These rules MUST NOT be violated. They guarantee product visibility and layout integrity.

### 1. No client product fetching

- **Rule:** All product data MUST be fetched in server components or server-side code only (`lib/data/products.ts`).
- **Forbidden:** `fetch()` / axios / React Query / SWR for products in client components.
- **Allowed:** Server components calling `getProducts()`, `getProductBySlug()`, `getProductsByCategory()`, `searchProducts()` from `lib/data/products.ts`; API routes and server actions using the same.

### 2. No ISR on product detail

- **Rule:** Product detail pages MUST use `export const dynamic = "force-dynamic"` and `export const revalidate = 0`.
- **Forbidden:** `revalidate = <number>`, `generateStaticParams` for product pages, static generation of `/products/[slug]`.
- **Required:** Product page fetches with `const product = await getProductBySlug(slug);` inside the server component.

### 3. No duplicate API calls

- **Rule:** Product data flows from a single source: `lib/data/products.ts`. Pages and API routes that need products MUST import from there and call once per request where needed.
- **Forbidden:** Same product data fetched from multiple places (e.g. both an API route and a client fetch for the same list).

### 4. No layered absolute layouts

- **Rule:** No absolute positioning outside the designated container (e.g. product card image-wrap). Phase 5 product card structure is strict: image + Quick View inside image-wrap; info below.
- **Forbidden:** Absolute elements that overlap product text; floating buttons over the info block.

### 5. No layout stacking hacks

- **Rule:** No z-index stacking hacks to fix overlap. Layout must be correct by structure (vertical stack, no floats over content).
- **Forbidden:** Arbitrary `z-index` on product cards or info blocks to “fix” overlapping UI.

---

## Diagnostic Logging (TEMPORARY)

To detect **missing DB records**, **cache poisoning**, and **stale renders**, temporary logging is added to:

- `getProducts()` — logs timestamp, elapsed ms, count, first/last id, and warns on empty result.
- `getProductBySlug()` — logs timestamp, elapsed ms, slug, found, productId, and warns when slug is not found.

**Enable:** Set env `NEXT_PHASE8_DIAGNOSTIC=1` (e.g. in `.env.local`) and run the app. Logs appear in the server console.

**Remove:** Once stability is confirmed, delete the `DIAGNOSTIC_LOG` blocks and the `NEXT_PHASE8_DIAGNOSTIC` check from `lib/data/products.ts`.

---

## Checklist Before Merge

- [ ] No new `fetch()`/SWR/React Query for products in client components.
- [ ] Product detail page has `dynamic = "force-dynamic"` and `revalidate = 0`.
- [ ] Product data is read only from `lib/data/products.ts` on the server.
- [ ] Product card uses image-wrap + info vertical stack; no absolute outside image-wrap.
- [ ] No new z-index stacking to fix layout overlap.
