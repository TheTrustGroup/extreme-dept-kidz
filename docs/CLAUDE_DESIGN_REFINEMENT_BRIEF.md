# Design Refinement Brief for Claude

**Use this document as the main context when helping with design modifications and refinements. Paste it (and the sections below) into your conversation with Claude.**

---

## Project

- **Name:** Extreme Dept Kidz (EDK)
- **What it is:** E-commerce site for kids’ fashion (Ghana-focused; multi-currency, GHS primary). Next.js 14 App Router, Prisma/PostgreSQL, Supabase, Tailwind, Framer Motion, Zustand, SWR.
- **Live site (please visit and use for proposals):**  
  **https://extremedeptkidz.com**
- **Repo (if you have access):** Local path `EXTREME DEPT KIDZ 1.0` — Next.js app in `app/`, shared UI in `components/`, design tokens and globals in `app/globals.css` and `tailwind.config.ts`.

---

## What I Want From You

- **Not patches:** Prefer a coherent **overhaul or structured refinement** of the experience, not one-off CSS tweaks.
- **Keep the soul:** I like the **current design direction** (luxury, editorial, clean). I want **touches and improvements**, not a full rebrand.
- **Concrete proposals:** After looking at the live site (and codebase if available), propose:
  - **Prioritized list** of visual/UX improvements (with rationale).
  - **Specific changes** (e.g. typography, spacing, components, motion) with file/component names where possible.
  - **Optional:** Short “design principles” or “style rules” we can lock in so future work stays consistent.

---

## Current Design System (Summary)

- **Palette:** Luxury navy (`#0f172a`), cream (`#faf8f5`), gold (`#c9a227`). Tailwind: `luxury-navy`, `luxury-cream`, `luxury-gold` (with scales). Brand tokens: `--brand-bg`, `--brand-primary`, `--brand-secondary`, `--brand-text`.
- **Typography:** Headings: Playfair Display (serif). Body/UI: Inter, Montserrat. Buttons use Playfair, uppercase, letter-spacing.
- **Glass UI:** Glassmorphism used for header, product cards, filters, modals, cart drawer, mobile nav. Token: `.glass` (backdrop blur, light/dark variants). See `docs/PHASE6_GLASS_UI_SYSTEM.md`.
- **Components:** `.btn-primary` (navy fill), `.btn-secondary` (outline). `.glass-card`, `.section-padding`, `.container-luxury`. Product cards: 4:5 image, vertical info stack, minimal overlays (Polo-inspired).
- **Reference docs in repo:**  
  `docs/POLO_INSPIRED_REFINEMENTS.md`, `docs/UX_DESIGN_SYSTEM_IMPROVEMENT_PLAN.md`, `docs/PHASE6_GLASS_UI_SYSTEM.md`.

---

## Key Areas to Consider

1. **Homepage:** Hero, category/collection sections, trust/shipping, footer. Spacing, hierarchy, and “one clear CTA” per section.
2. **Collection & listing:** Filter/sort bar (single “FILTER & SORT” bar?), breadcrumbs, empty states, grid density and gaps.
3. **Product detail (PDP):** Price prominence, size CTA (“SELECT SIZE” / “Add to bag”), sticky add-to-cart, sections (reviews, shipping, share).
4. **Cart & checkout:** Clarity of line items, single primary CTA, step labels (Shipping, Payment, Review).
5. **Global:** Header (back, title, search, cart); bottom nav if any; consistent empty/error states; touch targets (e.g. 44px); typography hierarchy (weight/size) site-wide.
6. **Admin (optional):** Design tokens and component consistency (see `docs/UX_DESIGN_SYSTEM_IMPROVEMENT_PLAN.md`); can be a later phase.

---

## Important File Paths (for implementation)

| Area            | Paths |
|-----------------|--------|
| Global styles   | `app/globals.css`, `tailwind.config.ts` |
| Layout / chrome | `components/layout/Header.tsx`, `Footer.tsx`, `MobileNav.tsx`, `TopBar.tsx` |
| Home            | `app/page.tsx`, `components/home/*` (HeroSection, etc.) |
| Collections     | `app/collections/page.tsx`, `app/collections/[slug]/CollectionPageClient.tsx`, FilterSidebar, ProductToolbar |
| Product (PDP)   | `app/products/[slug]/ProductPageClient.tsx`, `ProductInfo.tsx`, `StickyAddToCart.tsx` |
| Cart / checkout | `app/cart/`, `components/cart/*`, `app/checkout/*`, `components/checkout/*` |
| UI primitives   | `components/ui/*` (floating-input, button, etc.) |
| Glass / cards   | `.glass`, `.glass-card`, `.product-card` in `app/globals.css` |

---

## Website URL Again (for visiting and proposing)

**https://extremedeptkidz.com**

Please visit the site, navigate through home, a collection, a product, cart, and checkout (or as far as you can), then propose a clear set of refinements or an overhaul plan that keeps the current luxury/editorial feel while improving clarity, consistency, and polish.
