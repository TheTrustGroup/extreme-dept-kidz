# SEV-1 Production Forensic Audit: Product Visibility & "No Longer Available"

**Issue:** Products uploaded via admin sometimes show up, then vanish, require refresh to reappear, disappear after navigation, and when clicked show: *"This piece is no longer available — return to home"*.

**Scope:** Full-stack audit from customer (mobile + desktop) and admin backend, including caching and deployment.

---

## 1. Error Message & Flow

| Location | Behavior |
|----------|----------|
| **Message** | Rendered in `app/products/[slug]/not-found.tsx`: "This Piece Is No Longer Available" + "Return Home" |
| **Trigger** | `app/products/[slug]/page.tsx` calls `getCachedProduct(slug)` → if `null`, calls `notFound()` |
| **Data** | `getCachedProduct` uses `unstable_cache(getProductBySlug(slug), ["product", slug], { tags: [product(slug), products], revalidate: 10 })` |

So the error is a **404 Not Found** when the product detail page’s cached/data layer returns no product for that slug.

---

## 2. Root Causes Identified

### 2.1 Product detail path/tag not revalidated on DELETE (CRITICAL)

**File:** `app/api/admin/products/[id]/route.ts` (DELETE)

- After `prisma.product.delete`, the handler revalidates:
  - Tags: `products`, `homepage`, `collections`, `categories`, `completeLooks`, `completeLookProduct(id)`
  - Paths: `/products`, `/collections`, `/`, `/admin/products`, `/api/products`
- It does **not** call:
  - `revalidatePath(\`/products/${existing.slug}\`)`
  - `revalidateTag(CACHE_TAGS.product(existing.slug))`

**Effect:** The detail page for the deleted product can stay in cache (or serve a previously cached 404). Users who had the product in a list (e.g. from another cache or SWR) and click through get a cached response and see "no longer available" until cache expires (e.g. 60s CDN + 10s ISR).

**Fix:** Revalidate the deleted product’s path and tag (see Implementation below).

---

### 2.2 Old slug not revalidated when slug changes on UPDATE (HIGH)

**File:** `app/api/admin/products/[id]/route.ts` (PUT)

- On update, code calls `revalidateProduct(product.slug, product.id)` (new slug).
- It does **not** revalidate the **previous** slug when `existingProduct.slug !== product.slug`.

**Effect:** Old URL `/products/old-slug` can keep serving cached content or a stale 404; new URL is correct. Bookmarks or shared links to the old slug show wrong or "no longer available" until cache TTL expires.

**Fix:** When slug has changed, also call `revalidateProduct(existingProduct.slug, existingProduct.id)` (and/or equivalent path/tag revalidation for the old slug).

---

### 2.3 Product detail CDN cache longer than list pages (HIGH)

**File:** `next.config.js` headers

| Route | Cache-Control |
|-------|----------------|
| `/` (homepage) | `max-age=0, s-maxage=10, stale-while-revalidate=59` |
| `/collections/:path*` | `max-age=0, s-maxage=10, stale-while-revalidate=59` |
| `/products/:path*` | `max-age=0, s-maxage=60, stale-while-revalidate=300` |

**Effect:** List pages (home, collections) can show a product (e.g. after revalidation or SWR) while the product detail is still served from CDN with a 60s (or 300s stale) window. If that CDN entry was a 404 (e.g. from before the product existed), the user sees "no longer available" after clicking. Different TTLs also cause list vs detail to diverge after admin create/update/delete.

**Fix:** Align product detail with list pages: e.g. `s-maxage=10, stale-while-revalidate=59` so list and detail refresh on a similar cadence and 404s don’t stick for 60s.

---

### 2.4 Bulk delete does not revalidate each product’s detail page (HIGH)

**File:** `app/api/admin/products/bulk/route.ts` (case `'delete'`)

- Revalidates paths: `/products`, `/collections`, `/`, `/admin/products`, and `completeLookProduct(id)` per id.
- Does **not** revalidate:
  - `CACHE_TAGS.products` (and related list tags)
  - Per-product path: `revalidatePath(\`/products/${product.slug}\`)`
  - Per-product tag: `revalidateTag(CACHE_TAGS.product(product.slug))`

**Effect:** After bulk delete, list pages may eventually refresh (if other revalidation or TTL kicks in), but each deleted product’s detail page can remain cached, leading to "no longer available" or stale content when opening those URLs.

**Fix:** For each deleted product, revalidate path and tag for that slug; revalidate list-level tags (e.g. `products`, `homepage`, `collections`).

---

### 2.5 404 responses cached with same TTL as 200 (MEDIUM)

