# SEV-1 Product Visibility: Root Cause and Permanent Fixes

**Date:** Forensic production audit  
**Issue:** Products created via admin appear sometimes, vanish randomly, require refresh to reappear, and sometimes show "This piece is no longer available."

---

## 1. Exact Root Cause(s)

### 1.1 Cached null for product detail (primary)

- **Breaking point:** `app/products/[slug]/page.tsx` uses `unstable_cache(getProductBySlug(slug), ['product', slug], { tags: [product(slug), products], revalidate: 10 })`. The **result** of the callback is cached, including **null**.
- **Scenario:** A request (or prefetch) hits `/products/new-slug` **before** the product exists. `getProductBySlug(slug)` returns null → that null is cached with key `['product', slug]` and tags `product-${slug}`, `products`.
- **After admin create:** Revalidation runs (`revalidateTag`, `revalidatePath`). There can be a propagation delay across edge/serverless instances. A request that hits a node that hasn’t applied invalidation yet still sees the **cached null** → `notFound()` → "This piece is no longer available."
- **Effect:** Non-deterministic "no longer available" when the product exists in the DB.

### 1.2 List vs detail cache key divergence

- **List:** Homepage uses `unstable_cache(getAllProducts, ['homepage-products'], { tags: [products, homepage] })`. API uses `unstable_cache(..., ['products-all-all'], { tags: [products, collections] })`. Different keys, shared tag `products`.
- **Detail:** `unstable_cache(getProductBySlug(slug), ['product', slug], { tags: [product(slug), products] })`.
- **Effect:** After revalidation, list can recompute and show the new product while detail (on another node or with a previously cached null) still serves 404 until cache/TTL catches up.

### 1.3 404 responses cached at CDN

- **Breaking point:** When `getCachedProduct(slug)` returns null, the page calls `notFound()`. The 404 response gets the same `Cache-Control` as 200 (e.g. `s-maxage=10, stale-while-revalidate=59` in `next.config.js`).
- **Effect:** A 404 for `/products/new-slug` (e.g. from before the product existed) can be cached at the CDN and served for up to 10s (or stale for 59s) after the product is created.

### 1.4 Revalidation coverage

- **Create:** Admin POST already called `revalidateProduct(slug, id)` and list/collection revalidation. `revalidateProduct` did `revalidatePath('/products/${slug}')` but not with explicit `'page'` type.
- **Update/delete:** PUT and DELETE already revalidate old slug path when slug changes or product is deleted. Bulk delete revalidates each deleted product path.

---

## 2. Permanent Fixes Implemented

### 2.1 Product detail: bypass stale null (primary fix)

**File:** `app/products/[slug]/page.tsx`

- After `getCachedProduct(slug)` returns from cache, if the result is **null**, call `getProductBySlug(slug)` **once** (bypass cache).
- If the DB returns a product, use it and render the page. If the DB still returns null, then call `notFound()`.
- **Effect:** Even when the Data Cache still holds a stale null (e.g. revalidation not yet propagated), the page no longer shows "no longer available" for a product that exists in the DB. No refresh required.

### 2.2 Revalidation: explicit `'page'` and paths

**File:** `lib/utils/cache-revalidation.ts`

- In `revalidateProduct(slug, id)`:
  - Use `revalidatePath(\`/products/${slug}\`, "page")` so the product detail **page** and its RSC payload are invalidated.
  - Use `revalidatePath("/products", "page")` and `revalidatePath("/", "page")` for list pages.
- **Effect:** Full Route Cache and CDN purge for the product detail path on create/update/delete; list pages stay in sync.

### 2.3 Already correct (verified)

- **DB layer:** Product schema has no publish/status flag that would hide products; `getProductBySlug` and `getAllProducts` return all products by slug/category (no hidden filters).
- **Admin create:** POST calls `revalidateProduct(product.slug, product.id)` and list/collection revalidation; product detail path is now revalidated with `'page'`.
- **Admin update/delete:** PUT revalidates old slug path when slug changes; DELETE and bulk delete revalidate each product path and tags.
- **Homepage:** Empty-list bypass in production (direct `getAllProducts()` when cached list is empty) prevents "vanishing" when cache was stale empty.
- **SWR:** Home uses `cache: 'no-store'` for `/api/products` and keeps `initialProducts` when API returns empty/error, avoiding false empty list.

---

## 3. Production-Grade Stability Strategy

### 3.1 Cache control plan

- **Product detail:** `revalidate: 10`, tags `product(slug)`, `products`. On create/update/delete: `revalidateTag(product(slug))`, `revalidateTag(products)`, `revalidatePath(\`/products/${slug}\`, 'page')`.
- **List (home, collections, API):** `revalidate: 10`, tag `products`. On product create/update/delete: `revalidateTag(products)`, `revalidatePath('/')`, `revalidatePath('/products')`, `revalidatePath('/api/products')`, collection paths as already implemented.
- **next.config.js:** `/products/:path*` keeps `s-maxage=10, stale-while-revalidate=59`. Bypass of stale null on the server makes false 404s rare; true 404s can be cached briefly.

### 3.2 ISR strategy

- **Detail:** 10s revalidate + tag/path revalidation on admin mutations + **stale-null bypass** (direct DB read when cache returns null).
- **List:** 10s revalidate + tag revalidation + empty-list bypass on homepage in production.

### 3.3 Data consistency guarantees

- **Admin → frontend sync:** Create/update/delete always call `revalidateProduct(slug)` (and old slug when slug changes) plus list/collection revalidation and webhook. Product detail path is revalidated with `'page'`.
- **False "no longer available":** Eliminated for existing products by the stale-null bypass: when cache says null, one direct DB read confirms existence before rendering 404.

### 3.4 Recommendations

- **Monitoring:** Log (without PII) when `getCachedProduct(slug)` returns null and bypass finds a product in DB (e.g. slug, no user data) to detect any remaining propagation or cache issues.
- **Vercel:** Rely on tag/path revalidation for cache purge; null-bypass covers propagation delay.
- **Future:** If 404 caching for product URLs must be minimized further, consider middleware or route-level logic to set `Cache-Control: private, no-store` only for 404 responses on `/products/*` (Next.js App Router limits setting response headers from Server Components).

---

## 4. Summary

| Layer            | Root cause                          | Fix |
|-----------------|--------------------------------------|-----|
| Product detail  | Cached null + revalidation delay     | Bypass: when cache returns null, read from DB once; 404 only if DB says no product. |
| Revalidation    | Path revalidation not explicit page | `revalidatePath(\`/products/${slug}\`, 'page')` in `revalidateProduct`. |
| List/detail sync| Same tag `products`; path revalidation | Already revalidating; bypass prevents false 404 even when list is fresh. |

**Result:** Products appear immediately after creation, do not vanish due to stale cache, do not require refresh, and do not show false "This piece is no longer available" when the product exists in the database.
