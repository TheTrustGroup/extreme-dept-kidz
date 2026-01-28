# Premium Color Palette & Typography System  
**Extreme Dept Kidz — Design System Proposal**

Luxurious, modern, and warm for a premium kids fashion brand. Use these tokens and guidelines for consistent, emotionally engaging UI.

---

## 1. Color Palette

### 1.1 Neutrals — Warm foundations

**Cream** (backgrounds, surfaces, soft contrast)  
Use for pages, cards, and panels. Keeps the product and imagery as focus.

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-cream-50` | `#fefdfb` | Page background, lightest surface |
| `--color-cream-100` | `#fdfbf6` | Cards, sections, raised surfaces |
| `--color-cream-200` | `#faf7ed` | Borders, dividers, subtle rules |
| `--color-cream-300` | `#f5f0e0` | Disabled, placeholders |
| `--color-cream-400` | `#ede5d0` | Hover backgrounds, inputs |
| `--color-cream-500` | `#e0d5b8` | Decorative only (sparingly) |
| `--color-cream-600–900` | (see globals) | Rare; reserved for dark-on-cream accents |

**Charcoal** (text, icons, borders)  
Use for all primary and secondary text. Warm gray, never harsh black.

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-charcoal-950` | `#1a1a1a` | Primary headings, key labels |
| `--color-charcoal-900` | `#3d3d3d` | Body text (default) |
| `--color-charcoal-700` | `#4f4f4f` | Secondary text |
| `--color-charcoal-600` | `#5d5d5d` | Captions, metadata |
| `--color-charcoal-500` | `#6d6d6d` | Placeholders, disabled |
| `--color-charcoal-400–200` | (see globals) | Borders, dividers, icons |

---

### 1.2 Primary accent — Authority & trust

**Navy** (CTAs, links, navigation, trust elements)  
Keeps the brand premium and confident without feeling cold.

| Token | Usage |
|-------|--------|
| `--color-navy-900` | Primary buttons, active nav, key links |
| `--color-navy-800` | Hover states for primary actions |
| `--color-navy-700` | Focus rings, active states |
| `--color-navy-600` | Secondary buttons, outlines |
| `--color-navy-100–50` | Soft backgrounds (badges, tags) |

---

### 1.3 Warm accents — Friendly & premium

Use for highlights, badges, success, and “warm” moments. Keep saturation low so it stays luxury, not toy-like.

**Honey** (highlights, badges, “new” / “sale”)  
Soft amber that reads warm but still premium.

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-honey-50` | `#fefaf3` | Very subtle backgrounds |
| `--color-honey-100` | `#fdf3e3` | Badge backgrounds, “New” tags |
| `--color-honey-200` | `#f9e6c8` | Hover on honey accents |
| `--color-honey-500` | `#c9a227` | “Sale,” “Limited,” small accents |
| `--color-honey-600` | `#a8841f` | Honey text on cream, hover |

**Blush** (soft warmth, trust, “heart-friendly”)  
Use for trust bars, soft highlights, and emotional moments.

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-blush-50` | `#fdf8f6` | Soft section backgrounds |
| `--color-blush-100` | `#f9ede8` | Trust bar, testimonials |
| `--color-blush-200` | `#f0ddd5` | Borders, dividers in warm sections |

**Sage** (success, positive actions, calm)  
Muted green for confirmation and positive feedback.

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-sage-50` | `#f4f7f4` | Success backgrounds |
| `--color-sage-500` | `#5a7d5a` | Success text, checkmarks |
| `--color-sage-600` | `#4a6b4a` | Success buttons (optional) |

---

### 1.4 Usage guidelines — Color

- **Backgrounds:** Prefer cream-50 (page), cream-100 (cards). Use cream-200+ only for subtle contrast.
- **Text:** charcoal-900 body, charcoal-950 headings. charcoal-600/700 for secondary.
- **Primary actions:** navy-900 with navy-800 hover. Reserve for one main CTA per screen.
- **Warm accents:** Honey for “New,” “Sale,” limited runs. Blush for trust, care, softer sections. Sage for success and positive states.
- **Contrast:** Keep WCAG AA (4.5:1 for body, 3:1 for large text). charcoal-900 on cream-50 and navy-900 on cream-50 are compliant.
- **Do not:** Use pure black (`#000`) or cold grays. Avoid neon or loud accent saturation.

