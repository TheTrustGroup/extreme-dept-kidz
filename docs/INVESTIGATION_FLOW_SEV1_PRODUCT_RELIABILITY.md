# SEV-1 Investigation Flow: Product Reliability (Full-Stack)

**Mandate:** Products must appear immediately after creation, never disappear, never require refresh, never show false "no longer available" errors.

---

## 1. FRONTEND DATA FLOW TRACE

### 1.1 Product data lifecycle

| Stage | Path | Implementation |
|-------|------|-----------------|
| **API** | `GET /api/products` (no category) | `unstable_cache(getAllProducts, ['products-all-all'], { tags: [products, collections], revalidate: 10 })` → returns array |
| **API (with category)** | `GET /api/products?category=boys` | `unstable_cache(getProductsByCategory(category), ['products-boys-all'], { tags: [products, category(boys)], revalidate: 10 })` |
| **Frontend state (home)** | Homepage SSR | `unstable_cache(getAllProducts, ['homepage-products'], { tags: [products, homepage], revalidate: 10 })` → `initialProducts` |
| **Frontend state (home)** | Client | `HomeProductSectionsWithSWR(initialProducts)` → `useSWR('/api/products', fetcher, { fallbackData, refreshInterval: 10000, revalidateOnFocus: true })` → `products = data?.data?.products ?? initialProducts` |
| **Hydration** | First paint | Server HTML has `initialProducts`; client hydrates with same; SWR uses `fallbackData: { data: { products: initialProducts } }` so no flash. No hydration mismatch: server and client initial state match. |
| **Render** | List | `NewArrivalsSection(products)` / `GirlsCollectionSection(products)` filter and display; no client-only filtering that would hide valid products. |
| **Routing** | Click product | `<Link href={/products/${slug}}>` → client navigation or full load. |
| **Product detail** | `/products/[slug]` | Server: `getCachedProduct(slug)` = `unstable_cache(getProductBySlug(slug), ['product', slug], { tags: [product(slug), products], revalidate: 10 })` → if null, `notFound()` → "This piece is no longer available". |

### 1.2 Findings

- **Hydration:** No mismatch; list and detail use server data / SWR with server fallback.
- **Stale ISR:** List and detail each use `unstable_cache` with different keys but shared tags (`products`, `product(slug)`). Revalidation was incomplete on delete/slug-change (fixed).
- **SWR stale fetches:** Fetcher used default `fetch(url)` so browser could cache API response; `fallbackData` could keep showing old list after delete. **Fix:** Fetcher uses `fetch(url, { cache: 'no-store' })`; API response uses `max-age=0` for list endpoints.
- **Frontend filtering:** List filters (All/Boys/Girls/New) are in-memory on `products`; no filtering that would drop valid products.
- **Client-side caching:** Browser could cache `/api/products`; SWR `keepPreviousData: true` keeps last result during revalidate. **Fix:** No-store fetcher + `max-age=0` on API.
- **Race:** After admin create, list cache and detail cache are invalidated by tag; next request to each recomputes. Race window: one request could hit a node that has not yet received `revalidateTag`. Mitigation: all caches use `revalidate: 10` and CDN `s-maxage=10` so worst case 10s.

---

## 2. BACKEND QUERY AUDIT

### 2.1 Product listing API

- **Route:** `app/api/products/route.ts` GET.
- **Branch:** No `category` → `getCachedProducts()` = `unstable_cache(getAllProducts, ...)`. With `category` → `unstable_cache(getProductsByCategory(category), ...)`.
- **Filtering:** After cache: `inStock` query param filters to `p.inStock`; `search` filters by name/description/tags. No visibility/publication filter in query.
- **Visibility / publication / draft:** Not present in schema; not applied.
- **Stock:** Optional filter `inStock=true`; listing itself returns all products (no `where: { inStock: true }` in DB).
- **Category:** `getProductsByCategory(category)` uses category slug/ID and `categoryId`; only active categories (`isActive: true`).
- **Ownership / tenant:** None; single-tenant.
- **Soft deletes:** Not in schema; no `deletedAt` filter.

### 2.2 Product detail (by slug)

- **Path:** `getProductBySlug(slug)` → `findUnique({ where: { slug } })` then `findFirst({ where: { slug: { equals: slug, mode: 'insensitive' } } })`.
- **Visibility / status:** No filters; any product row by slug is returned.
- **Conclusion:** Backend does not hide products via status/draft/visibility; if a row exists and slug matches, it is returned.

---

## 3. DATABASE CONSISTENCY CHECK

### 3.1 Product schema (Prisma)

