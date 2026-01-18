# Extreme Dept Kidz Design System
## Lightweight Design Tokens for Figma & Code

**Version:** 1.0  
**Purpose:** Unified design system for Extreme Dept Kidz - usable in Figma and code  
**Base Unit:** 8px

---

## 📐 SPACING SYSTEM

### Base Unit: 8px

All spacing values are multiples of 8px for consistency.

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `space-xs` | 0.5rem | 8px | Tight spacing, icon padding |
| `space-sm` | 1rem | 16px | Standard padding, small gaps |
| `space-md` | 1.5rem | 24px | Medium padding, card padding |
| `space-lg` | 2rem | 32px | Large padding, section spacing |
| `space-xl` | 3rem | 48px | Extra large spacing |
| `space-2xl` | 4rem | 64px | Section spacing (medium) |
| `space-3xl` | 6rem | 96px | Large section spacing |
| `space-4xl` | 8rem | 128px | Extra large section spacing |

### CSS Variables
```css
--spacing-xs: 0.5rem;    /* 8px */
--spacing-sm: 1rem;      /* 16px */
--spacing-md: 1.5rem;    /* 24px */
--spacing-lg: 2rem;      /* 32px */
--spacing-xl: 3rem;      /* 48px */
--spacing-2xl: 4rem;     /* 64px */
--spacing-3xl: 6rem;     /* 96px */
--spacing-4xl: 8rem;     /* 128px */
```

### Tailwind Classes
```css
space-y-xs, space-y-sm, space-y-md, space-y-lg, space-y-xl
p-xs, p-sm, p-md, p-lg, p-xl
gap-xs, gap-sm, gap-md, gap-lg, gap-xl
```

### Figma Usage
- Use 8px, 16px, 24px, 32px, 48px, 64px, 96px, 128px
- Set as constraints in auto-layout
- Create spacing styles in Figma

---

## 🎨 COLOR PALETTE

### Primary Colors

#### Navy (Primary Accent)
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `navy-50` | `#f0f4f8` | rgb(240, 244, 248) | Light backgrounds |
| `navy-100` | `#d9e2ec` | rgb(217, 226, 236) | Subtle backgrounds |
| `navy-200` | `#bcccdc` | rgb(188, 204, 220) | Borders, dividers |
| `navy-500` | `#627d98` | rgb(98, 125, 152) | Secondary actions |
| `navy-600` | `#486581` | rgb(72, 101, 129) | Hover states |
| `navy-700` | `#334e68` | rgb(51, 78, 104) | Active states |
| `navy-800` | `#243b53` | rgb(36, 59, 83) | Hover (primary) |
| `navy-900` | `#102a43` | rgb(16, 42, 67) | **Primary CTA, links, emphasized text** |
| `navy-950` | `#0a1a2a` | rgb(10, 26, 42) | Active (primary) |

**Primary Usage:** CTAs, links, emphasized navigation, buttons

### Secondary Colors

#### Forest (Secondary Accent)
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `forest-50` | `#f0f9f4` | rgb(240, 249, 244) | Light backgrounds |
| `forest-100` | `#dcf2e3` | rgb(220, 242, 227) | Subtle backgrounds |
| `forest-500` | `#369a5a` | rgb(54, 154, 90) | Secondary actions |
| `forest-600` | `#277d47` | rgb(39, 125, 71) | **Secondary CTA, badges** |
| `forest-700` | `#21643a` | rgb(33, 100, 58) | Hover (secondary) |
| `forest-800` | `#1d5030` | rgb(29, 80, 48) | Active (secondary) |

**Secondary Usage:** Alternative CTAs, success states, featured badges

### Neutral Colors

#### Cream (Light Neutrals)
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `cream-50` | `#fefdfb` | rgb(254, 253, 251) | **Primary background** |
| `cream-100` | `#fdfbf6` | rgb(253, 251, 246) | Card backgrounds, subtle backgrounds |
| `cream-200` | `#faf7ed` | rgb(250, 247, 237) | Borders, dividers, hover states |
| `cream-300` | `#f5f0e0` | rgb(245, 240, 224) | Subtle backgrounds |
| `cream-400` | `#ede5d0` | rgb(237, 229, 208) | Disabled states |

**Usage:** Backgrounds, cards, light text on dark backgrounds

