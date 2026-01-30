# Data Freshness: Design Around Three Truths

**Three truths:**

1. **Products mutate frequently** — Admin creates, updates, and deletes products often.
2. **Pages must remain fast** — Storefront and API must stay fast (CDN, ISR, caching).
3. **Users must NEVER see stale or false data** — No vanished products, no false "no longer available", no stale lists after a mutation.

---

## Surgical Rules

### Truth 1: Products mutate frequently

**Rule:** Every product mutation (create, update, delete, bulk delete) MUST trigger full catalog revalidation **before** the API returns success.

- **Single place:** All mutations call `revalidateOnProductMutation()` (or the same set of revalidation steps).
- **Order:** DB write → revalidate (tags + paths) → then return 200/201. Never return success then revalidate async.
- **Scope:** Product detail path, product list tags, homepage, collection pages, category pages, complete-looks, API route cache.

**Effect:** As soon as a product is saved, the next read anywhere (storefront, API) sees fresh data or triggers a fresh fetch.

---

### Truth 2: Pages must remain fast

**Rule:** Reads are cached with short TTL and tag-based invalidation; mutations invalidate by tag/path so we don’t over-fetch.

- **ISR:** Product/catalog pages and API use `revalidate: 10` (see `cache-constants.ts`). Same value for list and detail so they stay in sync.
- **CDN:** `s-maxage=10`, `stale-while-revalidate=59` for `/`, `/collections/*`, `/products/*`, `/api/products`. Bounded staleness.
- **Tags:** Every cached product/list uses tags (`products`, `product-{slug}`, `category-{slug}`, `homepage`). Mutations call `revalidateTag()` so cache entries are invalidated immediately; next request recomputes.
- **Paths:** Mutations call `revalidatePath(..., "page")` for the affected product and list pages so Full Route Cache and CDN purge.

**Effect:** Normal reads are fast (cache hit). After a mutation, the next read is a cache miss and gets fresh data without sacrificing normal performance.

---

### Truth 3: Users must NEVER see stale or false data

**Rule:** Cache can be wrong only in narrow, mitigated cases. We never knowingly serve wrong data.

| Risk | Mitigation |
|------|------------|
| **Cached null for existing product** | Product detail: when cache returns `null`, read from DB once. If product exists, render it; only then 404 if still missing. (Stale-null bypass.) |
| **Empty list when products exist** | Homepage/collection: when cache returns `[]` in production at runtime, fetch from DB once. Use result if non-empty. (Empty-list bypass.) |
| **List fresh but detail stale** | Same TTL (10s) and same tags for list and detail; mutations revalidate both. Detail path revalidated on create/update/delete. |
| **404 cached for new product** | On create, revalidate `/products/{slug}` so any cached 404 for that path is purged. |
| **Error/404 cached at CDN** | All API error responses use `Cache-Control: private, no-store`. |
| **Propagation delay** | Stale-null bypass and empty-list bypass ensure that even if a node hasn’t received invalidation yet, we correct once from DB. |

**Read path contract:**

- **Product detail:** `getCachedProduct(slug)` → if cache returns null, call `getProductBySlug(slug)` once; 404 only if DB says no product.
- **Homepage / collection:** If cached list is empty in production (runtime, not build), call `getAllProducts()` or `getProductsByCategory()` once; use non-empty result.
- **API:** Uses same tags and revalidate as pages; mutations revalidate `/api/products` (layout) so next API call gets fresh data.

**Effect:** Users do not see vanished products, false "no longer available", or stale lists after an admin change. Bypasses fix the rare case where invalidation hasn’t propagated yet.

---

## Mutation Contract

Every product create, update, delete, and bulk delete MUST:

1. Perform the DB write.
2. Call revalidation (tags + paths) for:
   - This product: `product-{slug}`, `product-id-{id}`, path `/products/{slug}`.
   - Catalog: `products`, `homepage`, category/collection tags, paths `/`, `/products`, `/collections`, `/collections/{categorySlug}`.
   - Complete looks: `complete-looks`, `complete-looks-product-{id}`.
   - API: `revalidatePath('/api/products', 'layout')`.
3. Then return success (and optionally trigger webhook / activity log).

Implementation: use `revalidateOnProductMutation()` from `lib/utils/cache-revalidation.ts` so the contract lives in one place.

---

## Summary

| Truth | Design |
|-------|--------|
| **Products mutate frequently** | Every mutation triggers full revalidation before response; single function for all product mutations. |
| **Pages must remain fast** | Short ISR (10s), CDN (s-maxage 10, SWR 59), tag + path invalidation so only affected entries are purged. |
| **Users must NEVER see stale or false data** | Stale-null bypass (detail), empty-list bypass (home/collection), same TTL for list/detail, no-store for errors, path revalidation on create so 404 isn’t cached. |
