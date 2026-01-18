# Spacing System Enforcement Guide
## Standardizing Spacing Across All Components

**Purpose:** Replace hardcoded spacing values with design system tokens to ensure visual consistency and premium feel.

---

## 📐 SPACING SCALE (8px Base Unit)

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

---

## 🎯 SECTION SPACING STANDARDS

### Vertical Section Spacing (py-*)

**Small Sections:** 48px (py-12)
- Use for: Subsections, compact sections
- Mobile: `py-12` (48px)
- Tablet: `py-12` (48px)
- Desktop: `py-12` (48px)

**Medium Sections:** 64px (py-16)
- Use for: Standard content sections
- Mobile: `py-12` (48px)
- Tablet: `py-16` (64px)
- Desktop: `py-16` (64px)

**Large Sections:** 96px (py-24)
- Use for: Major sections, hero follow-ups
- Mobile: `py-12` (48px)
- Tablet: `py-16` (64px)
- Desktop: `py-24` (96px)

**XLarge Sections:** 128px (py-32)
- Use for: Hero sections, major dividers
- Mobile: `py-16` (48px)
- Tablet: `py-20` (80px)
- Desktop: `py-32` (128px)

### Standard Pattern
```tsx
// Small section
className="py-12 bg-cream-50"

// Medium section
className="py-12 md:py-16 bg-cream-50"

// Large section
className="py-12 md:py-16 lg:py-24 bg-cream-50"

// XLarge section
className="py-16 md:py-20 lg:py-32 bg-cream-50"
```

---

## 📦 GRID GAP STANDARDS

### Product Grid Gaps

**Mobile (1-2 columns):** 16px (gap-4)
**Tablet (2-3 columns):** 20px (gap-5)
**Desktop (3-4 columns):** 24px (gap-6)
**Large Desktop (4+ columns):** 32px (gap-8)

### Standard Pattern
```tsx
// Product grid
className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8"
```

### Content Grid Gaps

**Small gaps:** 16px (gap-4)
**Medium gaps:** 24px (gap-6)
**Large gaps:** 32px (gap-8)

---

## 🔲 CONTAINER PADDING STANDARDS

### Horizontal Padding (px-*)

**Mobile:** 16px (px-4)
**Tablet:** 24px (px-6)
**Desktop:** 32px (px-8)

### Standard Pattern
```tsx
// Use Container component (handles padding automatically)
<Container size="lg">
  {/* Content */}
</Container>
```

---

## 📏 INTERNAL SPACING STANDARDS

### Space Between Elements

**Tight (8px):** `space-y-2` or `gap-2`
- Use for: Related elements, icon + text pairs

**Small (16px):** `space-y-4` or `gap-4`
- Use for: Standard element spacing

**Medium (24px):** `space-y-6` or `gap-6`
- Use for: Card content, form fields

**Large (32px):** `space-y-8` or `gap-8`
- Use for: Section headers, major content blocks

**XLarge (48px):** `space-y-12` or `gap-12`
- Use for: Major section divisions

---

## ✅ MIGRATION CHECKLIST

### Home Sections
- [ ] NewArrivalsSection - Standardize spacing
- [ ] ShopByStyleSection - Standardize spacing
- [ ] FeaturedCollections - Standardize spacing
- [ ] EditorialSection - Standardize spacing
- [ ] GirlsCollectionSection - Standardize spacing
- [ ] StyleGuideSection - Standardize spacing

### Product Components
- [ ] ProductGrid - Standardize gaps
- [ ] ProductCard - Standardize padding
- [ ] ProductGallery - Standardize spacing

### Layout Components
- [ ] Header - Standardize padding
- [ ] Footer - Standardize spacing
- [ ] Container - Verify padding consistency

---

## 🚫 COMMON MISTAKES TO AVOID

### ❌ Don't Use Arbitrary Values
```tsx
// ❌ Bad
className="py-13 md:py-17 lg:py-25"

// ✅ Good
className="py-12 md:py-16 lg:py-24"
```

### ❌ Don't Mix Spacing Systems
```tsx
// ❌ Bad
className="py-12 space-y-7 gap-5"

// ✅ Good
className="py-12 space-y-8 gap-6"
```

### ❌ Don't Use Non-8px Multiples
```tsx
// ❌ Bad
className="py-10 md:py-14 lg:py-18"

// ✅ Good
className="py-12 md:py-16 lg:py-24"
```

---

## 📋 REFERENCE TABLE

### Tailwind to Pixels

| Tailwind | Pixels | Design Token |
|----------|--------|--------------|
| `p-2` | 8px | `space-xs` |
| `p-4` | 16px | `space-sm` |
| `p-6` | 24px | `space-md` |
| `p-8` | 32px | `space-lg` |
| `p-12` | 48px | `space-xl` |
| `p-16` | 64px | `space-2xl` |
| `p-24` | 96px | `space-3xl` |
| `p-32` | 128px | `space-4xl` |

---

**This spacing guide ensures visual consistency and premium feel across all components.**