#### Charcoal (Dark Neutrals)
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `charcoal-50` | `#f6f6f6` | rgb(246, 246, 246) | Light backgrounds |
| `charcoal-100` | `#e7e7e7` | rgb(231, 231, 231) | Subtle backgrounds |
| `charcoal-200` | `#d1d1d1` | rgb(209, 209, 209) | Borders, dividers |
| `charcoal-300` | `#b0b0b0` | rgb(176, 176, 176) | Placeholders |
| `charcoal-400` | `#888888` | rgb(136, 136, 136) | Disabled text |
| `charcoal-500` | `#6d6d6d` | rgb(109, 109, 109) | Secondary text, strikethrough |
| `charcoal-600` | `#5d5d5d` | rgb(93, 93, 93) | Labels, captions |
| `charcoal-700` | `#4f4f4f` | rgb(79, 79, 79) | **Body text** |
| `charcoal-800` | `#454545` | rgb(69, 69, 69) | Hover text |
| `charcoal-900` | `#3d3d3d` | rgb(61, 61, 61) | **Headings, primary text** |
| `charcoal-950` | `#1a1a1a` | rgb(26, 26, 26) | Dark backgrounds, overlays |

**Usage:** Text, headings, dark backgrounds

### Semantic Colors

#### Status Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#277d47` | Success states (uses forest-600) |
| `error` | `#dc2626` | Error states, validation |
| `warning` | `#d97706` | Warning states |
| `info` | `#2563eb` | Information states |

### CSS Variables
```css
/* Primary */
--color-navy-900: #102a43;
--color-navy-800: #243b53;
--color-navy-700: #334e68;

/* Secondary */
--color-forest-600: #277d47;
--color-forest-700: #21643a;

/* Neutrals - Cream */
--color-cream-50: #fefdfb;
--color-cream-100: #fdfbf6;
--color-cream-200: #faf7ed;

/* Neutrals - Charcoal */
--color-charcoal-900: #3d3d3d;
--color-charcoal-700: #4f4f4f;
--color-charcoal-600: #5d5d5d;
--color-charcoal-500: #6d6d6d;
```

### Tailwind Classes
```css
bg-navy-900, text-navy-900, border-navy-900
bg-forest-600, text-forest-600
bg-cream-50, text-cream-50
bg-charcoal-900, text-charcoal-900
```

### Figma Usage
- Create color styles for each token
- Use hex values directly
- Organize by category (Primary, Secondary, Neutrals)

---

## ✍️ TYPOGRAPHY SCALE

### Font Families

| Token | Font | Usage |
|-------|------|-------|
| `font-serif` | Playfair Display | Headings, product names, brand elements |
| `font-sans` | Inter | Body text, UI elements, buttons |

### Heading Scale

#### H1 (Hero Headline)
- **Font:** Playfair Display (Serif)
- **Size:** 72px (Desktop) / 48px (Tablet) / 36px (Mobile)
- **Weight:** Bold (700)
- **Line Height:** 1.1 (tight)
- **Letter Spacing:** -0.02em
- **Color:** `charcoal-900` (light backgrounds) / `cream-50` (dark backgrounds)
- **Usage:** Hero section main headline only

**CSS:**
```css
font-family: var(--font-playfair), serif;
font-size: 4.5rem; /* 72px */
font-weight: 700;
line-height: 1.1;
letter-spacing: -0.02em;
```

**Tailwind:**
```css
font-serif text-[72px] font-bold leading-[1.1] tracking-tight
```

**Figma:**
- Create text style: "H1 - Hero"
- Font: Playfair Display, 72px, Bold

---

#### H2 (Section Headings)
- **Font:** Playfair Display (Serif)
- **Size:** 48px (Desktop) / 36px (Tablet) / 28px (Mobile)
- **Weight:** Bold (700)
- **Line Height:** 1.2
- **Letter Spacing:** -0.01em
- **Color:** `charcoal-900`
- **Usage:** Major section titles ("JUST DROPPED", "Shop by Style")

**CSS:**
```css
font-family: var(--font-playfair), serif;
font-size: 3rem; /* 48px */
font-weight: 700;
line-height: 1.2;
letter-spacing: -0.01em;
```

**Tailwind:**
```css
font-serif text-[48px] font-bold leading-[1.2]
```

