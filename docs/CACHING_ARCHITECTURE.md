# Caching Architecture (Hardened)

Single source of truth for cache TTLs and revalidation so product/catalog list, detail, and API stay in sync.

## Constants (`lib/utils/cache-constants.ts`)

| Constant | Value | Use |
|----------|--------|-----|
| `CACHE_REVALIDATE_PRODUCTS` | 10s | ISR `revalidate` for product/collection/homepage and `/api/products` |
| `CACHE_SMAXAGE_PRODUCTS` | 10s | CDN `s-maxage` for `/`, `/collections/*`, `/products/*`, `/api/products` |
| `CACHE_SWR_PRODUCTS` | 59s | `stale-while-revalidate` for product/catalog |
| `CACHE_REVALIDATE_LOOKS` | 60s | ISR for complete looks API |
| `CACHE_SWR_LOOKS` | 300s | SWR for complete looks |
| `CACHE_DEFAULT_SMAXAGE` | 10s | Default API cache when no explicit option |
| `CACHE_NO_STORE` | `private, no-store, ...` | Error/404 responses — never cache at CDN |

**Rule:** When changing product/catalog visibility or TTL, update `cache-constants.ts` and keep `next.config.js` headers in sync (comment in next.config references this file).

## Where constants are used

- **Pages:** `app/page.tsx`, `app/products/[slug]/page.tsx`, `app/collections/[slug]/page.tsx` — `revalidate = CACHE_REVALIDATE_PRODUCTS` and `unstable_cache(..., { revalidate: CACHE_REVALIDATE_PRODUCTS })`
- **API:** `app/api/products/route.ts` — `revalidate = CACHE_REVALIDATE_PRODUCTS`, `apiSuccess(..., { cache: 'product' })`; `app/api/complete-looks/route.ts` — `CACHE_REVALIDATE_LOOKS`, `cache: 'looks'`
- **API responses:** `lib/utils/api-response.ts` — `cache: 'product'` / `'looks'` use `productCacheControl()` / `looksCacheControl()`; errors use `CACHE_NO_STORE`
- **Revalidation:** `lib/utils/cache-revalidation.ts` — all `revalidatePath(..., "page")` or `"layout"` explicit

## CDN / next.config.js

- `/`, `/collections/:path*`, `/products/:path*`: `Cache-Control` + `CDN-Cache-Control` + `Vercel-CDN-Cache-Control` = `public, max-age=0, s-maxage=10, stale-while-revalidate=59`
- `/api/products`, `/api/products/:path*`: same value so API and pages align
- Values must match `cache-constants.ts` (see comment in next.config)

## Error responses

- `apiError` (and thus `apiNotFound`, `apiValidationError`, etc.) set `Cache-Control: private, no-store, no-cache, must-revalidate` so 4xx/5xx are not cached at CDN or browser.

## Revalidation on mutations

- **Product create/update/delete:** `revalidateProduct(slug)`, list tags, collection paths, `revalidatePath(..., "page")` (see SEV-1 doc).
- **Category/collection:** `revalidatePath(\`/collections/${slug}\`, "page")`, tags.
- **Complete looks:** `revalidateTag(CACHE_TAGS.completeLooks)`, `revalidatePath('/api/complete-looks')`, etc.

All path revalidations use explicit `"page"` or `"layout"` for Full Route Cache and CDN purge.
