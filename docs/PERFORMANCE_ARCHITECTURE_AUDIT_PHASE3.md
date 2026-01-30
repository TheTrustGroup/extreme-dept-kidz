# Phase 3 — Performance & Architecture Audit

**Audit Date:** January 2025  
**Scope:** Rendering strategy, caching, data-fetching, API design, N+1, payload bloat, overfetching, redundant calls, state management, hydration, edge caching

---

## Executive Summary

The app uses **ISR + tag-based revalidation** consistently for product/catalog pages and APIs, with a single source of truth in `cache-constants.ts`. **Rendering is mostly server-first** (RSC + streaming), with client components for interactivity. **Main issues:** (1) **getProductsByCategory** and **getProductById/getProductBySlug** use `include` (full relations) while **getAllProducts** uses `select` — inconsistent and overfetching in list paths; (2) **Admin orders stats** use **6 parallel API calls** instead of one aggregated stats endpoint; (3) **Product detail page** fetches **getCachedProduct(slug) + getAllProducts()** (two data sources) and does not cache getAllProducts for recommendations; (4) **API /api/products** fetches full catalog then filters/sorts/paginates in-memory — payload and CPU scale with catalog size; (5) **revalidateOnProductMutation** calls **revalidateAllCollectionPages()** which does a **prisma.category.findMany** on every product mutation — extra DB round-trip; (6) **SWR** uses `cache: "no-store"` so client refetches bypass CDN and hit origin every 10s/focus/reconnect; (7) **lib/db/cache.ts** (Redis/memory) is **not used** by the main DB layer — dead or future-only code. **Hydration** is handled (theme script, serialized dates in collection/product props); **state** is clear (Zustand for cart/auth, server state from RSC). **Edge:** Vercel single region (iad1); middleware runs on Edge; API routes are serverless in that region.

---

## 1. Rendering Strategy (SSR / ISR / SSG / CSR)