When `getCachedProduct(slug)` returns `null`, the page calls `notFound()`. That 404 response is served with the same `Cache-Control` as a successful product page (e.g. `s-maxage=60`). So a 404 (e.g. "product not yet created" or "just deleted") can be cached at the CDN for up to 60s.

**Effect:** Right after admin creates a product, a request that hits a CDN node still holding the old 404 can show "no longer available" until that cache entry expires or is revalidated.

**Mitigation:** Shortening product detail `s-maxage` to 10 (same as list pages) reduces the 404 cache window and aligns behavior with list revalidation (see 2.3).

---

### 2.6 Revalidation coverage (admin create/update) — OK

- **Create:** `app/api/admin/products/route.ts` calls `revalidateProduct(product.slug, product.id)`, revalidatePath for collections/home/products, and `triggerProductUpdatedWebhook`. Product detail path and tag for the **new** slug are revalidated.
- **Update:** `app/api/admin/products/[id]/route.ts` calls `revalidateProduct(product.slug, product.id)` and category/collection revalidation. Only missing piece is revalidation of the **old** slug when slug changes (see 2.2).
- **Webhook:** `app/api/webhooks/product-updated/route.ts` revalidates tags and paths including `revalidateProduct(productSlug, productId)` and `revalidatePath(\`/products/${productSlug}\`, "page")`. Good for consistency; optional if admin routes are always called first.

---

### 2.7 Data layer (getProductBySlug) — OK

- `lib/db/index.ts` `getProductBySlug`: exact slug first, then case-insensitive fallback. No extra caching inside `executeQuery`; only caching is in the page’s `getCachedProduct`. No double-caching issue.

---

## 3. Customer vs Admin Experience

| Experience | Observation |
|------------|-------------|
| **Customer – list** | Home/collections use `unstable_cache` + SWR; list can show products soon after create. |
| **Customer – detail** | Detail uses `getCachedProduct(slug)` (tagged cache). If CDN still has old 404 (longer s-maxage) or path/tag not revalidated on delete/slug change, click leads to "no longer available". |
| **Customer – navigation** | Moving list → detail → back → detail again can hit different caches (browser, CDN, server), so product can "vanish" or reappear depending on which cache is used. |
| **Admin** | Create/update/delete call revalidatePath/revalidateTag; webhook re-runs revalidation. Gaps: delete and slug-change do not revalidate the affected detail path/tag; bulk delete does not revalidate per-product or list tags. |

---

## 4. Implementation Fixes Applied

1. **DELETE (single product)**  
   In `app/api/admin/products/[id]/route.ts` (DELETE):  
   - Call `revalidatePath(\`/products/${existing.slug}\`, 'page')` and `revalidateTag(CACHE_TAGS.product(existing.slug))` (and optionally `revalidateProduct(existing.slug, existing.id)` which does both).

2. **UPDATE (slug change)**  
   In `app/api/admin/products/[id]/route.ts` (PUT):  
   - When `existingProduct.slug !== product.slug`, call the same revalidation for the old slug (path + tag or `revalidateProduct(existingProduct.slug, existingProduct.id)`).

3. **Product detail Cache-Control**  
   In `next.config.js`, for `/products/:path*`:  
   - Set `s-maxage=10, stale-while-revalidate=59` to match homepage/collections.

4. **Bulk delete**  
   In `app/api/admin/products/bulk/route.ts` (case `'delete'`):  
   - Revalidate list tags: `revalidateTag(CACHE_TAGS.products)`, `revalidateTag(CACHE_TAGS.homepage)`, etc.  
   - For each deleted product: `revalidatePath(\`/products/${product.slug}\`)`, `revalidateTag(CACHE_TAGS.product(product.slug))`.

---

## 5. Verification Checklist

- [ ] After creating a product in admin, open storefront (incognito): product appears in list and detail loads without "no longer available".
- [ ] After deleting a product, list no longer shows it and `/products/<slug>` shows not-found (not stale product page).
- [ ] After changing a product slug, old URL shows not-found, new URL shows product.
- [ ] Bulk delete: list and each deleted product URL reflect deletion (no stale detail).
- [ ] Mobile and desktop: same behavior; refresh or navigate list → detail → back does not make the product "vanish" or show 404 when it should be available.

---

## 6. Optional Follow-Ups

- **404-specific Cache-Control:** If possible (e.g. middleware or runtime that can set headers for 404 on `/products/*`), use `private, no-store` for product 404s to avoid CDN caching them.
- **Monitoring:** Log or metric when `getCachedProduct(slug)` returns null in production (by slug, no PII) to detect residual cache/consistency issues.
- **Vercel:** Confirm tag/path revalidation propagates to edge as expected; if not, consider shorter `revalidate` (e.g. 5s) for product page or force-dynamic for detail during rollout.
