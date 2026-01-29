# Typography Improvements - Implementation Guide

## Overview
This document outlines the typography improvements implemented across the site, including consistent heading hierarchy, improved spacing, reduced bold text overuse, and inclusive language updates.

---

## 1. Typography Hierarchy

### H1 - Hero Titles
**Desktop:** 48-64px (clamp: 3rem-4rem)  
**Mobile:** 32-40px (clamp: 2rem-2.5rem)

**CSS:**
```css
font-family: var(--font-serif);
font-size: clamp(2rem, 5vw, 4rem); /* Mobile: 32px, Desktop: 64px */
font-weight: 700; /* Bold */
line-height: 1.2; /* Tight */
letter-spacing: -0.02em;
```

**Tailwind:**
```tsx
className="font-serif text-[clamp(2rem,5vw,4rem)] md:text-[clamp(3rem,6vw,4rem)] font-bold tracking-tight leading-tight"
```

**Usage:** Hero section main headlines, major page titles

---

### H2 - Section Titles
**Desktop:** 36-48px (clamp: 2.25rem-3rem)  
**Mobile:** 28-32px (clamp: 1.75rem-2rem)

**CSS:**
```css
font-family: var(--font-serif);
font-size: clamp(1.75rem, 4vw, 3rem); /* Mobile: 28px, Desktop: 48px */
font-weight: 600; /* Semibold */
line-height: 1.2; /* Tight */
letter-spacing: -0.01em;
```

**Tailwind:**
```tsx
className="font-serif text-[clamp(1.75rem,4vw,3rem)] md:text-[clamp(2.25rem,5vw,3rem)] font-semibold tracking-tight leading-tight"
```

**Usage:** Major section titles ("JUST DROPPED", "Shop by Style", "Built for Adventure")

---

### H3 - Product/Card Titles
**Desktop:** 20-24px (clamp: 1.25rem-1.5rem)  
**Mobile:** 18-20px (clamp: 1.125rem-1.25rem)

**CSS:**
```css
font-family: var(--font-serif);
font-size: clamp(1.125rem, 3vw, 1.5rem); /* Mobile: 18px, Desktop: 24px */
font-weight: 500; /* Medium - REDUCED from semibold */
line-height: 1.4; /* Snug */
letter-spacing: -0.01em;
```

**Tailwind:**
```tsx
className="font-serif text-[clamp(1.125rem,3vw,1.5rem)] md:text-[clamp(1.25rem,3vw,1.5rem)] font-medium tracking-tight leading-snug"
```

**Usage:** Product names, collection card titles, subsection headings

---

### Body Text
**Desktop:** 16-18px (clamp: 1rem-1.125rem)  
**Mobile:** 16px (1rem)

**CSS:**
```css
font-family: var(--font-sans);
font-size: clamp(1rem, 1.125rem); /* Mobile: 16px, Desktop: 18px */
font-weight: 400; /* Regular */
line-height: 1.6; /* Relaxed - IMPROVED from 1.5 */
letter-spacing: 0;
```

**Tailwind:**
```tsx
className="font-sans text-base md:text-[1.125rem] leading-[1.6]"
```

**Usage:** Body paragraphs, descriptions, general content

---

## 2. Spacing System

### Section Spacing
**Desktop:** 80-120px between major sections  
**Mobile:** 60-80px between major sections

**CSS Variables:**
```css
--section-spacing-mobile: 60px; /* 3.75rem */
--section-spacing-desktop: 96px; /* 6rem */
--section-spacing-large: 120px; /* 7.5rem */
```

**Tailwind:**
```tsx
// Mobile
className="py-[60px] md:py-[96px] lg:py-[120px]"

// Or using spacing scale
className="py-[var(--space-12)] md:py-[var(--space-13)] lg:py-[120px]"
```

**Usage:** Between major page sections (Hero → New Arrivals → Shop by Style, etc.)

---

### Product Card Spacing
**Gap:** 16-24px between product cards

**CSS:**
```css
.product-grid {
  gap: clamp(1rem, 1.5rem); /* 16px mobile, 24px desktop */
}
```

**Tailwind:**
```tsx
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
```

**Usage:** Product card grids, collection displays

---

### Line Height Improvements
**Body Text:** 1.6 (improved from 1.5)  
**Headings:** 1.2-1.4 (tight for headings)

**CSS:**
```css
--line-height-body: 1.6; /* Relaxed for readability */
--line-height-heading: 1.2; /* Tight for headings */
```

**Tailwind:**
```tsx
className="leading-[1.6]" // Body text
className="leading-tight" // Headings (1.2)
```

---

## 3. Font Weight Reductions

### Navigation Links
**Before:** `font-semibold` (600) or `font-bold` (700)  
**After:** `font-medium` (500)

**CSS:**
```css
.nav-link {
  font-weight: 500; /* Medium instead of semibold/bold */
}
```

**Tailwind:**
```tsx
// Before
className="font-semibold uppercase"

// After
className="font-medium uppercase"
```

