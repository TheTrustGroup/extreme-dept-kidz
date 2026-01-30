# Project Rules — Stability Protection (Phase 8)

**Do not regress these:**

1. **No client product fetching** — Product data is fetched only in server components / API / server actions via `lib/data/products.ts`. No fetch/SWR/React Query for products in client components.

2. **No ISR on product detail** — Product pages use `export const dynamic = "force-dynamic"` and `export const revalidate = 0`. Product is fetched with `await getProductBySlug(slug)` in the server component.

3. **No duplicate product API calls** — Single source: `lib/data/products.ts`. All pages and API routes import from there.

4. **No layered absolute layouts** — Product card: image + Quick View inside image-wrap only; info block below. No absolute elements outside image-wrap.

5. **No layout stacking hacks** — No z-index hacks to fix overlap. Use vertical stack and structure.

See `docs/PHASE8_STABILITY_PROTECTION.md` for full checklist and diagnostic logging.