| Route / Page | Strategy | Notes |
|--------------|----------|--------|
| **Home** | ISR (revalidate 10s) | Server component; Hero + TrustBar in main bundle; sections dynamic with SSR. Products from unstable_cache(getAllProducts). |
| **Collection /collections/[slug]** | ISR (revalidate 10s) | Server component; unstable_cache(getProductsByCategory, getAllCategories); Promise.all for categories + products. Fallback to getAllProducts when category has 0 products. |
| **Product /products/[slug]** | ISR (revalidate 10s) | Server component; getCachedProduct(slug) + getAllProducts() (no cache wrapper for getAllProducts on this page). generateStaticParams pre-generates first 50 slugs. |
| **Cart, Checkout** | CSR | Client components; no server data for cart (Zustand). |
| **Admin** | CSR + API | Client-side data via fetch to /api/admin/*; force-dynamic on orders API. |
| **API /api/products** | ISR (revalidate 10s) | unstable_cache(getAllProducts or getProductsByCategory); then in-memory filter/sort/paginate. |
| **API /api/admin/orders** | Dynamic | force-dynamic; no caching. |

**Findings:**
- **Consistent ISR** for storefront product/catalog (10s revalidate, tags + paths) — good.
- **Product page** fetches product + all products (for recommendations) — two independent fetches; getAllProducts is not wrapped in unstable_cache on this page, so each product page view (on cache miss) can trigger two DB calls. Caching getAllProducts with tags [CACHE_TAGS.products] on the product page would share with homepage and reduce duplicate work.
- **generateStaticParams** for products only pre-generates 50; the rest are on-demand. Acceptable; consider increasing if most traffic is to a small set of products.

---

## 2. Caching Strategy

| Layer | Mechanism | TTL / Behavior |
|-------|-----------|----------------|
| **Constants** | lib/utils/cache-constants.ts | CACHE_REVALIDATE_PRODUCTS = 10, s-maxage 10, SWR 59. Single source of truth. |
| **Pages** | revalidate = 10 (home, collection, product) | ISR; Full Route Cache. |
| **API /api/products** | unstable_cache + Cache-Control header | Tags + revalidate 10; apiSuccess(..., { cache: 'product' }) sets s-maxage 10, SWR 59. |
| **API /api/complete-looks** | unstable_cache + looksCacheControl() | revalidate 60, s-maxage 60, SWR 300. |
| **Revalidation** | revalidatePath + revalidateTag | After product/category mutations; revalidateOnProductMutation() and revalidateAllCollectionPages(). |
| **Next.config headers** | Cache-Control per path | /, /collections/*, /products/*, /api/products, /_next/static, /uploads, etc. Aligned with cache-constants. |
| **vercel.json** | Cache-Control for /, /collections/(.*), /products/(.*) | s-maxage 10 (products/collections), 60 (product detail). |
| **Client SWR** | useSWR('/api/products', fetcher, { refreshInterval: 10000 }) | Fetcher uses cache: "no-store" — every refetch bypasses CDN and hits origin. |
| **lib/db/cache.ts** | Redis + in-memory fallback (cachedQuery, batchQueries) | Not used by lib/db/index.ts or API routes. Dead code for current data layer. |

**Findings:**
- **Tag and path revalidation** are aligned; product mutations call revalidateOnProductMutation and revalidateAllCollectionPages — good.
- **SWR cache: "no-store"** makes client refetches ignore CDN; origin gets hit every 10s and on focus/reconnect. If freshness is required, consider shorter CDN TTL or on-demand revalidation instead of disabling cache on every client request.
- **Double caching sources:** Next.js unstable_cache + Cache-Control headers + vercel.json. Generally consistent; ensure no conflicting values (currently aligned).
- **lib/db/cache.ts** is unused by main DB/API — remove or adopt for a specific use case to avoid confusion.

---

## 3. Data-Fetching Flow

| Flow | Steps | Issues |
|------|--------|--------|
| **Home** | Page runs getAllProducts via unstable_cache → products to initial props; HomeProductSectionsWithSWR receives initialProducts and useSWR('/api/products') with fallbackData. | Server and client both have product list; SWR refetches with cache: "no-store". Redundant origin hits. |
| **Collection** | getCachedCategories() + getCachedProducts() (Promise.all); fallback when products.length === 0: getAllProducts() + getProductsByCollection/sort. | When fallback runs, third fetch (getAllProducts). Categories and products are cached. |
| **Product** | getCachedProduct(slug) (unstable_cache) then getAllProducts() (no cache on this page). | Two fetches; getAllProducts not shared with homepage cache on this route. |
| **API GET /api/products** | unstable_cache(getAllProducts or getProductsByCategory) → then in-memory filter (inStock, search), sort, slice(offset, offset+limit). | Full list fetched from DB/cache then filtered — payload and CPU scale with catalog size. No DB-level limit when category is absent. |
| **Admin orders list** | Parent fetches /api/admin/orders once; ComprehensiveOrderTable mounts and runs 6 parallel fetches for stats (limit=1 per status). | 6 round-trips for counts; could be one /api/admin/orders/stats with groupBy or count per status. |

**Findings:**
- **Product page:** Use unstable_cache for getAllProducts with tags [CACHE_TAGS.products] so it shares with home and reduces duplicate DB/cache load.
- **API /api/products:** When no category, consider DB-level limit (e.g. default limit 100 or 500) or cursor pagination so the server never loads the full catalog into memory.
- **Collection fallback:** getAllProducts() on empty category is correct but adds a full catalog fetch; consider caching getAllProducts for fallback with same tags.

---

## 4. API Response Times & N+1

| API / Query | N+1 Risk | Notes |
|-------------|----------|--------|
| **getAllProducts** | No | Single findMany with select (category, images, variants, tags). Prisma generates one query with joins. |
| **getProductsByCategory** | No | findFirst(category) then findMany(products) with include. Two queries, not N+1. |
| **getProductBySlug / getProductById** | No | findUnique/findFirst with include. Single query. |
| **revalidateAllCollectionPages** | No | findMany(categories) once; then revalidatePath/revalidateTag in memory. One extra DB round-trip per product mutation. |
| **Admin orders GET** | No | count(where) + findMany(where, include user, items, product, images). Two queries (count + list), no per-row queries. |
| **Admin orders stats (ComprehensiveOrderTable)** | Yes (pattern) | 6 separate GET /api/admin/orders with different filters (limit=1) to get totals. Six round-trips; not N+1 in DB but redundant API calls. |

**Recommendation:** Add GET /api/admin/orders/stats (or a single GET with a query param like ?statsOnly=true) that returns { all, pendingPayment, processing, shipped, completed, cancelled } in one Prisma groupBy or multiple count() in one transaction, and have the table call it once.

---

## 5. Payload Bloat & Overfetching

| Source | Issue | Recommendation |
|--------|--------|----------------|
| **getAllProducts** | Uses select (id, name, slug, description, price, ...); minimal. | Keep. |
| **getProductsByCategory** | Uses include (category, images, variants, tags) — fetches all relation columns. | Align with getAllProducts: use select with only needed fields (e.g. category id/name/slug, image url/alt/isPrimary/order, variant size/stock, tag name) to reduce payload and memory. |
| **getProductById / getProductBySlug** | Uses include (full relations). Detail page needs full product; acceptable. | Optional: use select for list-like usage if ever used in a list context. |
| **API /api/products** | Returns paginated products but loads full list from cache/DB first (getAllProducts or getProductsByCategory). When catalog is large, in-memory array is large. | Add DB-level limit when category is not set (e.g. max 500 or 1000), or implement cursor-based pagination at DB level. |
| **Collection page** | Passes serialized products to client (full product objects). Client filters/sorts again (filterProducts, sortProducts). | Server already sends filtered list; client-side filter/sort is for URL state (filters in query). Acceptable; ensure server only sends the collection’s products, not full catalog. |
| **Product page** | Passes product + allProducts (for recommendations). allProducts can be large. | Consider passing only a subset (e.g. same category or top 20 by recency) or a dedicated getRecommendations(productId, limit) that returns minimal fields. |

---

## 6. Redundant API Calls

| Call | Redundancy | Recommendation |
|------|------------|-----------------|
| **SWR /api/products** (HomeProductSectionsWithSWR) | Refetches every 10s and on focus/reconnect with cache: "no-store". Multiple tabs = multiple refetches. | Consider cache: "default" or omit so CDN can serve; or reduce refreshInterval; or use revalidateOnFocus: false if stale-while-revalidate is acceptable. |
| **Admin orders stats** | 6 parallel GETs for counts. | Single GET /api/admin/orders/stats (or ?statsOnly=true) returning all counts. |
| **generateMetadata + page (product)** | Both call getCachedProduct(slug). Next dedupes unstable_cache in same request. | No change. |
| **ProductForm after mutation** | Fetches "/api/products?revalidate=true". Query param revalidate not used by API route. | Remove param or implement revalidateTag in API when param present; or rely on existing mutation-driven revalidation. |

---

## 7. State Management

| State | Location | Notes |
|-------|----------|--------|
| **Cart** | Zustand (cart-store); client-only. | No server cart; no hydration mismatch. |
| **Auth (customer)** | Context/state in Header (SignInModal, AccountDropdown). | Client-only. |
| **Admin auth** | Zustand (admin-auth-store); cookie-backed. | checkAuth() on layout; no duplication with server. |
| **Products (home)** | Server: initialProducts from RSC. Client: useSWR with fallbackData. | Single source of truth on server; SWR keeps client fresh. No duplication. |
| **Products (collection)** | Server: products from RSC → CollectionPageClient. Client state for filters/sort (URL + local state). | Server list is source; client filters in-memory. OK. |
| **Product detail** | Server: product + allProducts → ProductPageClient. Client: purchase state (useProductPurchase). | Server data is source; no cart sync with server. |

**Findings:**
- Clear split: server state from RSC, client state from Zustand/context. No duplicate server/client product store.
- Cart and wishlist are client-only; if you add “save for later” or logged-in cart, you’ll need a sync strategy.

---

## 8. Hydration Mismatches

| Risk | Mitigation | Status |
|------|-------------|--------|
| **Theme (dark/light)** | Inline script in head runs before paint; data-theme set on html. suppressHydrationWarning on html. | Correct. |
| **Date formatting** | Collection and product pages serialize dates to ISO string (createdAt, updatedAt) before passing to client. | Prevents Date object serialization mismatch. |
| **Product.createdAt** | ProductCard uses new Date(product.createdAt) for “new” badge; value comes from server. | Same value server/client if passed as string; OK. |
| **Order dates** | Admin uses format(new Date(order.createdAt), ...). Server sends ISO string; client parses. | OK if server and client both use same ISO string. |
| **Locale / timezone** | date-fns format() uses local timezone. Server and client can differ if server is UTC and client is local. | Low risk for “date only”; for “time ago” or exact time, consider passing ISO and formatting only on client. |

**Findings:**
- Serialization of products (collection/product pages) and theme script reduce hydration risk. No obvious mismatches identified; continue to avoid passing non-serializable values (Date, undefined in critical paths) from server to client.

---

## 9. Edge Caching Behavior

| Aspect | Current | Notes |
|--------|---------|--------|
| **Vercel region** | vercel.json regions: ["iad1"]. | Single region; no multi-region or edge for API. |
| **Middleware** | Runs on Edge (Next.js default); CORS, static asset Cache-Control, Vary. | Edge for middleware only. |
| **API routes** | Serverless in iad1; not Edge Runtime. | Cold starts and latency for non-cached requests. |
| **CDN** | Cache-Control on API and pages (s-maxage 10/60, SWR). | Vercel CDN caches at edge; TTLs from cache-constants and headers. |
| **Static assets** | middleware sets immutable, max-age 31536000 for _next/static, uploads, images. | Good. |
| **Product/collection pages** | Full Route Cache with revalidate 10. | First request after revalidate can hit origin; then CDN serves. |

**Findings:**
- Edge caching is via CDN (Cache-Control), not Edge Runtime for API. Acceptable for current scale. If you need lower latency for API globally, consider Edge Runtime for read-only GET /api/products (experimental).
- vercel.json and next.config headers both set Cache-Control; keep them aligned (currently are).

---

## 10. Architecture Flaws (Prioritized)

1. **getProductsByCategory and getProductById/getProductBySlug use include**  
   Fetches full relations; getAllProducts uses select. Inconsistent and heavier than needed for list use. Use select in getProductsByCategory (and getProductById if ever used in lists) with only needed fields.

2. **Admin orders stats: 6 API calls**  
   ComprehensiveOrderTable does 6 parallel GETs for counts. Replace with one aggregated stats endpoint (e.g. /api/admin/orders/stats or ?statsOnly=true) using Prisma groupBy or multiple count() in one transaction.

3. **Product page: getAllProducts() not cached**  
   Product page calls getCachedProduct(slug) and getAllProducts(). getAllProducts is not wrapped in unstable_cache on this page, so cache misses cause two DB hits. Wrap getAllProducts in unstable_cache with tags [CACHE_TAGS.products] on the product page so it shares with home and collection.

4. **API /api/products loads full catalog then paginates**  
   When category is not set, getAllProducts() returns full list; then in-memory filter/sort/slice. For large catalogs this is heavy. Add a DB-level limit (e.g. default 500) or cursor pagination for the “all” case.

5. **revalidateOnProductMutation → revalidateAllCollectionPages()**  
   Every product create/update/delete runs prisma.category.findMany() to revalidate all collection paths. One extra query per mutation. Consider caching category list (short TTL) or revalidating only affected category paths when categorySlug is known.

6. **SWR fetcher uses cache: "no-store"**  
   Client refetches bypass CDN; origin is hit every 10s and on focus/reconnect. If you want to reduce load, use cache: "default" or a longer CDN TTL and rely on tag revalidation for mutations.

7. **lib/db/cache.ts unused**  
   cachedQuery/batchQueries and Redis/memory layer are not used by lib/db or API routes. Remove or document and use for a specific path (e.g. admin reports) to avoid dead code.

8. **ProductForm fetches "/api/products?revalidate=true"**  
   revalidate=true is not handled by the API. Either implement revalidation when that param is present or remove the param and rely on existing revalidatePath/revalidateTag after mutations.

---

## 11. Performance Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Catalog size growth** | getAllProducts() and in-memory filter/sort in /api/products get heavier. | DB-level limit or cursor pagination; keep getProductsByCategory category-scoped. |
| **Product mutation rate** | revalidateAllCollectionPages() + many revalidatePath/revalidateTag calls per mutation. | Already non-blocking (revalidation doesn’t fail the request). Optionally reduce path revalidations to only affected slugs. |
| **Multiple tabs (home)** | Each tab’s SWR refetches /api/products with no-store. | Consider cache: "default" or longer CDN TTL; or reduce refreshInterval. |
| **Admin orders page** | 1 list fetch + 6 stats fetches on load. | Single stats endpoint. |
| **Product recommendations** | Full allProducts passed to ProductPageClient. | Limit to N products or minimal fields; or dedicated getRecommendations() with select. |

---

## 12. Scaling Bottlenecks

| Bottleneck | When It Bites | Direction |
|------------|----------------|-----------|
| **Single region (iad1)** | Users far from iad1 see higher latency. | Multi-region or Edge for read-heavy API if needed. |
| **Full catalog in memory** | /api/products with no category and 10k+ products. | Paginate or limit at DB. |
| **Revalidation breadth** | Many categories → many revalidatePath calls per product mutation. | Already async; optionally revalidate only affected collection(s). |
| **No DB connection pooling** | Serverless uses one connection per invocation unless pooled. | Prisma + serverless: use connection pooling (e.g. PgBouncer or Prisma Accelerate) if connection count grows. |
| **Zustand cart in memory only** | Large cart or many items; no persistence. | Persist to localStorage or API when needed. |

---

## 13. Optimization Roadmap

### Short term (1–2 sprints)

1. **Align getProductsByCategory with getAllProducts**  
   Use select in getProductsByCategory (only needed category, images, variants, tags fields) to reduce payload and memory.

2. **Add /api/admin/orders/stats**  
   Single endpoint returning { all, pendingPayment, processing, shipped, completed, cancelled }; use Prisma groupBy or count per status. Update ComprehensiveOrderTable to one fetch.

3. **Cache getAllProducts on product page**  
   Wrap getAllProducts in unstable_cache with tags [CACHE_TAGS.products] and revalidate 10 on the product page so recommendations share cache with home/collection.

4. **Limit /api/products when no category**  
   When category is not set, call a version of getAllProducts that accepts limit (e.g. 500) or use cursor-based pagination at DB level; avoid loading full catalog into memory.

5. **Remove or use lib/db/cache.ts**  
   Either remove cachedQuery/batchQueries/Redis from the main data path or adopt for a specific feature (e.g. admin dashboard stats) and document.

### Medium term

6. **Product recommendations payload**  
   Replace full allProducts with getRecommendations(productId, limit) returning minimal fields (id, name, slug, price, primary image) or same category only.

7. **SWR and CDN**  
   Revisit cache: "no-store" for /api/products; consider cache: "default" or shorter refreshInterval to reduce origin load while keeping freshness acceptable.

8. **ProductForm revalidate param**  
   Remove ?revalidate=true from the fetch or implement revalidateTag in GET /api/products when that param is present.

9. **Revalidate only affected collections**  
   In revalidateOnProductMutation, when categorySlug is known, revalidate only that collection path and skip revalidateAllCollectionPages() or run it less frequently (e.g. on schedule).

### Long term

10. **Cursor-based pagination for /api/products**  
    For “all” products, support cursor + limit and return nextCursor; use Prisma skip/take or cursor-based API.

11. **Edge or multi-region for GET /api/products**  
    If global latency matters, consider Edge Runtime for read-only product API or multi-region deployment.

12. **Connection pooling**  
    If DB connection count grows (many serverless invocations), add pooling (PgBouncer, Prisma Accelerate, or serverless pooler).

---

## 14. Summary Table

| Area | Status | Main issue |
|------|--------|------------|
| **Rendering** | Good | Product page double fetch (product + allProducts); getAllProducts not cached on that page. |
| **Caching** | Good | Aligned constants and revalidation; SWR no-store bypasses CDN; lib/db/cache unused. |
| **Data fetching** | Mixed | getProductsByCategory overfetches; API /api/products full-catalog then in-memory paginate. |
| **API design** | Mixed | N+1 avoided in DB; admin orders use 6 calls for stats. |
| **Payload** | Mixed | getAllProducts select is lean; getProductsByCategory include is heavy; product page sends full allProducts. |
| **Redundant calls** | Issues | 6 order stats calls; SWR no-store; ProductForm revalidate param unused. |
| **State** | Good | Clear server vs client; no duplicate product store. |
| **Hydration** | Good | Theme script; serialized dates; no mismatches identified. |
| **Edge** | OK | CDN via Cache-Control; single region; middleware on Edge. |

---

**Next steps:** Implement short-term items (select in getProductsByCategory, orders stats endpoint, cache getAllProducts on product page, limit in /api/products, lib/db/cache decision), then measure API latency and cache hit rates before/after.
