# Phase 6 — Glassmorphism UI System

## Global Glass Token

Single token used across Cards, Header, Filters, Modals, and Side panels:

```css
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
}
```

## CSS Variables (tokens.css)

| Variable | Value | Purpose |
|----------|--------|---------|
| `--glass-bg` | `rgba(255, 255, 255, 0.08)` | Default/dark glass background |
| `--glass-blur-global` | `14px` | Backdrop blur |
| `--glass-border-global` | `rgba(255, 255, 255, 0.12)` | Border color |
| `--glass-radius-global` | `16px` | Border radius |
| `--glass-bg-light-mode` | `rgba(254, 253, 251, 0.75)` | Light theme background |
| `--glass-border-light-mode` | `rgba(250, 247, 237, 0.6)` | Light theme border |

## Where `.glass` Is Used

- **Cards** — `.product-card` uses the token (background, blur, border, radius) in globals.css.
- **Header** — `Header.tsx` applies class `glass`; `.header` in globals uses the same token.
- **Filters** — `FilterSidebar.tsx`: desktop panel and mobile drawer use `glass`.
- **Modals** — `QuickViewModal`, `CompleteTheLookSizeModal`, `CustomizeLookModal`, `SignInModal`, `CreateAccountModal`: content wrapper uses `glass`.
- **Side panels** — `CartDrawer`, `MobileNav`, `SearchOverlay`: panel/content uses `glass`.

## Light / Dark

- **Light theme** (`[data-theme="light"]` / `.light`): `.glass` uses `--glass-bg-light-mode` and `--glass-border-light-mode` so it stays visible on light backgrounds.
- **Dark theme**: `.glass` uses `--glass-bg` and `--glass-border-global`.

## Reduced Motion

When `prefers-reduced-motion: reduce`, `.glass` has `backdrop-filter: none` and falls back to solid(ish) backgrounds so motion-sensitive users don’t get blur.