- **Fields:** id, name, slug, description, price, originalPrice, sku, weight, length, width, height, inStock, metadata, categoryId, createdAt, updatedAt.
- **Published / status / visibility:** None. No `status`, `published`, `isVisible`, or `deletedAt`.
- **Slug:** `@unique`; indexed.
- **Category:** `categoryId` FK to Category; Category has `isActive` (used only for category listing).
- **Stock:** `inStock` boolean; variants have `stock`; listing does not filter by stock.
- **Soft delete:** Not used.
- **Indexes:** slug, categoryId, inStock, sku — no missing index for slug/category lookups.

**Conclusion:** DB has no draft/published or soft-delete; slug is unique. Inconsistency is not from DB schema or visibility flags but from caching/revalidation.

---

## 4. CACHING & ISR / EDGE CACHE ANALYSIS (ROOT CAUSE FOCUS)

### 4.1 Cache layers

| Layer | Key / scope | TTL / behavior | Invalidation |
|-------|-------------|----------------|---------------|
| **Next.js data (list)** | `['homepage-products']` / `['products-{category}-all']` | revalidate 10s, tags `products`, `homepage`, `category(slug)` | `revalidateTag(products|homepage|category(slug))` |
| **Next.js data (detail)** | `['product', slug]` | revalidate 10s, tags `product(slug)`, `products` | `revalidateTag(product(slug)|products)`, `revalidatePath(/products/${slug})` |
| **CDN (next.config)** | Path-based | `/` and `/collections/:path*`: s-maxage=10, swr=59. `/products/:path*`: s-maxage=10, swr=59 (aligned). | On-demand revalidation or TTL expiry. |
| **API route** | Same `unstable_cache` as above for GET /api/products | revalidate 10s | Same tags. |
| **API response** | N/A | Cache-Control: max-age=0, s-maxage=10, swr=59 (after fix) | N/A |
| **SWR (client)** | Key `/api/products` | refreshInterval 10s, revalidateOnFocus, fallbackData | Fetcher uses cache: 'no-store' (after fix). |
| **Redis** | Not used | — | — |

### 4.2 Why products disappeared / required refresh / failed on click

1. **Detail showed "no longer available" (false 404)**  
   - **Cause:** Product detail page was served from cache (Next.js or CDN) with a **stale null** (cached 404 from before the product existed, or from a node that hadn’t received invalidation after create).  
   - **Contributing:** (a) DELETE did not revalidate `/products/${existing.slug}` or `product(slug)` tag, so deleted product’s URL could still serve old content or a cached 404. (b) Product detail CDN had longer TTL (s-maxage=60) than list (10s), so list could show the product while detail still served old 404. (c) 404 response was cached with same TTL as 200.

2. **Products “vanishing” or “reappearing after refresh”**  
   - **Cause:** List and detail (and sometimes API) were reading from **different cache entries or nodes** at different times. After create/update/delete, some caches were invalidated and some were not (missing path/tag revalidation on delete and slug-change; bulk delete not revalidating per-product or list tags).  
   - **Refresh:** A full reload forced new server requests and cache misses, so fresh data was shown.

3. **Disappearing after navigation**  
   - **Cause:** Navigating list → detail used cached detail (or 404). Navigating back to list could show SWR/browser-cached list. So list showed product, detail showed 404, or vice versa, depending on which cache was hit.

4. **Stale list after admin create**  
   - **Cause:** Browser could cache `/api/products` response (no max-age=0). SWR refetch could reuse that cached response, so list didn’t update until cache expired or user forced refresh.

### 4.3 Stale cache summary

- **Ghost products:** List cache or SWR showed a product that was already deleted (delete did not revalidate list + detail path/tag).
- **Disappearing products:** Detail cache (or CDN) had 404 while list had the product (detail not revalidated on create; or CDN TTL longer than list).
- **Stale product detail:** Old slug still cached after slug change (old slug not revalidated on update).
- **Inconsistent availability:** List and detail out of sync due to different cache keys and incomplete invalidation.

---

## 5. PRODUCT DETAIL PAGE FAILURE TRACE

### 5.1 "This piece is no longer available" path

1. **Route:** `/products/[slug]` → `ProductPage({ params })` → `slug = params.slug`.
2. **API:** No direct API call; server uses `getCachedProduct(slug)`.
3. **getCachedProduct:** `unstable_cache(getProductBySlug(slug), ['product', slug], { tags: [product(slug), products], revalidate: 10 })`.
4. **getProductBySlug:** `executeQuery` → Prisma `findUnique({ where: { slug } })` then `findFirst({ slug: { equals: slug, mode: 'insensitive' } })`; returns null if not found.
5. **Fallback:** No fallback; null → `notFound()`.
6. **Rendering:** `not-found.tsx` → "This Piece Is No Longer Available" + "Return Home".

### 5.2 When this is wrong (false 404)