---

## 2. Typography System

### 2.1 Font families

| Role | CSS Variable | Font | Use for |
|------|----------------|------|---------|
| **Display / editorial** | `--font-serif` | Playfair Display | Hero headlines, section titles, product names, editorial quotes |
| **UI / body** | `--font-sans` | Inter | Body copy, labels, buttons, navigation, forms, captions |

**Rationale:**  
- **Playfair** — Serif, editorial, premium. Suits “Premium Streetwear for Young Legends” and collection names.  
- **Inter** — Neutral, readable, modern. Supports accessibility and clarity in UI.

---

### 2.2 Type scale (modular, 1.25 ratio)

| Token | Size | Line height | Letter spacing | Use for |
|-------|------|--------------|---------------|---------|
| `--text-caption` | 0.75rem (12px) | 1.4 | 0.02em | Captions, labels, overlines, “NEW” / “SALE” |
| `--text-small` | 0.875rem (14px) | 1.5 | 0.01em | Secondary body, nav links, list items |
| `--text-body` | 1rem (16px) | 1.6 | 0 | Body copy (default) |
| `--text-lead` | 1.125rem (18px) | 1.55 | 0 | Lead paragraphs, intro text |
| `--text-h4` | 1.25rem (20px) | 1.4 | -0.01em | Card titles, small headings |
| `--text-h3` | 1.5rem (24px) | 1.35 | -0.01em | Section subheads |
| `--text-h2` | 1.875rem (30px) | 1.3 | -0.01em | Section titles |
| `--text-h1` | 2.25rem (36px) | 1.25 | -0.02em | Page titles |
| `--text-display-sm` | 3rem (48px) | 1.2 | -0.02em | Hero support line |
| `--text-display` | 3.75rem (60px) | 1.1 | -0.02em | Hero headline (tablet) |
| `--text-display-lg` | 4.5rem (72px) | 1.08 | -0.02em | Hero headline (desktop) |

---

### 2.3 Font weights (semantic)

| Token | Value | Use for |
|-------|--------|---------|
| `--font-weight-light` | 300 | Rare; large serif pullquotes only |
| `--font-weight-normal` | 400 | Body, paragraphs |
| `--font-weight-medium` | 500 | Emphasized body, product names (sans) |
| `--font-weight-semibold` | 600 | Labels, nav, buttons, small headings |
| `--font-weight-bold` | 700 | Headings (H1–H4), hero, CTAs |

**Guidelines:**  
- Headlines: serif + bold (or semibold for smaller headings).  
- Body: sans + normal. Use medium for light emphasis.  
- UI (buttons, nav, labels): sans + semibold.  
- Captions / overlines: sans + medium or semibold, often uppercase with tracking.

---

### 2.4 Usage guidelines — Typography

- **Hero:** Serif, display size, bold. One clear line (e.g. “Premium Streetwear for Young Legends”). Support line one step down, serif or sans, lead or h2 size.
- **Section titles:** Serif, h2 or h1 size, bold. “JUST DROPPED,” “COLLECTIONS,” etc.
- **Product names:** Serif, h4 or lead, medium. Keeps a premium, editorial feel.
- **Prices:** Sans, semibold or bold, h4 or lead size. Same treatment across cards and PDP.
- **Body:** Sans, body or lead, normal. Line length 45–75 characters where possible.
- **Buttons / nav:** Sans, small or body, semibold, uppercase + tracking for primary nav/CTA.
- **Captions / labels:** Sans, caption or small, medium/semibold. Use sparingly so hierarchy stays clear.

---

## 3. CSS Variables Summary

These variables are defined in `app/globals.css` and can be used in any component or Tailwind theme.

### 3.1 Color variables (add to `:root`)

