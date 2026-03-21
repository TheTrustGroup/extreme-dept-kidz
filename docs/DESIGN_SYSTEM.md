# Extreme Dept Kidz — Design System

> Version 1.0 · Built with Next.js 14, Tailwind CSS, Framer Motion

---

## Brand Principles

1. **One CTA per section.** Every section has exactly one primary action. Secondary actions are text links, never buttons.
2. **Space is the luxury signal.** When in doubt, add whitespace. Never compress.
3. **8px grid, always.** All spacing values are multiples of 8. No 5px, 13px, 15px, or 22px values.
4. **Product first, chrome second.** Images and prices dominate. If a UI element competes with a product image, simplify the UI.
5. **Touch-first, keyboard-friendly.** Minimum 44px hit targets. No hover-only affordances for primary actions.

---

## Colour Tokens

```css
/* Primary palette */
--color-navy:        #0f172a   /* primary text, buttons */
--color-cream:       #faf8f5   /* page background, light surfaces */
--color-gold:        #c9a227   /* accent, badges, progress, focus ring */

/* Semantic */
--bg-page:           cream (light) / #0a0f1e (dark)
--bg-surface:        white (light) / #111827 (dark)
--bg-surface-2:      #f7f5f2 (light) / #1a2235 (dark)
--text-primary:      navy (light) / cream (dark)
--text-secondary:    navy/55% (light) / cream/55% (dark)
--text-tertiary:     navy/35% (light) / cream/35% (dark)
--border-default:    navy/8% (light) / cream/8% (dark)
--border-strong:     navy/16% (light) / cream/16% (dark)
```

**Rules:**

- Never use hardcoded hex values in components. Always use CSS variables.
- Gold is accent only — never use it as a background for large areas.
- The navy footer is always navy in both light and dark modes.

---

## Typography Scale

| Role         | Font             | Size (clamp)        | Weight | Transform  |
|--------------|------------------|---------------------|--------|------------|
| Display LG   | Playfair Display | 44–72px             | 400    | —          |
| Display      | Playfair Display | 36–56px             | 400    | —          |
| H1           | Playfair Display | 32–40px             | 400    | —          |
| H2           | Playfair Display | 24–32px             | 400    | —          |
| H3 / Label   | Montserrat       | 11–14px             | 600    | Uppercase  |
| Body         | Inter            | 15–16px             | 400    | —          |
| Body SM      | Inter            | 13–14px             | 400    | —          |
| Price        | Inter            | 15–26px             | 600    | —          |

**Rules:**

- Use `.text-display`, `.text-h1`, `.text-h2`, `.text-h3`, `.text-label`, `.text-price` utility classes.
- Never set `font-size` ad-hoc on headings. Use the scale.
- Playfair Display is for headings and CTAs only. Never use it for body text or labels.
- Montserrat is for labels, tabs, buttons, badges — always uppercase, always tracked.
- Inter is for all body copy, prices, descriptions, input values.

---

## Spacing Scale

All spacing is based on 8px.

```
4px   — icon gap, tight pairs
8px   — component internal gap
12px  — between related elements
16px  — standard gap
24px  — section sub-gap
32px  — component padding
40px  — section-sm padding
48px  — component max padding
64px  — section padding
96px  — section-lg padding
128px — section-xl padding
```

**Rules:**

- Use Tailwind spacing utilities (`gap-4`, `p-6`, `mb-8`) or the CSS custom properties.
- Never use values not in this scale (no `p-5`, `mb-3`, `gap-7` unless justified).

---

## Motion Tokens

```ts
// lib/motion.ts
fadeUp       — page sections, scroll-triggered content
staggerItem  — product grid cards
slideInRight — cart drawer, mobile nav
slideInBottom — filter bottom sheet
scaleIn      — modals, quick view
fadeIn       — overlays, backdrops
dropdownIn   — header dropdown, sort menu
stickyBarReveal — sticky add-to-cart bar
heroLineReveal  — hero text lines
```

**Rules:**

- Always import variants from `lib/motion.ts`. Never define local variants.
- Use `useReducedMotion()` from `lib/useReducedMotion.ts` to gate animations.
- Easing: `[0.16, 1, 0.3, 1]` for entrances. `easeIn` for exits. Never `linear` for UI.
- Duration: 200–250ms for micro (hover, tooltip). 300–450ms for layout. 600ms max for hero.

---

## Component Inventory

### Layout

- `Header.tsx` — fixed, scrolled shadow, dropdown nav, cart badge
- `Footer.tsx` — navy bg, 4-col desktop, accordion mobile, payment icons
- `TopBar.tsx` — dismissible announcement bar, rotating messages
- `MobileNav.tsx` — right drawer, staggered links, bottom actions

### Product

- `ProductCard.tsx` — 4:5 image, price dominant, hover CTA desktop, inline CTA mobile
- `ProductGrid.tsx` — responsive 2/3/4 col, skeleton loading, empty state
- `ProductInfo.tsx` — breadcrumb, price block, size pills, add to bag, accordions
- `StickyAddToCart.tsx` — IntersectionObserver-triggered, thumbnail + price + CTA

### Collection