**Figma:**
- Create text style: "H2 - Section"
- Font: Playfair Display, 48px, Bold

---

#### H3 (Subsection Headings)
- **Font:** Playfair Display (Serif)
- **Size:** 32px (Desktop) / 24px (Tablet) / 20px (Mobile)
- **Weight:** Semibold (600)
- **Line Height:** 1.3
- **Letter Spacing:** 0
- **Color:** `charcoal-900`
- **Usage:** Collection names, product category titles

**CSS:**
```css
font-family: var(--font-playfair), serif;
font-size: 2rem; /* 32px */
font-weight: 600;
line-height: 1.3;
letter-spacing: 0;
```

**Tailwind:**
```css
font-serif text-[32px] font-semibold leading-[1.3]
```

**Figma:**
- Create text style: "H3 - Subsection"
- Font: Playfair Display, 32px, Semibold

---

#### H4 (Card Titles)
- **Font:** Playfair Display (Serif)
- **Size:** 20px (Desktop) / 18px (Tablet) / 16px (Mobile)
- **Weight:** Medium (500)
- **Line Height:** 1.4
- **Letter Spacing:** 0
- **Color:** `charcoal-900`
- **Usage:** Product names, collection card titles

**CSS:**
```css
font-family: var(--font-playfair), serif;
font-size: 1.25rem; /* 20px */
font-weight: 500;
line-height: 1.4;
letter-spacing: 0;
```

**Tailwind:**
```css
font-serif text-xl font-medium leading-[1.4]
```

**Figma:**
- Create text style: "H4 - Card Title"
- Font: Playfair Display, 20px, Medium

---

#### H5 (Small Headings)
- **Font:** Inter (Sans-serif)
- **Size:** 18px (Desktop) / 16px (Mobile)
- **Weight:** Semibold (600)
- **Line Height:** 1.4
- **Letter Spacing:** 0
- **Color:** `charcoal-900`
- **Usage:** Small section headings, form labels

**CSS:**
```css
font-family: var(--font-inter), sans-serif;
font-size: 1.125rem; /* 18px */
font-weight: 600;
line-height: 1.4;
letter-spacing: 0;
```

**Tailwind:**
```css
font-sans text-lg font-semibold leading-[1.4]
```

**Figma:**
- Create text style: "H5 - Small Heading"
- Font: Inter, 18px, Semibold

---

#### H6 (Tiny Headings)
- **Font:** Inter (Sans-serif)
- **Size:** 16px
- **Weight:** Semibold (600)
- **Line Height:** 1.4
- **Letter Spacing:** 0.5px
- **Color:** `charcoal-900`
- **Usage:** Micro headings, navigation items

**CSS:**
```css
font-family: var(--font-inter), sans-serif;
font-size: 1rem; /* 16px */
font-weight: 600;
line-height: 1.4;
letter-spacing: 0.5px;
```

**Tailwind:**
```css
font-sans text-base font-semibold leading-[1.4] tracking-wide
```

**Figma:**
- Create text style: "H6 - Tiny Heading"
- Font: Inter, 16px, Semibold

---

### Body Text

#### Body Large (Hero Subheadline)
- **Font:** Inter (Sans-serif)
- **Size:** 24px (Desktop) / 20px (Tablet) / 18px (Mobile)
- **Weight:** Regular (400)
- **Line Height:** 1.6 (relaxed)
- **Letter Spacing:** 0
- **Color:** `charcoal-700` (light backgrounds) / `cream-100` (dark backgrounds)
- **Usage:** Hero subheadline, important descriptions

**CSS:**
```css
font-family: var(--font-inter), sans-serif;
font-size: 1.5rem; /* 24px */
font-weight: 400;
line-height: 1.6;
letter-spacing: 0;
```

**Tailwind:**
```css
font-sans text-2xl leading-relaxed
```

**Figma:**
- Create text style: "Body Large"
- Font: Inter, 24px, Regular

---

#### Body (Standard)
- **Font:** Inter (Sans-serif)
- **Size:** 16px (Desktop & Mobile)
- **Weight:** Regular (400)
- **Line Height:** 1.625 (relaxed)
- **Letter Spacing:** 0
- **Color:** `charcoal-700`
- **Usage:** General body text, product descriptions