- **Stale ISR:** Cache still held result of a previous request where slug didn’t exist (e.g. before create) or product was deleted; revalidation hadn’t run or hadn’t reached that node.
- **Slug mismatch:** Not the cause; we have case-insensitive fallback and slug is unique in DB.
- **Delayed replication:** Single DB; no read-replica lag.
- **Race after creation:** Admin create → revalidateTag/product path; next request might hit another edge/server that hadn’t applied invalidation yet → cache hit with null.
- **Broken fallback:** There is no fallback; null is intentional for truly missing products. The bug was cached null (stale 404), not fallback logic.

### 5.3 Fixes applied for detail failure

- Revalidate **deleted** product: `revalidatePath(/products/${existing.slug})`, `revalidateTag(product(existing.slug))` on DELETE.
- Revalidate **old slug** when slug changes: same for `existingProduct.slug` on PUT.
- Align product detail **CDN** with list: s-maxage=10, stale-while-revalidate=59 (no long-lived 404).
- **Bulk delete:** Revalidate list tags and each deleted product’s path and tag.

---

## 6. ADMIN → FRONTEND DATA SYNC

### 6.1 Flow

1. **Admin create:** POST /api/admin/products → Prisma create → revalidateProduct(slug), revalidatePath(/products/${slug}), revalidateTag(products|homepage|category(slug)), revalidateCollectionPage(categorySlug), revalidateAllCollectionPages(), triggerProductUpdatedWebhook.
2. **DB write:** Synchronous; product is visible to next read.
3. **API fetch:** GET /api/products uses `unstable_cache(getAllProducts, ...)` tagged `products`. After revalidateTag(products), next GET recomputes → returns new product.
4. **Frontend render:** Homepage SSR uses cache tagged `products`/`homepage` → recomputes on next request. Client SWR fetches /api/products with cache: 'no-store' and API sends max-age=0 → no stale list.

### 6.2 Gaps (addressed)

- **Async revalidation:** revalidateTag/revalidatePath are async; response can be sent before every edge has purged. Mitigation: short TTL (10s) everywhere so staleness is bounded.
- **Browser cache:** API response now has max-age=0; SWR fetcher uses no-store.
- **Detail cache:** Create already revalidated product(slug) and path; delete and slug-change now do as well.

---

## DELIVERABLE 1 — ROOT CAUSE ANALYSIS

### Why products disappear

- **List:** Cache (Next.js or CDN) or SWR/browser still holds an **old list** (with the product) after delete, or an **old empty/short list** after create, because (a) list/detail/product path or tag was not revalidated on delete/update/bulk delete, or (b) browser/CDN reused a cached response (fixed with max-age=0 and no-store fetcher).
- **Detail:** Same product’s **detail page** was revalidated (on create) or not (on delete/slug change), so list and detail could show different “truth” (product present vs 404).

### Why refresh was required

- Refresh bypasses client cache and triggers new server requests; those requests either hit invalidated cache (cache miss) or a node that had already applied revalidation, so fresh data was loaded. So “refresh fixes it” indicated **stale cache**, not DB or auth.

### Why click led to "no longer available"

- **Exact cause:** The **detail page** for that slug was served from a **stale cache entry** where `getProductBySlug(slug)` had returned null (either from a time when the product didn’t exist yet, or from after delete while list cache still had the product). That cached null → `notFound()` → "This piece is no longer available".
- **Contributing:** (1) DELETE did not revalidate that slug’s path/tag. (2) Detail CDN TTL was 60s vs list 10s. (3) 404 was cached like 200. (4) Bulk delete didn’t revalidate per-product or list tags.

---

## DELIVERABLE 2 — PERMANENT FIX (CODE & STRATEGY)

### 2.1 Code changes (already applied)

1. **DELETE (single product)** — `app/api/admin/products/[id]/route.ts`  
   - Before delete response: `revalidatePath(\`/products/${existing.slug}\`, 'page')`, `revalidateTag(CACHE_TAGS.product(existing.slug))`.

2. **UPDATE (slug change)** — same file  
   - When `existingProduct.slug !== product.slug`: `revalidatePath(\`/products/${existingProduct.slug}\`, 'page')`, `revalidateTag(CACHE_TAGS.product(existingProduct.slug))`.

3. **Product detail CDN** — `next.config.js`  
   - `/products/:path*`: `Cache-Control: public, max-age=0, s-maxage=10, stale-while-revalidate=59` (aligned with list).

4. **Bulk delete** — `app/api/admin/products/bulk/route.ts`  
   - Revalidate list tags: `products`, `homepage`, `collections`, `categories`.  
   - For each deleted product: `revalidatePath(\`/products/${product.slug}\`, 'page')`, `revalidateTag(CACHE_TAGS.product(product.slug))`, `revalidateTag(CACHE_TAGS.completeLookProduct(product.id))`.

