# Phase 4 — Header & Hero (Clean & Luxury)

## Header

**Structure (single row, no duplicates):**

`[ Logo ]   [ Shop | New | Collections ]   [ Search ] [ Cart ]`

- **Logo** — Left; links to home.
- **Nav** — Shop (`/collections/all`), New (`/collections/new-arrivals`), Collections (`/collections`). Desktop only; mobile uses hamburger menu.
- **Search** — One icon; opens search overlay (⌘K).
- **Cart** — One icon; opens cart preview. Badge for count.

**Removed:**

- TopBar (second row) — single header row only.
- Duplicate Search (was between logo and nav on desktop + tablet + mobile — now one in right group).
- Account and Theme in main bar — available in mobile menu only.
- MegaMenu — replaced by simple text links Shop | New | Collections.

**Glass:**

- `backdrop-filter: blur(16px)` (and `-webkit-backdrop-filter`).
- Light: `background: rgba(254,253,251,0.82)`; dark: `background: rgba(255,255,255,0.08)`.
- Subtle border: light `border-[rgba(250,247,237,0.5)]`, dark `border-white/10`.

**Mobile:**

- Same row: Logo | Search | Cart | Menu.
- Menu opens MobileNav (full nav, Account, Theme, Search link).

## Hero

**Structure:**

1. **Headline** — “Premium Streetwear for Young Legends”
2. **Short value proposition** — “Elevated style for young legends. Built for adventure, designed for life.”
3. **Primary CTA** — “Shop All” → `/collections/all`
4. **Secondary CTA** — “New Arrivals” → `/collections/new-arrivals`
5. **Hero image** — Full-bleed background with gradient overlay.

**Removed:**

- Extra CTAs (Shop Boys, Shop Girls) — no stacked buttons or UI overload.
- Competing visuals — one headline, one line of copy, two buttons in a row.

**Layout:**

- Single row of two buttons (flex-wrap on small screens).
- Min height: viewport minus header height; content centered.
