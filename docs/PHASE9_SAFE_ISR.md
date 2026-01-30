# Phase 9 — Final Performance Reintroduction (Safe ISR)

**Only after system stability.** ISR is enabled only for listing pages; product detail, search, cart, and checkout stay fully dynamic.

## ISR by Page Type

| Page Type   | Route(s)              | ISR | Config |
|------------|------------------------|-----|--------|
| Home       | `/`                   | ✅  | `revalidate = 60` |
| Collections| `/collections`        | ✅  | `revalidate = 60` |
| Categories | `/collections/[slug]` | ✅  | `revalidate = 60` |
| Search     | Server action / API   | ❌  | Stays dynamic |
| Product    | `/products/[slug]`    | ❌  | `dynamic = "force-dynamic"`, `revalidate = 0` |
| Cart       | `/cart`               | ❌  | Dynamic (layout) |
| Checkout   | `/checkout`           | ❌  | Dynamic (layout) |

## Why Product / Search / Cart / Checkout Stay Dynamic

- **Product** — Guarantees permanent product visibility; no stale or missing product pages.
- **Search** — Results must reflect current catalog; no cached search.
- **Cart / Checkout** — User-specific; must never be cached.

## Revalidate Interval

- `revalidate = 60` → Home, Collections, and Collection slug pages revalidate at most every 60 seconds.
- Adjust in `app/page.tsx`, `app/collections/page.tsx`, and `app/collections/[slug]/page.tsx` if you want a different interval (e.g. 300 for 5 minutes).

## Files Changed

- `app/page.tsx` — Removed `force-dynamic`; set `revalidate = 60`.
- `app/collections/page.tsx` — Removed `force-dynamic`; set `revalidate = 60`.
- `app/collections/[slug]/page.tsx` — Removed `force-dynamic`; set `revalidate = 60`.
- `app/products/[slug]/page.tsx` — Unchanged: `dynamic = "force-dynamic"`, `revalidate = 0`.