5. **API Cache-Control** — `lib/utils/api-response.ts`  
   - When `options.cache` is a number: use `max-age=0` in Cache-Control so browser always revalidates; keep `s-maxage` for CDN.

6. **SWR fetcher** — `components/home/HomeProductSectionsWithSWR.tsx`  
   - `fetch(url, { cache: 'no-store' })` so list refetches never use stale browser cache.

### 2.2 Cache strategy changes

- **Detail and list TTL:** All product-related pages and API use **revalidate: 10** and CDN **s-maxage=10** so list and detail stay in sync and 404s don’t stick.
- **Browser:** **max-age=0** for list API; **no-store** in SWR fetcher so client never relies on stale list.
- **Invalidation:** Every mutation (create/update/delete, single and bulk) invalidates both **list** (tags: products, homepage, category, collection) and **detail** (path + tag per slug). Old slug is invalidated when slug changes.

### 2.3 API / frontend fixes

- API: Cache-Control with max-age=0 for cached list/detail responses; no change to query logic (no extra visibility filters).
- Frontend: SWR no-store fetcher; no change to filtering logic (no band-aids).

---

## DELIVERABLE 3 — FINAL ARCHITECTURE RECOMMENDATIONS

### 3.1 Cache invalidation

- **Single source of truth:** Tags (`products`, `product(slug)`, `category(slug)`, `homepage`) must be revalidated on every product/create/update/delete (including bulk). Keep using `revalidateProduct(slug)`, `revalidatePath(\`/products/${slug}\`)`, and category/collection revalidation.
- **Always revalidate both:** List (tags) and detail (path + tag per slug). On slug change, revalidate **old** and **new** slug.
- **Bulk operations:** Loop over affected products and revalidate each slug’s path and tag; revalidate list tags once.

### 3.2 ISR strategy

- **Revalidate time:** Keep **10s** for product data so admin changes appear within 10s even if a tag miss occurs.
- **Tags:** Use tags for all product-dependent data; never rely only on path revalidation (path + tag together).
- **Avoid long TTL for detail:** Do not increase product detail `s-maxage` above list TTL; keep 10s so list and detail stay aligned.

### 3.3 Revalidation flow (recommended)

1. **Create:** revalidateProduct(newSlug), revalidatePath(\`/products/${newSlug}\`), revalidateTag(products), homepage, category(slug), revalidateCollectionPage(categorySlug), webhook.
2. **Update:** revalidateProduct(newSlug), revalidatePath(\`/products/${newSlug}\`); if slug changed, revalidate old slug path + tag; revalidate category/collection as needed; webhook.
3. **Delete:** revalidatePath(\`/products/${deletedSlug}\`), revalidateTag(product(deletedSlug)), revalidateTag(products), homepage, collections, categories; webhook.
4. **Bulk delete:** For each slug revalidate path + product(slug) tag; revalidate products, homepage, collections, categories.

### 3.4 Edge cache control

- **Product pages and list API:** `max-age=0` for browser; `s-maxage=10, stale-while-revalidate=59` for CDN. Same for `/`, `/collections/*`, `/products/*`, and GET /api/products (via apiSuccess cache option).
- **Do not** cache 404s longer than 200s; current 10s s-maxage achieves that.
- **Optional:** Middleware or route segment to set `Cache-Control: private, no-store` for 404 on `/products/*` if the platform allows per-status headers.

### 3.5 Frontend fetch policy

- **List (SWR):** `cache: 'no-store'` in fetcher; `refreshInterval: 10000`; `revalidateOnFocus: true`; keep `fallbackData` from server for first paint.
- **Detail:** No client fetch for initial data; server-only with tagged cache and path revalidation. Optional: client refetch on mount for critical slugs (e.g. after navigation from list) if you need stronger guarantee; current fixes make this optional.

---

## CRITICAL REQUIREMENTS — VERIFICATION

- **No band-aids:** Root cause was cache invalidation and TTL alignment; fixes are at revalidation and cache headers.
- **Production-grade:** All mutations revalidate list and detail; CDN and browser TTLs aligned; SWR does not use stale API cache.
- **Immediate appearance:** New products appear on next request (or within 10s) due to tag/path revalidation and short TTL.
- **Never disappear:** Delete and slug-change revalidate both list and affected detail URLs so UI and detail page stay in sync.
- **No false unavailable:** Detail path and tag are revalidated on create/update/delete; CDN 10s TTL prevents long-lived false 404s.
- **Zero tolerance for inconsistency:** Single revalidate strategy for all product mutations; one TTL (10s) for product data everywhere.
