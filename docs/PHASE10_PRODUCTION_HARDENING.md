# Phase 10 — Production Hardening Checklist

Use this checklist before release and after major changes to ensure production readiness.

---

## ✅ No product hide & seek

- [ ] All products visible in Admin are visible on the storefront (no visibility bugs).
- [ ] Product detail page always fetches from server (`getProductBySlug(slug)` in server component).
- [ ] No client-side product fetching (no fetch/SWR/React Query for products in client components).
- [ ] Product pages use `dynamic = "force-dynamic"` and `revalidate = 0` (Phase 1/8).

---

## ✅ No layout overlap

- [ ] Product card uses strict vertical stack: image-wrap (image + Quick View only) → info (name, price) (Phase 5).
- [ ] No absolute elements outside image-wrap on product cards.
- [ ] No z-index stacking hacks to fix overlapping UI.
- [ ] Modals and side panels use bottom-sheet on mobile where applicable (Phase 7).

---

## ✅ Perfect mobile experience

- [ ] 2-column product grid on mobile (Phase 7).
- [ ] Touch targets ≥ 44px (Quick View, size buttons, modals, sticky add-to-cart).
- [ ] No hover-only critical UI (Quick View and image nav visible on touch).
- [ ] Bottom-sheet modals on mobile (Quick View, Sign In, Create Account, etc.).
- [ ] Sticky add-to-cart bar with safe-area padding on PDP.

---

## ✅ Consistent rendering

- [ ] Single product data source: `lib/data/products.ts` (server only).
- [ ] Home, Collections, and Collection slug pages use safe ISR (`revalidate = 60`) (Phase 9).
- [ ] Product, Search, Cart, Checkout stay fully dynamic (no ISR).
- [ ] No duplicate API calls for the same product data in one request.

---

## ✅ Stable cache behavior

- [ ] No ISR on product detail pages.
- [ ] Listing pages (Home, Collections, Categories) revalidate at set interval (e.g. 60s).
- [ ] Cache-Control and revalidation behavior documented (Phase 9 doc).
- [ ] Optional: Phase 8 diagnostic logging disabled in production (`NEXT_PHASE8_DIAGNOSTIC` not set or 0).

---

## ✅ Clean UI flow

- [ ] Header: single row, no duplicate buttons (Phase 4).
- [ ] Hero: headline, value prop, primary CTA, optional secondary CTA (Phase 4).
- [ ] Global glass token applied to cards, header, filters, modals, side panels (Phase 6).
- [ ] Typography and spacing use design tokens (Phase 2/3).
- [ ] No competing visuals or UI overload.

---

## Quick reference

| Concern           | Phase | Reference |
|------------------|-------|-----------|
| Product visibility | 1, 8 | `RULE.md`, `docs/PHASE8_STABILITY_PROTECTION.md` |
| Layout / overlap | 5     | `docs/PHASE5_PRODUCT_CARD.md` |
| Mobile UX        | 7     | `docs/PHASE7_MOBILE_FIRST_COMMERCE_UX.md` |
| ISR strategy    | 9     | `docs/PHASE9_SAFE_ISR.md` |
| Glass UI         | 6     | `docs/PHASE6_GLASS_UI_SYSTEM.md` |