- `CollectionToolbar.tsx` — mobile bottom sheet filter, desktop sort dropdown, active pills
- `CollectionTabs.tsx` — scrollable tab nav, animated underline indicator

### Cart

- `CartDrawer.tsx` — right slide-in, line items, free shipping bar, checkout CTA
- `CartPage.tsx` — full page, 2-col desktop, promo code, order summary

### Checkout

- `CheckoutLayout.tsx` — minimal chrome, step indicator, secure badge
- `FloatingInput.tsx` — floating label, error state, hint text
- `OrderSummary.tsx` — collapsible mobile, item thumbnails, totals
- `ShippingStep.tsx` — contact + address form, Ghana regions
- `PaymentStep.tsx` — MoMo-first, network selector, prompt flow, card fallback
- `ReviewStep.tsx` — confirm all, terms agreement, place order

### Home

- `HeroSection.tsx` — mobile full-bleed / desktop editorial split
- `TrustBar.tsx` — navy band, 4 items, SVG icons, grid layout
- `JustDropped.tsx` — section header, product grid, view all
- `ShopByCategory.tsx` — 2-panel editorial, hover zoom, gradient overlay
- `NewsletterSection.tsx` — navy section, inline form, success state

### UI Primitives

- `EmptyState.tsx` — 6 illustrations, size variants, CTA
- `ErrorBoundaryFallback.tsx` — full and compact variants
- `ClientErrorBoundary.tsx` — React class boundary
- `ToastProvider.tsx` — 4 types, progress bar, pause on hover, stack ≤ 3
- `ImageWithSkeleton.tsx` — skeleton → fade-in wrapper

### Store

- `lib/stores/toast-store.ts` — Zustand, `useToast()` hook

---

## Button System

```css
.btn-primary   — navy fill, cream text, sharp corners
.btn-secondary — outline navy, transparent fill, hover fills
/* Full-width variants: add class btn-primary-full or btn-secondary-full */
/* Height: 52px standard, 56px on PDP, 48px compact */
```

**Rules:**

- One primary button per section maximum.
- Never use two `.btn-primary` buttons side by side.
- "Continue Shopping" is always a text link, never a button.
- Checkout CTA is always `.cart-checkout-btn` (same visual as primary, with arrow).

---

## Copy Voice

| ✓ Use               | ✗ Avoid            |
|---------------------|--------------------|
| "Your Bag"          | "Your Cart"        |
| "Add to Bag"        | "Add to Cart"      |
| "Young Legends"     | "Kids"             |
| "Shop New Arrivals" | "Buy Now"          |
| "GHS ₵"             | "GH₵" or "cedis"   |
| "Place Order"       | "Submit Order"     |
| "Get in Touch"      | "Contact Us"       |
| "Explore"           | "Click Here"       |

---

## File Structure

```
app/
  layout.tsx          — root layout, fonts, metadata, providers
  page.tsx            — homepage (server component, ISR)
  not-found.tsx       — 404
  error.tsx           — page-level error boundary
  collections/
    page.tsx          — collections index
    [slug]/
      page.tsx        — collection page (server)
      CollectionPageClient.tsx
  products/
    [slug]/
      page.tsx        — product page (server)
      ProductPageClient.tsx
  cart/
    page.tsx
  checkout/
    page.tsx
    CheckoutClient.tsx
    success/
      page.tsx

components/
  layout/             — Header, Footer, TopBar, MobileNav
  home/               — HeroSection, TrustBar, JustDropped, ShopByCategory, Newsletter
  product/            — ProductCard, ProductGrid, ProductInfo, StickyAddToCart
  collection/         — CollectionToolbar, CollectionTabs
  cart/               — CartDrawer, CartPage, FreeShippingBar
  checkout/           — CheckoutLayout, FloatingInput, OrderSummary, steps
  ui/                 — EmptyState, ErrorBoundaryFallback, ClientErrorBoundary,
                        ToastProvider, ImageWithSkeleton

lib/
  motion.ts           — all Framer Motion variants
  useReducedMotion.ts — reduced motion hook
  useScrolled.ts      — scroll position hook
  webVitals.ts        — Core Web Vitals reporting
  imageLoader.ts      — Supabase image loader + blur placeholder

lib/stores/
  toast-store.ts      — global toast notifications (Zustand)

docs/
  DESIGN_SYSTEM.md    — this file
```

---

## Quick Reference — Common Patterns

### Adding a new page

1. Create `app/[route]/page.tsx` as a server component
2. Fetch data server-side
3. Pass to a `[Route]Client.tsx` client component
4. Use `container-luxury section` for page padding
5. Add page `<title>` via `export const metadata`

### Adding a new section

1. Create in `components/home/` or appropriate directory
2. Use `useInView` from Framer Motion for scroll-triggered animation
3. Import variants from `lib/motion.ts`
4. Wrap with `ClientErrorBoundary` if it fetches data

### Adding a toast

```ts
const { success, error, info, warning } = useToast()
success('Title', 'Optional message')
error('Something went wrong', 'Please try again.')
```

### Updating colours

1. Update CSS variables in `app/globals.css` `:root`
2. Update Tailwind tokens in `tailwind.config.ts`
3. Never update component files directly for colour changes

---

*Last updated: 2026 · Extreme Dept Kidz v1.0*
