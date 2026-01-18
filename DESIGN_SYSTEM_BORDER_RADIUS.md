# Extreme Dept Kidz - Border Radius System Guidelines

**Purpose:** To establish a consistent border radius system that enhances visual cohesion and premium feel across all UI elements.

---

## 🎨 BORDER RADIUS LEVELS

### Level 1: Small (sm)
**Usage:** Buttons, small badges, input fields
- **Value:** `0.375rem` (6px)
- **Tailwind:** `rounded-md` or `rounded-lg` (depending on context)
- **Use Cases:**
  - Buttons (primary, secondary)
  - Input fields
  - Small badges
  - Compact cards

---

### Level 2: Medium (md)
**Usage:** Product cards, standard cards, containers
- **Value:** `0.5rem` (8px)
- **Tailwind:** `rounded-lg`
- **Use Cases:**
  - Product cards
  - Standard cards
  - Container cards
  - Image containers

---

### Level 3: Large (lg)
**Usage:** Large cards, collection cards, featured sections
- **Value:** `0.75rem` (12px)
- **Tailwind:** `rounded-xl`
- **Use Cases:**
  - Collection cards
  - Featured cards
  - Large image containers
  - Prominent sections

---

### Level 4: Extra Large (xl)
**Usage:** Modals, drawers, full-width sections
- **Value:** `1rem` (16px)
- **Tailwind:** `rounded-2xl`
- **Use Cases:**
  - Modals
  - Drawers
  - Full-width sections
  - Large overlays

---

### Level 5: Full Circle
**Usage:** Avatars, circular buttons, badges
- **Value:** `9999px` or `50%`
- **Tailwind:** `rounded-full`
- **Use Cases:**
  - Avatar images
  - Circular buttons
  - Badge indicators
  - Icon buttons

---

## 📐 BORDER RADIUS TOKENS

### CSS Variables
```css
:root {
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-full: 9999px;   /* Full circle */
}
```

### Tailwind Config Extension
```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      borderRadius: {
        'sm': '0.375rem',   // 6px
        'md': '0.5rem',      // 8px
        'lg': '0.75rem',     // 12px
        'xl': '1rem',        // 16px
        'full': '9999px',    // Full circle
      },
    },
  },
}
```

---

## 🎯 USAGE GUIDELINES

### Product Cards
- **Default:** `rounded-lg` (8px)
- **Image:** `rounded-t-lg` (top corners only)

### Buttons
- **Default:** `rounded-lg` (8px)
- **Small buttons:** `rounded-md` (6px)

### Collection Cards
- **Default:** `rounded-xl` (12px)
- **Large featured:** `rounded-2xl` (16px)

### Badges
- **Small badges:** `rounded-full` (circular)
- **Text badges:** `rounded-md` (6px)

### Modals & Drawers
- **Default:** `rounded-2xl` (16px)
- **Top corners only:** `rounded-t-2xl`

### Input Fields
- **Default:** `rounded-lg` (8px)
- **Small inputs:** `rounded-md` (6px)

---

## ⚠️ AVOID

- ❌ **Hardcoded Values:** Always use defined tokens
- ❌ **Inconsistent Radius:** Don't mix different radius levels on related elements
- ❌ **Excessive Radius:** Don't use more than 16px (rounded-2xl) for most elements
- ❌ **Sharp Corners:** Avoid `rounded-none` except for specific design needs

---

## 🔄 MIGRATION GUIDE

### Replace Inline Radius
```jsx
// ❌ Before
<div className="rounded-[8px]">

// ✅ After
<div className="rounded-lg">
```

### Standardize Card Radius
```jsx
// ❌ Before
<div className="rounded-xl">
<div className="rounded-lg">

// ✅ After (Product Cards)
<div className="rounded-lg">

// ✅ After (Collection Cards)
<div className="rounded-xl">
```

---

**This border radius system ensures consistent visual cohesion across all UI elements, enhancing the premium feel of Extreme Dept Kidz!**