**Files Updated:**
- `components/layout/Header.tsx` - Navigation links
- `components/layout/MobileNav.tsx` - Mobile navigation

---

### Emphasis Text
**Before:** Entire paragraphs in bold  
**After:** Only specific words/phrases in bold for emphasis

**Guidelines:**
- Use `font-semibold` (600) for emphasis, not `font-bold` (700)
- Reserve bold for call-to-action buttons and critical information
- Use `font-medium` (500) for subtle emphasis in body text

**Example:**
```tsx
// ❌ Before
<p className="font-bold">This entire paragraph is bold.</p>

// ✅ After
<p>This paragraph has <span className="font-semibold">only important words</span> in bold.</p>
```

---

## 4. Inclusive Language Updates

### Text Changes
All instances of "modern boy" have been updated to more inclusive alternatives:

**Before → After:**
- "modern boy" → "young legends" (preferred)
- "modern boy" → "kids" (alternative)
- "modern boy" → "children" (formal contexts)

**Files Updated:**
1. `components/home/HeroSection.tsx`
   - "Elevated style for the modern boy" → "Elevated style for young legends"

2. `components/layout/Footer.tsx`
   - "Premium streetwear and luxury essentials for the modern boy" → "Premium streetwear and luxury essentials for kids"

3. `components/home/ShopByStyleSection.tsx`
   - "Curated collections for the modern boy" → "Curated collections for young legends"

4. `components/home/EditorialSection.tsx`
   - "crafted for the modern boy who moves" → "crafted for young legends who move"

5. `components/home/LifestyleSection.tsx`
   - "for the modern boy who moves" → "for young legends who move"

6. `components/cart/CartDrawer.tsx`
   - "premium pieces for the modern boy" → "premium pieces for young legends"

7. `components/cart/CartPreviewDropdown.tsx`
   - "premium pieces for the modern boy" → "premium pieces for young legends"

8. `lib/mock-data/styling-data.ts`
   - "Perfect for the modern boy" → "Perfect for young legends"
   - "Bold and confident for the modern boy" → "Bold and confident for young legends"

---

## 5. Implementation Checklist

### Typography Components ✅
- [x] Updated `H1` component with responsive clamp sizing
- [x] Updated `H2` component with responsive clamp sizing
- [x] Updated `H3` component (reduced weight from semibold to medium)
- [x] Updated `Body` component (improved line-height to 1.6)

### Spacing ✅
- [x] Documented section spacing guidelines
- [x] Documented product card gap guidelines
- [x] Improved line-height for body text

### Font Weight ✅
- [x] Reduced navigation link weight (semibold → medium)
- [x] Updated emphasized navigation items (bold → semibold)
- [x] Documented emphasis guidelines

### Inclusive Language ✅
- [x] Updated all "modern boy" instances to "young legends" or "kids"
- [x] Updated Hero section
- [x] Updated Footer
- [x] Updated all home page sections
- [x] Updated cart components
- [x] Updated mock data

---

## 6. Usage Examples

### Hero Section
```tsx
<H1 className="text-cream-50">
  Premium Streetwear for Young Legends
</H1>
```

### Section Title
```tsx
<H2 className="mb-[var(--space-6)] md:mb-[var(--space-8)]">
  Just Dropped
</H2>
```

### Product Card Title
```tsx
<H3 className="text-charcoal-900 mb-2">
  {product.name}
</H3>
```

### Body Text
```tsx
<Body className="text-charcoal-700 max-w-2xl">
  Premium streetwear meets luxury essentials. Our collections celebrate both play and sophistication.
</Body>
```

### Navigation Link
```tsx
<Link className="font-medium uppercase tracking-wider">
  BOYS
</Link>
```

---

## 7. Benefits

1. **Better Readability:** Improved line-height (1.6) makes body text easier to read
2. **Visual Hierarchy:** Consistent heading sizes create clear information hierarchy
3. **Responsive Design:** Clamp-based sizing ensures optimal typography at all screen sizes
4. **Reduced Visual Noise:** Less bold text creates a cleaner, more professional appearance
5. **Inclusive Language:** Updated copy appeals to all children, not just boys
6. **Consistent Spacing:** Standardized gaps create visual rhythm and flow

---

## 8. Migration Notes

### Breaking Changes
- `H3` component now uses `font-medium` instead of `font-semibold`
- Navigation links now use `font-medium` instead of `font-semibold` or `font-bold`
- Body text line-height changed from 1.5 to 1.6

### Backward Compatibility
- All changes are backward compatible
- Existing components will automatically use new typography styles
- No manual migration required for components using `<H1>`, `<H2>`, `<H3>`, `<Body>` components

---

## 9. Future Improvements

Consider:
- Adding more granular typography scale tokens
- Creating utility classes for common spacing patterns
- Adding typography presets for specific use cases (e.g., product cards, testimonials)
- Documenting typography in Storybook or design system documentation
