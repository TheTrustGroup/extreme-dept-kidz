# Polo Ralph Lauren–Inspired Refinements

Clean, minimal UX principles applied from Polo Ralph Lauren’s app. Use this as a checklist for further polish.

---

## Done (no mismatches)

- **Product cards** — Image-only (no overlays except out-of-stock), vertical info stack (name + wishlist right | category | price), tap card = PDP.
- **Skeletons** — ProductGridSkeleton and SkeletonCard match ProductCard: 4:5 image, same info layout, no heavy border.
- **Placeholders** — JustDroppedSection and NewArrivalsSection use `product-card-placeholder` (non-interactive, consistent).
- **Typography** — Product card title/price use sans-serif and clear hierarchy; CSS `.product-card-title` / `.product-card-price` aligned.

---

## Further refinements (optional)

### 1. Collection / listing pages

- **Filter & sort bar** — Polo uses a single, clear “FILTER & SORT” bar above the grid. You already have FilterSidebar and ProductToolbar; consider a single horizontal bar (icon + “FILTER & SORT”) that opens filter/sort, for a cleaner header.
- **Breadcrumb** — Keep collection name prominent (e.g. “Boys (Sizes 8–20)”); ensure breadcrumb is minimal and doesn’t compete with the title.
- **Empty state** — Short, friendly copy (e.g. “No items match your selection. Try adjusting filters.”) and one primary CTA (e.g. “View all” or “Clear filters”).

### 2. Product detail page (PDP)

- **Price first** — Polo often shows price and shipping line (e.g. “FREE SHIPPING WITH AN RL ACCOUNT”) near the top, then color, then size.
- **Size CTA** — Single primary button: “SELECT SIZE” (or “Add to bag” when size is selected). Keep size selector and CTA in one clear block.
- **Sections** — Use simple dividers and tappable rows for “REVIEWS”, “SHIPPING AND FREE RETURNS”, “SHARE ITEM”, “VIEW PRODUCT DETAILS” so the PDP feels like one scrollable sheet.
- **Sticky footer** — One row: primary “SELECT SIZE” / “Add to bag” + secondary wishlist; same pattern on mobile and desktop.

### 3. Typography and spacing

- **Sans-serif** — Use one sans family for product names, prices, and UI labels site-wide for a Polo-like, editorial-but-clean look.
- **Whitespace** — Keep grid gaps (e.g. `gap-4 sm:gap-6`) and section padding generous; avoid dense blocks of text or controls.
- **Hierarchy** — Product name medium weight; category/size smaller and lighter; price semibold. No more than two font weights per card.

### 4. Navigation and chrome

- **Header** — Back, title, search, cart only; no extra buttons. Title = collection or page name (e.g. “Boys (Sizes 8–20)”).
- **Bottom nav** — If you add a persistent bottom bar, keep 4–5 items (e.g. Home, Shop, Collections, Account) with clear labels and one active state.

### 5. Cart and checkout

- **Cart drawer / page** — Product image, name, size, price, quantity; edit/remove secondary. No clutter; “Checkout” is the main CTA.
- **Checkout** — Few steps; clear section titles (Shipping, Payment, Review); one primary button per step.

### 6. Consistency checks

- **No mixed card styles** — Every product list uses the same ProductCard (image 4:5, info stack, wishlist right). No alternate “compact” or “featured” card layout unless clearly a different component (e.g. hero).
- **Same empty/error patterns** — One empty-state component (illustration or icon + line + CTA); one error pattern (“Something went wrong” + Try again / Go home).
- **Touch targets** — Buttons and links ≥ 44px height; same for wishlist, size chips, and primary CTAs.

---

## Files to touch (when you refine)

| Area            | Files |
|-----------------|--------|
| Collection list | `app/collections/[slug]/CollectionPageClient.tsx`, `ProductToolbar`, `FilterSidebar` |
| PDP             | `app/products/[slug]/ProductPageClient.tsx`, `ProductInfo.tsx`, `StickyAddToCart.tsx` |
| Cart            | `CartDrawer.tsx`, `CartPreviewDropdown.tsx` |
| Empty / error   | `ProductGrid.tsx` (empty state), `app/error.tsx`, `ErrorBoundary.tsx` |
| Header / nav    | `Header.tsx`, layout/nav components |

Apply these in small steps and test after each change so the experience stays clean and consistent like Polo.
