# Phase 5 — Product Card Rebuild (Perfect UX + Zero Overlap)

## Objective

Refactor the product card to a strict vertical stack with no overlapping layout patterns, no z-index hacks, and no floating buttons over product text. Quick View lives only inside the image area.

## Structure (Non-Negotiable)

```html
<div class="product-card">
  <a href="...">
    <div class="product-card-image-wrap">
      <img />
      <!-- Overlays inside image only: badges, wishlist, Quick View, out-of-stock -->
      <button class="quick-view">Quick View</button>
    </div>
    <div class="product-card-info">
      <p>Category</p>
      <h3>Product Name</h3>
      <p>Price</p>
    </div>
  </a>
</div>
```

## Rules

- **No absolute elements outside `image-wrap`** — All overlays (badges, wishlist, Quick View, out-of-stock) are inside the image wrapper.
- **No z-index stacking hacks** — Card and info use normal flow; image-wrap uses relative/absolute only for overlays on the image.
- **No floating buttons over product text** — Quick View is an overlay on the image only; info block is below.
- **Fully responsive** — Image aspect ratio 4/5; info uses responsive padding and font sizes (`text-base sm:text-lg`, `p-3 sm:p-4`).

## Files Changed

- **`components/products/ProductCard.tsx`** — Rebuilt with `product-card` > Link > `product-card-image-wrap` (image + Quick View + badges + wishlist) > `product-card-info` (category, h3, price). Removed “Available Sizes” overlay to keep image area simple. Quick View always visible (no hover-only on desktop).
- **`app/globals.css`** — Phase 5 product card styles: `.product-card` (flex column, no aspect-ratio on card), `.product-card-image-wrap`, `.product-card-info`. Removed duplicate spacing blocks, z-index rules for `.product-image`, and hover transform on card. Mobile scaling uses content-driven height.

## Classes

| Class | Purpose |
|-------|---------|
| `.product-card` | Outer flex column; border, shadow, rounded. |
| `.product-card-image-wrap` | Wraps image and image-only overlays; aspect 4/5. |
| `.product-card-info` | Name, price, category; strict vertical stack. |
| `.product-card-title` | Responsive clamp for product name. |
| `.product-card-price` | Responsive clamp for price. |

## Accessibility

- Quick View and Wishlist use `stopPropagation` / `preventDefault` so the card link does not fire when those are clicked.
- Quick View has `aria-label="Quick view {product.name}"`.
- Whole card remains one link to PDP for keyboard and screen readers.
