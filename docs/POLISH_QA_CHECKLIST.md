# Polish QA Checklist — Elite Production Quality

Final pass to verify layout clarity, design consistency, and premium feel. Use after any UI change.

---

## Phase 1 — Visual Cleanup & Layout Clarity

### Step 1 — No Layout Overlaps
- [ ] Product card: Quick View only inside image container; no overlay on text block
- [ ] Header: no icon collisions; single nav row; clean spacing
- [ ] Hero: no stacked duplicate CTAs; clear hierarchy
- [ ] No floating elements overlapping text blocks
- [ ] No z-index abuse; layout correct by structure

### Step 2 — Product Card Polish
- [ ] Structure: Image (with internal overlay only) → Product Name → Price
- [ ] Quick view button only inside image container
- [ ] No floating overlay on text
- [ ] Clear spacing hierarchy (gap-2/3, p-2/4)
- [ ] Large tap areas (min 44px)
- [ ] Perfect mobile spacing (2-col grid, minimal text on mobile)

---

## Phase 2 — Design System Consistency

### Step 3 — Spacing System
- [ ] Global scale used: 4, 8, 12, 16, 20, 24, 32, 40, 56, 72px (--space-1 … --space-10)
- [ ] No arbitrary margins/paddings; use design tokens or Tailwind scale
- [ ] Section/container use --space-section-* and --space-block/--space-inline

### Step 4 — Typography Hierarchy
- [ ] Heading XL — Hero
- [ ] Heading L — Section titles
- [ ] Heading M — Product names
- [ ] Body — Descriptions
- [ ] Meta — Labels, tags, prices
- [ ] Consistent font sizes and line heights; no arbitrary scaling

---

## Phase 3 — Header & Hero Polish

### Step 5 — Header UX
- [ ] Single row: Logo | Shop | New | Collections | Search | Cart
- [ ] No duplicate buttons or repeated icons
- [ ] Clean spacing; elegant mobile collapse
- [ ] Glass styling (blur 14px, soft border)

### Step 6 — Hero Clarity
- [ ] Headline + value prop + primary CTA + optional secondary CTA + image
- [ ] No duplicate CTAs or text overload
- [ ] Clear spacing hierarchy; mobile scaling correct
- [ ] No visual clutter

---

## Phase 4 — Mobile-First UX

### Step 7 — Mobile Interaction
- [ ] Touch targets ≥ 44px (Quick View, size buttons, modals, sticky add-to-cart)
- [ ] Bottom spacing / safe area for sticky bar and modals
- [ ] Modals as bottom-sheet on mobile
- [ ] Filter UX and cart interactions usable without hover
- [ ] No hover-only critical UI; no micro touch targets

---

## Phase 5 — Glassmorphism Refinement

### Step 8 — Premium Glass
- [ ] Glass token: background rgba(255,255,255,0.06), blur 14px, border rgba(255,255,255,0.10)
- [ ] Soft premium blur — not harsh glow
- [ ] Applied to cards, header, filters, modals, side panels

---

## Phase 6 — Micro-Interactions & Perceived Performance

### Step 9 — Interaction Polish
- [ ] Subtle hover transitions on product cards (desktop: light lift + scale)
- [ ] Soft button feedback (active state)
- [ ] Smooth transitions (0.2–0.3s ease)
- [ ] Skeleton loaders where appropriate
- [ ] Reduced motion respected (no transform on hover when prefers-reduced-motion)

---

## Phase 7 — Final Verification

### Step 10 — Full Audit
- [ ] No overlapping UI
- [ ] Clean mobile flows (2-col grid, bottom-sheet modals, sticky add-to-cart)
- [ ] Clear product hierarchy (image → name → price)
- [ ] No duplicate UI (header, hero, cards)
- [ ] Consistent spacing (design tokens)
- [ ] Smooth, premium interactions
- [ ] Premium feel end-to-end

---

## Quick Reference

| Area | Token / Class |
|------|----------------|
| Spacing | --space-1 … --space-10 (4–72px) |
| Typography | .heading-xl, .heading-l, .heading-m, .body, .meta |
| Glass | .glass (0.06 bg, 14px blur, 0.10 border) |
| Touch | .touch-target-min (44×44px) |
| Product card | .product-card, .product-card-image-wrap, .product-card-info |
