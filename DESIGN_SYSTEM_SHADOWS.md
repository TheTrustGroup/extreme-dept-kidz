# Extreme Dept Kidz - Shadow System Guidelines

**Purpose:** To establish a consistent shadow system that enhances depth, hierarchy, and premium feel across all UI elements.

---

## 🎨 SHADOW LEVELS

### Level 1: Subtle (sm)
**Usage:** Cards at rest, subtle elevation
- **Value:** `0 1px 3px rgba(0, 0, 0, 0.08)`
- **Tailwind:** `shadow-sm`
- **Custom:** `shadow-[0_1px_3px_rgba(0,0,0,0.08)]`
- **Use Cases:**
  - Product cards (default state)
  - Input fields
  - Subtle containers
  - Background cards

---

### Level 2: Medium (md)
**Usage:** Hovered cards, elevated elements
- **Value:** `0 4px 12px rgba(0, 0, 0, 0.1)`
- **Tailwind:** `shadow-md` (or custom)
- **Custom:** `shadow-[0_4px_12px_rgba(0,0,0,0.1)]`
- **Use Cases:**
  - Product cards on hover
  - Dropdown menus
  - Modal overlays (subtle)
  - Elevated sections

---

### Level 3: Large (lg)
**Usage:** Prominent elevation, floating elements
- **Value:** `0 8px 24px rgba(0, 0, 0, 0.12)`
- **Tailwind:** `shadow-lg` (or custom)
- **Custom:** `shadow-[0_8px_24px_rgba(0,0,0,0.12)]`
- **Use Cases:**
  - Product cards (hover state)
  - Floating action buttons
  - Sticky headers
  - Prominent cards

---

### Level 4: Extra Large (xl)
**Usage:** Maximum elevation, modals, overlays
- **Value:** `0 12px 40px rgba(0, 0, 0, 0.15)`
- **Tailwind:** `shadow-xl` (or custom)
- **Custom:** `shadow-[0_12px_40px_rgba(0,0,0,0.15)]`
- **Use Cases:**
  - Modals
  - Drawers
  - Popovers
  - Maximum elevation elements

---

### Level 5: Colored Shadows (Accent)
**Usage:** Brand-colored shadows for emphasis
- **Navy Shadow:** `0 4px 12px rgba(16, 42, 67, 0.3)`
- **Custom:** `shadow-[0_4px_12px_rgba(16,42,67,0.3)]`
- **Use Cases:**
  - Primary buttons (hover)
  - Active navigation items
  - Brand-emphasized elements

---

## 📐 SHADOW TOKENS

### CSS Variables
```css
:root {
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.15);
  --shadow-navy: 0 4px 12px rgba(16, 42, 67, 0.3);
}
```

### Tailwind Config Extension
```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'xl': '0 12px 40px rgba(0, 0, 0, 0.15)',
        'navy': '0 4px 12px rgba(16, 42, 67, 0.3)',
      },
    },
  },
}
```

---

## 🎯 USAGE GUIDELINES

### Product Cards
- **Default:** `shadow-sm`
- **Hover:** `shadow-lg`
- **Transition:** `transition-shadow duration-300`

### Buttons
- **Default:** No shadow (or `shadow-sm` for elevated buttons)
- **Hover:** `shadow-navy` (primary buttons)
- **Active:** `shadow-sm` (pressed state)

### Modals & Overlays
- **Backdrop:** `shadow-xl`
- **Content:** `shadow-xl`

### Navigation
- **Sticky Header:** `shadow-md`
- **Dropdown Menus:** `shadow-lg`

### Form Elements
- **Input Focus:** `shadow-md` (subtle)
- **Input Default:** `shadow-sm` (optional)

---

## ⚠️ AVOID

- ❌ **Hardcoded Shadow Values:** Always use defined tokens
- ❌ **Excessive Shadows:** Don't use more than 2 shadow levels on one page
- ❌ **Inconsistent Opacity:** Keep opacity values consistent (0.08, 0.1, 0.12, 0.15)
- ❌ **Color Mismatches:** Don't mix shadow colors without purpose

---

## 🔄 MIGRATION GUIDE

### Replace Inline Shadows
```jsx
// ❌ Before
<div className="shadow-[0_2px_8px_rgba(0,0,0,0.08)]">

// ✅ After
<div className="shadow-sm">
```

### Replace Hover Shadows
```jsx
// ❌ Before
<div className="hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]">

// ✅ After
<div className="shadow-sm hover:shadow-lg transition-shadow duration-300">
```

### Replace Colored Shadows
```jsx
// ❌ Before
<button className="hover:shadow-[0_4px_12px_rgba(16,42,67,0.3)]">

// ✅ After
<button className="hover:shadow-navy transition-shadow duration-200">
```

---

**This shadow system ensures consistent depth and hierarchy across all UI elements, enhancing the premium feel of Extreme Dept Kidz!**
