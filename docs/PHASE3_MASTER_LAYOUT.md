# Phase 3 — Master Layout System

## Global Spacing Scale

| Token      | Value |
|-----------|--------|
| `--space-1`  | 4px   |
| `--space-2`  | 8px   |
| `--space-3`  | 12px  |
| `--space-4`  | 16px  |
| `--space-5`  | 20px  |
| `--space-6`  | 24px  |
| `--space-7`  | 32px  |
| `--space-8`  | 40px  |
| `--space-9`  | 56px  |
| `--space-10` | 72px  |

Extended: `--space-11` 80px, `--space-12` 96px, `--space-13` 128px (section/layout compat).

## Typography System

| Token        | Size  |
|-------------|-------|
| `--text-xs`   | 12px |
| `--text-sm`   | 14px |
| `--text-base` | 16px |
| `--text-lg`   | 18px |
| `--text-xl`   | 22px |
| `--text-2xl`  | 28px |
| `--text-3xl`  | 36px |
| `--text-4xl`  | 44px |
| `--text-5xl`  | 56px |

## Font Stack

**Sans (body, UI):** Inter + SF Pro fallback

```css
--font-sans: var(--font-inter), -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif;
```

- **Inter** — Primary (loaded via Next.js font).
- **-apple-system / BlinkMacSystemFont** — System UI font (SF Pro on Apple).
- **SF Pro Text / SF Pro Display** — Explicit SF Pro names where available.
- **system-ui, sans-serif** — Generic fallbacks.

## Usage

- **Spacing:** Use `var(--space-n)` in CSS or Tailwind spacing (e.g. `p-4` = 16px maps to default scale; for Phase 3 values use arbitrary values like `p-[var(--space-5)]` or extend Tailwind).
- **Typography:** Use `var(--text-xs)` … `var(--text-5xl)` in CSS. In Tailwind, use `text-phase-xs` … `text-phase-5xl` for the Phase 3 scale.
- **Body:** `font-family: var(--font-sans)` so the full stack (Inter + SF Pro fallback) applies everywhere.
