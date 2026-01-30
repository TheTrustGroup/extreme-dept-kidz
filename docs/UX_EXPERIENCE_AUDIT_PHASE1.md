# UX & UI Experience Audit — Phase 1

**Audit Date:** January 2025  
**Scope:** Mobile-first customer, Desktop customer, Admin  
**Standard:** World-class e-commerce (Apple, Stripe, Shopify, Airbnb, Amazon)

---

## Executive Summary

The platform has a solid foundation: design tokens, spacing scale, typography system, skip links, focus styles, and many 44px tap targets. **Mobile experience is the primary gap**: product cards hide Quick View and size info on touch (hover-only), one critical broken link (404 → About), checkout uses `alert()` for errors, and a few tap targets fall below 44px. Desktop and admin flows are generally strong with clear hierarchy and keyboard support.

---

## A) Mobile-First Customer Perspective (PRIMARY)

### Navigation flow

| Finding | Severity | Detail |
|--------|----------|--------|
| **Mobile nav drawer** | ✅ Good | Right-side drawer, focus trap, Escape to close, body scroll lock. Quick actions (Account, Cart, Search, Theme) at top with 44px targets. |
| **Header** | ✅ Good | Sticky, compact on scroll (3.25rem mobile). Logo, Search, Cart, Menu — all IconButtons use `min-h-[44px] min-w-[44px]`. |
| **TopBar** | ⚠️ Review | If present, adds height; hero already accounts for `2rem + 3.5rem`. Ensure TopBar doesn’t double-count on small viewports. |
| **Breadcrumbs** | ✅ Good | Present on cart, checkout, product, collection. Aids wayfinding. |
| **Floating cart** | ✅ Good | 56×56px FAB, `lg:hidden`, hides near footer to avoid overlap. Links to `/cart`. |

### Page hierarchy & layout

| Finding | Severity | Detail |
|--------|----------|--------|
| **Container padding** | ✅ Good | `px-[var(--space-4)]` (16px) mobile, scales to 24px/32px. Consistent. |
| **Product grid** | ✅ Good | 1 col mobile, gap 16px; ProductCard min-height 420px (mobile) to avoid CLS. |
| **Collection page** | ✅ Good | Sticky toolbar + CollectionQuickTabs; FilterSidebar as drawer (`isOpen`/`onClose`). Pull-to-refresh. |
| **Product (PDP)** | ✅ Good | Single column mobile; gallery + info stack. StickyAddToCart always visible on mobile with `pb-safe` and safe-area padding. |
| **Cart** | ✅ Good | Empty state: icon, “Your Cart Awaits”, CTA “Explore Collections”. With items: list + order summary; mobile gets extra bottom padding for sticky CTA. |

### User journey friction

| Finding | Severity | Detail |
|--------|----------|--------|
| **Quick View on mobile** | 🔴 Critical | ProductCard shows “Quick View” and “Available Sizes” only when `isHovered`. On touch devices there is no hover, so these are effectively **hidden**. Users cannot quick-view or see sizes on card without opening PDP. |
| **Checkout errors** | 🟠 High | CheckoutPageClient and CheckoutFormV2 use `alert()` for payment/shipping errors. No inline validation summary or toast; blocks flow and feels non-premium. |
| **404 → About** | 🔴 Critical | `not-found.tsx` links “About Us” to `/about-us`. App route is `/about`. Link is broken. |
| **Guest checkout** | ⚠️ Review | No explicit “Continue as guest” in audit path; confirm if intentional for conversion. |

### Cognitive load & visual hierarchy

| Finding | Severity | Detail |
|--------|----------|--------|
| **Typography** | ✅ Good | Serif (Playfair) for headings, Inter for UI/body. Type scale and rhythm in globals.css; product title clamp for 2-line. |
| **Spacing** | ✅ Good | 8px base scale (`--space-1`–`--space-13`), used in Header, Footer, Container, ProductGrid. |
| **Hero** | ✅ Good | Full viewport minus header; clear CTAs (“Shop Boys”, “Shop Girls”, etc.) with `min-h-[44px]`. |
| **TrustBar** | ✅ Good | Below hero for trust signals. |

