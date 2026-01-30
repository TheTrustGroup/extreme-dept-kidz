# Phase 7 — Mobile-First Commerce UX Flow

## Mobile Grid

- **2 column grid** — Product grid uses `grid-cols-2` on mobile (<768px), then `lg:grid-cols-3`, `xl:grid-cols-4` etc. (see `ProductGrid.tsx`).
- **Tighter gaps on mobile** — `gap-2 sm:gap-3 md:gap-4 lg:gap-6` so two columns fit without crowding.
- **Large touch targets** — Buttons and interactive elements use `min-h-[44px] min-w-[44px]` and/or class `.touch-target-min` (WCAG 2.5.5).
- **Minimal text clutter** — On mobile, product card category line is hidden (`hidden sm:block`); name and price use smaller responsive sizes (`text-sm` / `text-base` on mobile).
- **Big product images** — Image area keeps 4:5 aspect ratio; 2-col layout gives each card ~50% width so images stay prominent.

## Mobile Interaction Rules

- **No hover-dependence** — Quick View is always visible on the card (Phase 5). QuickViewModal image nav (prev/next) is always visible on mobile (`opacity-100 md:opacity-0 md:group-hover:opacity-100`).
- **No hidden critical UI** — Filters/sort are in toolbar or drawer; add-to-cart is in sticky bar and modals. Category on card is optional (hidden on mobile).
- **Bottom-sheet modals** — On viewport &lt;768px, modals open as bottom sheets: fixed to bottom, full width, `max-h-[90vh]`, `rounded-t-2xl`, animate `y: 100%` → `0`. Applied to:
  - QuickViewModal
  - SignInModal
  - CreateAccountModal
  - CompleteTheLookSizeModal
  - CustomizeLookModal
- **Sticky add-to-cart bar** — `StickyAddToCart` is always visible on mobile (viewport &lt;1024px). Uses `pb-safe` / `env(safe-area-inset-bottom)` for iOS. Size and quantity buttons use 44px min touch targets.

## Files / Hooks

- **`lib/hooks/use-media-query.ts`** — `useMediaQuery(query)`, `useIsMobile()` for &lt;768px (used for bottom-sheet).
- **`app/globals.css`** — `.touch-target-min` (44×44px).
- **`ProductGrid.tsx`** — 2-col mobile grid, gaps, lower min-height for grid/items.
- **`ProductCard.tsx`** — Category hidden on mobile, smaller text, Quick View 44px.
- **`StickyAddToCart.tsx`** — Size and quantity buttons 44px, safe area padding.
- **Modals** — use `useIsMobile()` and bottom-sheet layout/animation on mobile.