```css
/* Neutrals — already present (cream, charcoal) */

/* Warm accents — add */
--color-honey-50: #fefaf3;
--color-honey-100: #fdf3e3;
--color-honey-200: #f9e6c8;
--color-honey-300: #f0d4a8;
--color-honey-400: #e0b87a;
--color-honey-500: #c9a227;
--color-honey-600: #a8841f;

--color-blush-50: #fdf8f6;
--color-blush-100: #f9ede8;
--color-blush-200: #f0ddd5;
--color-blush-300: #e4c9be;

--color-sage-50: #f4f7f4;
--color-sage-100: #e6ede6;
--color-sage-500: #5a7d5a;
--color-sage-600: #4a6b4a;
```

### 3.2 Typography variables (add to `:root`)

```css
/* Font families — map to existing */
--font-serif: var(--font-playfair), Georgia, serif;
--font-sans: var(--font-inter), system-ui, sans-serif;

/* Scale (size / line-height / letter-spacing) */
--text-caption: 0.75rem;
--text-caption-lh: 1.4;
--text-caption-ls: 0.02em;

--text-small: 0.875rem;
--text-small-lh: 1.5;
--text-small-ls: 0.01em;

--text-body: 1rem;
--text-body-lh: 1.6;
--text-body-ls: 0;

--text-lead: 1.125rem;
--text-lead-lh: 1.55;
--text-lead-ls: 0;

--text-h4: 1.25rem;
--text-h4-lh: 1.4;
--text-h4-ls: -0.01em;

--text-h3: 1.5rem;
--text-h3-lh: 1.35;
--text-h3-ls: -0.01em;

--text-h2: 1.875rem;
--text-h2-lh: 1.3;
--text-h2-ls: -0.01em;

--text-h1: 2.25rem;
--text-h1-lh: 1.25;
--text-h1-ls: -0.02em;

--text-display-sm: 3rem;
--text-display-sm-lh: 1.2;
--text-display-sm-ls: -0.02em;

--text-display: 3.75rem;
--text-display-lh: 1.1;
--text-display-ls: -0.02em;

--text-display-lg: 4.5rem;
--text-display-lg-lh: 1.08;
--text-display-lg-ls: -0.02em;

/* Weights */
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 3.3 Example usage in CSS

```css
.hero-headline {
  font-family: var(--font-serif);
  font-size: var(--text-display-lg);
  line-height: var(--text-display-lg-lh);
  letter-spacing: var(--text-display-lg-ls);
  font-weight: var(--font-weight-bold);
  color: var(--color-cream-50);
}

.product-name {
  font-family: var(--font-serif);
  font-size: var(--text-h4);
  line-height: var(--text-h4-lh);
  font-weight: var(--font-weight-medium);
  color: var(--color-charcoal-900);
}

.badge-new {
  font-family: var(--font-sans);
  font-size: var(--text-caption);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--text-caption-ls);
  text-transform: uppercase;
  background: var(--color-honey-100);
  color: var(--color-honey-600);
}
```

---

## 4. Tailwind alignment

Extend `tailwind.config.ts` so utility classes match this system:

- **Colors:** Add `honey`, `blush`, `sage` to `theme.extend.colors` using the same hex values as above.
- **Fonts:** Keep `font-serif` → Playfair, `font-sans` → Inter.
- **Font size:** Map `text-caption` … `text-display-lg` to `theme.extend.fontSize` with `[size, { lineHeight, letterSpacing }]`.
- **Font weight:** Use existing weights; ensure `font-light` (300) through `font-bold` (700) are available.

---

## 5. Quick reference

| Need | Use |
|------|-----|
| Page background | cream-50 |
| Card / panel | cream-100, optional glass |
| Body text | charcoal-900, sans, body |
| Headlines | charcoal-950 or cream-50 on dark, serif, bold |
| Primary button | navy-900, cream-50 text, sans semibold |
| “New” / “Sale” badge | honey-100 bg, honey-600 text |
| Trust / soft sections | blush-50 or blush-100 |
| Success | sage-500 text or sage-50 bg |
| Captions | charcoal-600, sans, caption, medium/semibold |

This palette and type system keep the brand **luxurious** (serif, cream, navy), **modern** (Inter, clear hierarchy, spacing), and **friendly** (honey, blush, sage) for a premium kids fashion audience.
