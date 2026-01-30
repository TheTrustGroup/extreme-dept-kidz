# Phase 2 — Ultra Modern Glassmorphism Design System

## Design Vision

**Visual feel:** Ultra modern · Soft glassmorphism · Subtle blur · Premium fashion brand · Calm spacing · Clean typography · Minimal noise

**Inspiration:** Apple × Gentle Monster × Off-White × Arc'teryx

## Design Principles

- **Mobile-first** — Layout and spacing scale from small screens up
- **Zero overlap** — No stacked or competing elements
- **Zero clutter** — Only essential UI; remove decorative noise
- **Visual breathing room** — Generous section and block spacing
- **Strong hierarchy** — Clear typographic and spatial order
- **Precise spacing** — 8px base rhythm; intentional padding/margins
- **Intentional layout** — Every space has a purpose

## Tokens (Phase 2)

### Glass

- `--glass-soft-bg` / `--glass-soft-bg-strong` — Soft translucent backgrounds
- `--glass-soft-border` — Subtle border (50% opacity)
- `--glass-soft-blur` (16px) / `--glass-soft-blur-strong` (24px)
- `--glass-soft-shadow` / `--glass-soft-shadow-elevated` — Soft depth

### Spacing (breathing room)

- `--space-section-mobile` 64px · `--space-section-tablet` 80px · `--space-section-desktop` 96px · `--space-section-hero` 112px
- `--space-block` 24px (between content blocks)
- `--space-inline` 16px (horizontal rhythm)

### Radius (minimal noise)

- `--radius-glass` 20px · `--radius-glass-lg` 24px
- `--radius-card` 16px · `--radius-card-lg` 20px

## Utilities

- **`.glass-panel`** / **`.glass-panel-strong`** / **`.glass-card`** / **`.glass`** — Soft blur, rounded corners, subtle border
- **`.section`** — Responsive section padding (section-mobile → section-desktop)
- **`.section-hero`** — Extra breathing room for hero sections
- **`.header`** — Sticky header with soft glass
- **`.product-card`** — Card with Phase 2 glass and calm content spacing

## Tailwind

- **Spacing:** `section-mobile`, `section-tablet`, `section-desktop`, `section-hero`, `block`, `inline`
- **Shadows:** Softer opacity; `glass`, `glass-lg` use CSS variables
- **Border radius:** `md`/`lg`/`xl` map to Phase 2 radius tokens
- **Backdrop blur:** `md` 16px, `lg` 24px

## Container

- Mobile: `--space-inline` (16px)
- Tablet: `--space-block` (24px)
- Desktop: 32px (`px-8`)
- Max-width: 1280px (lg)