### Tap target sizes (mobile)

| Element | Target | WCAG 2.5.5 (44×44px) |
|---------|--------|----------------------|
| Header IconButtons | 44×44 | ✅ |
| Mobile nav links | min-h 44px | ✅ |
| Hamburger, Close | 44×44 | ✅ |
| Button (all sizes) | min-h 44px | ✅ |
| FloatingCartButton | 56×56 | ✅ |
| StickyAddToCart size chips | min-w 36px | ⚠️ Below 44px |
| StickyAddToCart +/- quantity | 36×36 | ⚠️ Below 44px |
| Footer social icons | 44×44 | ✅ |
| ProductCard Quick View (when shown) | min-h 44px | ✅ (but hidden on touch) |
| WishlistButton | 44×44 (sm/md) | ✅ |
| FilterSidebar options | min-h 44px | ✅ |
| ProductToolbar filter/sort | 44×44 | ✅ |

**Recommendation:** Increase StickyAddToCart size selector and quantity controls to at least 44×44 on touch (e.g. `min-w-[44px] min-h-[44px]` for chips and +/- buttons).

### Scroll behavior

| Finding | Severity | Detail |
|--------|----------|--------|
| **globals.css** | ⚠️ Inconsistency | `scroll-behavior: auto` at line 64 (html) and `scroll-behavior: smooth` at 398 (html/body). One wins; consolidate to one intent (e.g. smooth for in-page, auto for route changes). |
| **Momentum** | ✅ Good | `-webkit-overflow-scrolling: touch` and scroll containers use `data-scroll-container`. |
| **Cart drawer** | ✅ Good | Scrollable content area with native momentum. |
| **Mobile nav** | ✅ Good | Nav links section scrollable; header/footer fixed. |

### Animations & transitions

| Finding | Severity | Detail |
|--------|----------|--------|
| **Reduced motion** | ✅ Good | `@media (prefers-reduced-motion: reduce)` used to disable/reduce shimmer, reveal, and transitions. |
| **ProductCard** | ✅ Good | Hover lift disabled on mobile (`transform: none`); only opacity/color transitions. |
| **Drawers** | ✅ Good | Framer Motion; spring for Cart/MobileNav. |

### Feedback states

| Finding | Severity | Detail |
|--------|----------|--------|
| **Loading** | ✅ Good | PageLoader, PageLoadingBar, StreamingSkeleton, ProductGridSkeleton. |
| **Add to cart** | ✅ Good | StickyAddToCart shows success state; cart drawer can open. |
| **Newsletter** | ✅ Good | Footer: loading, success, inline error. |
| **Checkout** | 🟠 High | Errors via `alert()`; no inline or toast. |
| **Form validation** | ✅ Good | CheckoutFormV2 uses react-hook-form + zod; inline field errors present. |

### Empty states

| Page/Component | Empty state | Severity |
|----------------|------------|----------|
| Cart | “Your Cart Awaits” + CTA | ✅ Good |
| ProductGrid (collection) | “No Items Match Your Selection” + refine filters | ✅ Good |
| SearchOverlay | “No products found” | ✅ Good |
| Error page | “Something went wrong” + Try Again / Go Home | ✅ Good |
| Not-found | 404 + Go Home / View Collections + quick links | ✅ Good (one link broken) |
| Girls + no products | ComingSoonPage | ✅ Good |

### Error handling UX

| Finding | Severity | Detail |
|--------|----------|--------|
| **Error boundary** | ✅ Good | Error.tsx with reset + Go Home; theme-aware. |
| **Not-found** | ✅ Good | Theme-aware; quick links (fix /about-us). |
| **Checkout** | 🟠 High | `alert()` for payment/API errors; should use toast or inline banner. |
| **Live regions** | ⚠️ Review | globals.css: `[role="status"], [aria-live]` use `left: -10000px`. Ensure these are still announced (e.g. prefer `sr-only` pattern so content is in DOM for a11y). |