**CSS:**
```css
font-family: var(--font-inter), sans-serif;
font-size: 1rem; /* 16px */
font-weight: 400;
line-height: 1.625;
letter-spacing: 0;
```

**Tailwind:**
```css
font-sans text-base leading-relaxed
```

**Figma:**
- Create text style: "Body"
- Font: Inter, 16px, Regular

---

#### Body Small (Supporting Text)
- **Font:** Inter (Sans-serif)
- **Size:** 14px
- **Weight:** Regular (400)
- **Line Height:** 1.5
- **Letter Spacing:** 0
- **Color:** `charcoal-600`
- **Usage:** Captions, metadata, secondary information

**CSS:**
```css
font-family: var(--font-inter), sans-serif;
font-size: 0.875rem; /* 14px */
font-weight: 400;
line-height: 1.5;
letter-spacing: 0;
```

**Tailwind:**
```css
font-sans text-sm leading-normal
```

**Figma:**
- Create text style: "Body Small"
- Font: Inter, 14px, Regular

---

### Button Text

#### Button Text (Primary/Secondary)
- **Font:** Inter (Sans-serif)
- **Size:** 16px (Desktop) / 14px (Mobile)
- **Weight:** Semibold (600)
- **Line Height:** 1.2
- **Letter Spacing:** 0.5px
- **Text Transform:** Uppercase
- **Color:** `cream-50` (on dark) / `charcoal-900` (on light)

**CSS:**
```css
font-family: var(--font-inter), sans-serif;
font-size: 1rem; /* 16px */
font-weight: 600;
line-height: 1.2;
letter-spacing: 0.5px;
text-transform: uppercase;
```

**Tailwind:**
```css
font-sans text-base font-semibold leading-tight tracking-wide uppercase
```

**Figma:**
- Create text style: "Button Text"
- Font: Inter, 16px, Semibold, Uppercase

---

#### Label/Caption
- **Font:** Inter (Sans-serif)
- **Size:** 12px
- **Weight:** Medium (500)
- **Line Height:** 1.4
- **Letter Spacing:** 1px
- **Text Transform:** Uppercase
- **Color:** `charcoal-600`

**CSS:**
```css
font-family: var(--font-inter), sans-serif;
font-size: 0.75rem; /* 12px */
font-weight: 500;
line-height: 1.4;
letter-spacing: 1px;
text-transform: uppercase;
```

**Tailwind:**
```css
font-sans text-xs font-medium leading-normal tracking-widest uppercase
```

**Figma:**
- Create text style: "Label"
- Font: Inter, 12px, Medium, Uppercase

---

## 🔘 BUTTON STYLES

### Primary Button

