# Mock Data & Cache — Production Logic Fixes

**Question:** Is there any old cache, mock data, or logic causing bugs when real data is used in production?

**Answer:** Yes. The following were fixed so production never shows mock data or stale logic when real data exists.

---

## 1. Frontend: Mock fallback on homepage sections (FIXED)

**Where:** `NewArrivalsSection`, `GirlsCollectionSection`

**Bug:** Both used `products || mockProducts` as the data source. If `products` was ever `undefined` (e.g. wrong code path or hydration edge case), the UI would show **mock products** in production alongside or instead of real data.

**Fix:** Use only real data or empty:
- `const sourceProducts = Array.isArray(products) ? products : [];`
- Removed `mockProducts` import from both components.
- Girls section filter uses `p.category?.slug === "girls"` for safe access.

**Result:** Production never renders mock products on the homepage; it shows either the API/server list or an empty state.

---

## 2. Build: Mock data baked into static output (FIXED)

**Where:** `lib/db/index.ts` — `executeQuery()`

**Bug:** During `next build` (production build), if `DATABASE_URL` was unset or the DB was unreachable, `executeQuery` returned **mock fallback data**. That mock was then baked into static pages (e.g. homepage, `generateStaticParams` product slugs). After deploy, those pages could serve mock products until ISR revalidated (e.g. 10s), so production could show fake products even when real data existed.

**Fix:** In production build, never return mock:
- When `isBuildTime && isProduction` and config is mock/unset: **throw** so the build fails unless the DB is configured.
- When all retries failed and `isBuildTime && isProduction`: **throw** instead of returning `fallbackData`.

**Result:** Production builds require a real DB at build time (e.g. `DATABASE_URL` in Vercel build env). No mock data is written into static output.

---

## 3. Comments / docs (no behavior change)

- `app/page.tsx`: Fallback comment updated to say sections show empty, not mock.
- `app/api/products/route.ts`: Comments updated to say production does not use mock fallback.
- `app/api/products/[slug]/route.ts`: Comments updated; retry is same DB call, not mock.

---

## 4. What was already safe

- **API routes:** On DB failure, `getAllProducts()` / `getProductBySlug()` throw in production, so the API returns 500, not mock.
- **executeQuery runtime:** In production runtime (not build), mock is never returned; either DB succeeds or we throw.
- **CompleteTheLook:** Already uses empty array in production, mock only in development.
- **DB_CONFIG:** With `DATABASE_URL` set, `DB_CONFIG.type` is `'postgres'`, so the mock path is not used in production runtime.

---

## 5. Other mock usage (unchanged; not product list)

- **Reviews:** `reviews` from mock-data — intentional until real reviews exist.
- **Style guide / Complete Looks:** `styleLooks`, `completeLooks` from mock-data — static/editorial content.
- **Order tracking:** Mock orders in `/api/orders/track` — replace when real tracking is wired.
- **Admin InventoryManagement:** Uses mockProducts for demo; admin-only, not storefront.

These do not affect the main storefront product list/detail when real data is entered.

---

## 6. Cache (separate from mock)

Product list/detail caching and revalidation were already addressed in the SEV-1 audit (revalidate on create/update/delete, path/tag invalidation, CDN TTL alignment). No additional cache bugs were introduced by mock; the fixes above only remove mock as a source of data in production.