---

## B) Desktop Customer Perspective

### Navigation

| Finding | Severity | Detail |
|--------|----------|--------|
| **MegaMenu** | ✅ Good | Boys has mega menu; hover to open. |
| **Nav links** | ✅ Good | ALL, BOYS, NEW ARRIVALS, GIRLS, COLLECTIONS; active state and hover underline. |
| **Search** | ✅ Good | Cmd/Ctrl+K; SearchOverlay with focus trap and arrow-key navigation. |
| **Cart preview** | ✅ Good | Cart icon toggles CartPreviewDropdown. |

### Product discovery

| Finding | Severity | Detail |
|--------|----------|--------|
| **Home** | ✅ Good | Hero → TrustBar → product sections (SWR) → Shop by Style → Category → Featured → Editorial → Style Guide. Clear hierarchy. |
| **Collection** | ✅ Good | FilterSidebar sticky; ProductToolbar (sort, filter); ActiveFilters; ProductGrid. |
| **ProductCard** | ✅ Good | Hover: secondary image, Quick View, size pills, wishlist. Desktop hover works as intended. |
| **PDP** | ✅ Good | 60/40 gallery–info grid; sticky sidebar; StickyAddToCart appears after 400px scroll. |

### Checkout flow

| Finding | Severity | Detail |
|--------|----------|--------|
| **Steps** | ✅ Good | CheckoutSteps: Shipping → Payment → Review; horizontal on desktop, compact on mobile. |
| **Form** | ✅ Good | Multi-step form with shipping methods and payment (card/MoMo). |
| **Order summary** | ✅ Good | Sticky sidebar with totals. |
| **Errors** | 🟠 High | Same `alert()` issue as mobile. |

### Visual hierarchy & typography

| Finding | Severity | Detail |
|--------|----------|--------|
| **Headings** | ✅ Good | clamp() for responsive H1–H4; serif for display. |
| **Body** | ✅ Good | 16px base; line-height 1.6. |
| **Product cards** | ✅ Good | Title clamp; price prominent; badges (NEW, SALE). |

---

## C) Admin Perspective

### Layout & navigation

| Finding | Severity | Detail |
|--------|----------|--------|
| **Sidebar** | ✅ Good | AdminSidebar with collapsible sections; responsive (drawer on mobile). Badges (pending orders, low stock). |
| **Header** | ✅ Good | AdminHeader with menu toggle, breadcrumb context. |
| **Auth** | ✅ Good | Public routes (login, forgot-password, reset-password) render without sidebar; redirect when not authenticated. |
| **Loading** | ⚠️ Review | Full PageLoader while `checkingAuth`; consider lighter placeholder to reduce perceived wait. |

### Consistency

| Finding | Severity | Detail |
|--------|----------|--------|
| **admin-globals.css** | ✅ Good | Separate admin space vars and styles. |
| **Breadcrumb** | ✅ Good | AdminBreadcrumb + AdminBreadcrumbProvider for context. |
| **Toast** | ✅ Good | ToastProvider for success/error feedback. |

---

## UX Bottlenecks (Prioritized)

1. **ProductCard on mobile:** Quick View and “Available Sizes” are hover-only → **invisible on touch.** Show Quick View as a persistent button on mobile, and show sizes (e.g. first 3–5) by default or on tap.
2. **Checkout errors:** Replace `alert()` with toast or inline error banner and optional field-level summary.
3. **404 About link:** Change “About Us” href from `/about-us` to `/about`.
4. **StickyAddToCart tap targets:** Bump size chips and +/- buttons to 44×44 on mobile.
5. **Scroll-behavior:** Unify `scroll-behavior` in globals.css (and optionally differentiate in-page vs. route change).
6. **Live regions:** Use a consistent sr-only pattern for `[role="status"]`/`[aria-live]` so announcements are not hidden from assistive tech.