#### Default State
- **Background:** `navy-900` (#102a43)
- **Text:** `cream-50` (#fefdfb)
- **Border:** None
- **Border Radius:** 8px
- **Padding:** 16px 32px (vertical, horizontal)
- **Min Height:** 48px (44px mobile)
- **Font:** Inter, 16px, Semibold, Uppercase
- **Shadow:** None

**CSS:**
```css
background-color: var(--color-navy-900);
color: var(--color-cream-50);
border: none;
border-radius: 8px;
padding: 16px 32px;
min-height: 48px;
font-family: var(--font-inter), sans-serif;
font-size: 1rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.5px;
```

**Tailwind:**
```css
bg-navy-900 text-cream-50 rounded-lg px-8 py-4 min-h-[48px] font-sans text-base font-semibold uppercase tracking-wide
```

**Figma:**
- Background: Navy 900
- Text: Cream 50, Inter, 16px, Semibold, Uppercase
- Border Radius: 8px
- Padding: 16px 32px

---

#### Hover State
- **Background:** `navy-800` (#243b53)
- **Transform:** Scale 1.02
- **Shadow:** 0 4px 12px rgba(16, 42, 67, 0.3)
- **Transition:** 200ms ease-in-out

**CSS:**
```css
background-color: var(--color-navy-800);
transform: scale(1.02);
box-shadow: 0 4px 12px rgba(16, 42, 67, 0.3);
transition: all 200ms ease-in-out;
```

**Tailwind:**
```css
hover:bg-navy-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-200
```

**Figma:**
- Create hover variant
- Background: Navy 800
- Add shadow effect

---

#### Active State
- **Background:** `navy-950` (#0a1a2a)
- **Transform:** Scale 0.98
- **Transition:** 100ms ease-in-out

**CSS:**
```css
background-color: var(--color-navy-950);
transform: scale(0.98);
transition: all 100ms ease-in-out;
```

**Tailwind:**
```css
active:bg-navy-950 active:scale-[0.98]
```

**Figma:**
- Create active variant
- Background: Navy 950

---

#### Disabled State
- **Background:** `charcoal-200` (#d1d1d1)
- **Text:** `charcoal-400` (#888888)
- **Opacity:** 0.5
- **Cursor:** not-allowed

**CSS:**
```css
background-color: var(--color-charcoal-200);
color: var(--color-charcoal-400);
opacity: 0.5;
cursor: not-allowed;
pointer-events: none;
```

**Tailwind:**
```css
disabled:bg-charcoal-200 disabled:text-charcoal-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
```

**Figma:**
- Create disabled variant
- Background: Charcoal 200
- Text: Charcoal 400
- Opacity: 50%

---

### Secondary Button

#### Default State
- **Background:** Transparent
- **Border:** 2px solid `navy-900`
- **Text:** `navy-900`
- **Border Radius:** 8px
- **Padding:** 16px 32px
- **Min Height:** 48px

**CSS:**
```css
background-color: transparent;
border: 2px solid var(--color-navy-900);
color: var(--color-navy-900);
border-radius: 8px;
padding: 16px 32px;
min-height: 48px;
```

**Tailwind:**
```css
bg-transparent border-2 border-navy-900 text-navy-900 rounded-lg px-8 py-4 min-h-[48px]
```

**Figma:**
- Background: Transparent
- Border: 2px, Navy 900
- Text: Navy 900

---

#### Hover State
- **Background:** `navy-900`
- **Text:** `cream-50`
- **Transform:** Scale 1.02

**CSS:**
```css
background-color: var(--color-navy-900);
color: var(--color-cream-50);
transform: scale(1.02);
```

**Tailwind:**
```css
hover:bg-navy-900 hover:text-cream-50 hover:scale-[1.02]
```

---

### Ghost Button

#### Default State
- **Background:** Transparent
- **Text:** `charcoal-900`
- **Border:** None
- **Padding:** 12px 24px
- **Min Height:** 44px

**CSS:**
```css
background-color: transparent;
color: var(--color-charcoal-900);
border: none;
padding: 12px 24px;
min-height: 44px;
```

**Tailwind:**
```css
bg-transparent text-charcoal-900 px-6 py-3 min-h-[44px]
```

---

#### Hover State
- **Background:** `cream-200`
- **Text:** `charcoal-900`

**CSS:**
```css
background-color: var(--color-cream-200);
color: var(--color-charcoal-900);
```

**Tailwind:**
```css
hover:bg-cream-200
```

---

### Button Sizes

| Size | Height | Padding | Font Size | Usage |
|------|--------|---------|-----------|-------|
| Small | 40px | 12px 20px | 14px | Compact spaces |
| Medium | 48px | 16px 32px | 16px | Standard buttons |
| Large | 56px | 20px 40px | 18px | Prominent CTAs |

---

## 📝 FORM ELEMENTS

### Text Input

#### Default State
- **Background:** `cream-50` (#fefdfb) or `white`
- **Border:** 1px solid `cream-200` (#faf7ed)
- **Border Radius:** 8px
- **Padding:** 12px 16px
- **Font:** Inter, 16px, Regular
- **Color:** `charcoal-900`
- **Min Height:** 48px (44px mobile)

**CSS:**
```css
background-color: var(--color-cream-50);
border: 1px solid var(--color-cream-200);
border-radius: 8px;
padding: 12px 16px;
font-family: var(--font-inter), sans-serif;
font-size: 1rem;
color: var(--color-charcoal-900);
min-height: 48px;
```

**Tailwind:**
```css
bg-cream-50 border border-cream-200 rounded-lg px-4 py-3 font-sans text-base text-charcoal-900 min-h-[48px]
```

**Figma:**
- Background: Cream 50
- Border: 1px, Cream 200
- Border Radius: 8px
- Padding: 12px 16px

---

#### Focus State
- **Border:** 2px solid `navy-900`
- **Outline:** 2px solid `navy-900`, 2px offset
- **Shadow:** 0 0 0 2px rgba(16, 42, 67, 0.1)

**CSS:**
```css
border: 2px solid var(--color-navy-900);
outline: 2px solid var(--color-navy-900);
outline-offset: 2px;
box-shadow: 0 0 0 2px rgba(16, 42, 67, 0.1);
```

**Tailwind:**
```css
focus:border-2 focus:border-navy-900 focus:outline-2 focus:outline-navy-900 focus:outline-offset-2 focus:ring-2 focus:ring-navy-500
```

**Figma:**
- Create focus variant
- Border: 2px, Navy 900

---

#### Error State
- **Border:** 2px solid `error` (#dc2626)
- **Background:** `#fef2f2` (light red)
- **Text:** `error` (#dc2626)

**CSS:**
```css
border: 2px solid #dc2626;
background-color: #fef2f2;
color: #dc2626;
```

**Tailwind:**
```css
border-2 border-red-600 bg-red-50 text-red-600
```

**Figma:**
- Create error variant
- Border: 2px, Red 600
- Background: Red 50

---

#### Success State
- **Border:** 2px solid `success` (#277d47)
- **Background:** `#f0f9f4` (light green)
- **Text:** `charcoal-900`

**CSS:**
```css
border: 2px solid var(--color-forest-600);
background-color: var(--color-forest-50);
color: var(--color-charcoal-900);
```

**Tailwind:**
```css
border-2 border-forest-600 bg-forest-50 text-charcoal-900
```

**Figma:**
- Create success variant
- Border: 2px, Forest 600
- Background: Forest 50

---

#### Disabled State
- **Background:** `cream-200`
- **Border:** 1px solid `cream-300`
- **Text:** `charcoal-400`
- **Opacity:** 0.6
- **Cursor:** not-allowed

**CSS:**
```css
background-color: var(--color-cream-200);
border: 1px solid var(--color-cream-300);
color: var(--color-charcoal-400);
opacity: 0.6;
cursor: not-allowed;
```

**Tailwind:**
```css
bg-cream-200 border-cream-300 text-charcoal-400 opacity-60 cursor-not-allowed
```

---

### Label

#### Default Style
- **Font:** Inter, 14px, Semibold
- **Color:** `charcoal-900`
- **Margin Bottom:** 8px
- **Display:** Block

**CSS:**
```css
font-family: var(--font-inter), sans-serif;
font-size: 0.875rem;
font-weight: 600;
color: var(--color-charcoal-900);
margin-bottom: 8px;
display: block;
```

**Tailwind:**
```css
font-sans text-sm font-semibold text-charcoal-900 mb-2 block
```

**Figma:**
- Font: Inter, 14px, Semibold
- Color: Charcoal 900

---

#### Required Indicator
- **Color:** `navy-900`
- **Margin Left:** 4px

**CSS:**
```css
color: var(--color-navy-900);
margin-left: 4px;
```

**Tailwind:**
```css
text-navy-900 ml-1
```

---

### Helper Text / Error Message

#### Helper Text
- **Font:** Inter, 12px, Regular
- **Color:** `charcoal-600`
- **Margin Top:** 4px

**CSS:**
```css
font-family: var(--font-inter), sans-serif;
font-size: 0.75rem;
font-weight: 400;
color: var(--color-charcoal-600);
margin-top: 4px;
```

**Tailwind:**
```css
font-sans text-xs text-charcoal-600 mt-1
```

---

#### Error Message
- **Font:** Inter, 12px, Regular
- **Color:** `error` (#dc2626)
- **Margin Top:** 4px

**CSS:**
```css
font-family: var(--font-inter), sans-serif;
font-size: 0.75rem;
font-weight: 400;
color: #dc2626;
margin-top: 4px;
```

**Tailwind:**
```css
font-sans text-xs text-red-600 mt-1
```

---

### Checkbox

#### Default State
- **Size:** 20px × 20px
- **Border:** 2px solid `cream-200`
- **Border Radius:** 4px
- **Background:** `cream-50`

**CSS:**
```css
width: 20px;
height: 20px;
border: 2px solid var(--color-cream-200);
border-radius: 4px;
background-color: var(--color-cream-50);
```

**Tailwind:**
```css
w-5 h-5 border-2 border-cream-200 rounded bg-cream-50
```

---

#### Checked State
- **Background:** `navy-900`
- **Border:** 2px solid `navy-900`
- **Checkmark:** `cream-50`, 12px

**CSS:**
```css
background-color: var(--color-navy-900);
border: 2px solid var(--color-navy-900);
```

**Tailwind:**
```css
bg-navy-900 border-navy-900
```

---

### Radio Button

#### Default State
- **Size:** 20px × 20px
- **Border:** 2px solid `cream-200`
- **Border Radius:** 50% (circle)
- **Background:** `cream-50`

**CSS:**
```css
width: 20px;
height: 20px;
border: 2px solid var(--color-cream-200);
border-radius: 50%;
background-color: var(--color-cream-50);
```

**Tailwind:**
```css
w-5 h-5 border-2 border-cream-200 rounded-full bg-cream-50
```

---

#### Selected State
- **Border:** 2px solid `navy-900`
- **Inner Circle:** 10px, `navy-900`

**CSS:**
```css
border: 2px solid var(--color-navy-900);
```

**Tailwind:**
```css
border-navy-900
```

---

### Select Dropdown

#### Default State
- **Background:** `cream-50`
- **Border:** 1px solid `cream-200`
- **Border Radius:** 8px
- **Padding:** 12px 16px
- **Min Height:** 48px
- **Arrow:** `charcoal-600`, 16px

**CSS:**
```css
background-color: var(--color-cream-50);
border: 1px solid var(--color-cream-200);
border-radius: 8px;
padding: 12px 16px;
min-height: 48px;
appearance: none;
background-image: url("data:image/svg+xml...");
background-position: right 12px center;
background-repeat: no-repeat;
```

**Tailwind:**
```css
bg-cream-50 border border-cream-200 rounded-lg px-4 py-3 min-h-[48px] appearance-none
```

---

### Textarea

#### Default State
- Same as text input
- **Min Height:** 120px
- **Resize:** Vertical only

**CSS:**
```css
min-height: 120px;
resize: vertical;
```

**Tailwind:**
```css
min-h-[120px] resize-y
```

---

## 🎯 USAGE GUIDELINES

### Figma Setup

1. **Create Color Styles:**
   - Primary: Navy 900, Navy 800, Navy 700
   - Secondary: Forest 600, Forest 700
   - Neutrals: Cream 50-400, Charcoal 500-950

2. **Create Text Styles:**
   - H1-H6 (as specified)
   - Body, Body Large, Body Small
   - Button Text, Label

3. **Create Component Styles:**
   - Buttons (Primary, Secondary, Ghost)
   - Form Inputs (Default, Focus, Error, Success)
   - Checkboxes, Radio Buttons, Selects

4. **Set Up Spacing:**
   - Use 8px base unit
   - Create spacing tokens (8px, 16px, 24px, etc.)

### Code Implementation

1. **Use CSS Variables:**
   - Reference `--color-*` and `--spacing-*` variables
   - Defined in `globals.css`

2. **Use Tailwind Classes:**
   - Colors: `bg-navy-900`, `text-charcoal-900`
   - Spacing: `p-4`, `gap-6`, `space-y-8`
   - Typography: `font-serif`, `text-2xl`

3. **Component Usage:**
   - Import Button component: `import { Button } from "@/components/ui/button"`
   - Use form components from `@/components/ui`

---

## 📊 QUICK REFERENCE

### Most Used Colors
- **Primary CTA:** Navy 900 (#102a43)
- **Background:** Cream 50 (#fefdfb)
- **Text:** Charcoal 900 (#3d3d3d)
- **Body Text:** Charcoal 700 (#4f4f4f)

### Most Used Spacing
- **Small Gap:** 16px
- **Medium Gap:** 24px
- **Large Gap:** 32px
- **Section Spacing:** 96px

### Most Used Typography
- **Headings:** Playfair Display, Bold
- **Body:** Inter, Regular, 16px
- **Buttons:** Inter, Semibold, 16px, Uppercase

---

## 📚 ADDITIONAL GUIDES

### Color Usage Guidelines
See `DESIGN_SYSTEM_COLOR_USAGE.md` for detailed rules on when to use Navy vs Forest.

### Spacing Enforcement
See `DESIGN_SYSTEM_SPACING.md` for spacing standards and migration guide.

---

**This design system is lightweight, consistent, and ready to use in both Figma and code!**