---

## UX Inconsistencies

| Area | Inconsistency | Recommendation |
|------|----------------|----------------|
| **Error feedback** | Checkout uses alert; rest of app uses inline/toast | Standardize on toast + optional inline summary. |
| **scroll-behavior** | auto vs. smooth in globals.css | Single source of truth; document intent. |
| **Sticky bar padding** | StickyAddToCart uses both `pb-safe` and inline `paddingBottom: max(...)` | Use one approach (e.g. utility + Tailwind) for maintainability. |
| **Button size** | Button `sm` is h-10 with min-h-[44px] (effective 44px) | Keep; ensure no other sm controls go below 44px. |

---

## Conversion Friction Points

1. **Mobile product discovery:** No Quick View or visible sizes on card → more taps to PDP and back; consider always-visible “Quick View” and size hints on mobile.
2. **Checkout:** Alerts feel abrupt and block the flow; friendly, inline/toast errors can reduce drop-off.
3. **404:** Broken “About Us” damages trust; fix link.
4. **Guest checkout:** If not offered, consider for lower-friction first purchase (optional per strategy).

---

## Mobile Usability Failures

| Failure | Impact | Fix |
|--------|--------|-----|
| Quick View hidden on touch | Users can’t quick-view without opening PDP | Show Quick View button always on mobile, or replace with “View” that goes to PDP. |
| Available sizes hidden on touch | Size discovery only on PDP | Show 3–5 size pills on card on mobile, or “Sizes: S, M, L…” text. |
| StickyAddToCart controls &lt; 44px | Harder to tap for some users | Increase to 44×44. |
| 404 /about-us | Dead end on “About Us” | Point to `/about`. |

---

## Layout Improvement Plan

### Short term (1–2 sprints)

1. **ProductCard (mobile):**
   - Always show a “Quick View” or “View” CTA (no hover dependency).
   - Show “Available sizes: S, M, L…” or first 3–5 size pills on card for mobile.
2. **Checkout:** Add toast or inline error area; remove or supplement `alert()`.
3. **Not-found:** Fix “About Us” link to `/about`.
4. **StickyAddToCart:** Use `min-w-[44px] min-h-[44px]` for size chips and quantity +/- on mobile.
5. **globals.css:** Resolve scroll-behavior and live-region styling.

### Medium term

1. **Design system:** Document tap-target rules (44px minimum) and audit all interactive elements.
2. **Empty states:** Add illustration or illustration placeholder for cart and “No results” where it fits the brand.
3. **Checkout:** Consider guest checkout and/or progress persistence (e.g. save draft).
4. **Admin:** Lighter “checking auth” state (e.g. skeleton or minimal header) instead of full-page loader.

### Long term

1. **Performance:** LCP and INP already considered (hero, fonts, buttons); keep monitoring.
2. **A11y:** Full WCAG 2.1 AA pass (focus order, landmarks, live regions, error identification).
3. **Analytics:** Track funnel from collection → PDP → cart → checkout; focus optimization on biggest drop-off step.

---

## Summary Table

| Category | Mobile | Desktop | Admin |
|----------|--------|---------|--------|
| Navigation | ✅ Good (drawer, FAB) | ✅ Good (mega menu, search) | ✅ Good (sidebar, breadcrumb) |
| Tap targets | ⚠️ 2 areas &lt; 44px | N/A | ✅ Good |
| Product discovery | 🔴 Quick View/sizes hidden | ✅ Good | N/A |
| Checkout | 🟠 alert() errors | 🟠 Same | N/A |
| Empty / error states | ✅ Good | ✅ Good | ✅ Good |
| Layout rhythm | ✅ Good | ✅ Good | ✅ Good |

**Critical (fix first):** ProductCard mobile (Quick View + sizes), 404 About link.  
**High:** Checkout error UX (toast/inline).  
**Medium:** StickyAddToCart tap targets, scroll-behavior, live regions.
