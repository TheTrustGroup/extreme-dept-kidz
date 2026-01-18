# Figma Specifications - Quick Reference Guide

## 📋 What You Have

You have **3 main Figma specification documents** that serve as design guides:

### 1. **FIGMA_HEADER_NAV_SPEC.md** ✅
**Location:** Root directory  
**What it contains:**
- Complete header and navigation design specs
- Top bar component specifications
- Desktop header (default & scrolled states)
- Mega menu design
- Mobile header and navigation drawer
- Bottom navigation bar (mobile)
- All measurements, colors, typography
- Step-by-step Figma implementation guide

**Use for:** Designing the header, navigation menu, and mobile navigation

---

### 2. **FIGMA_PRODUCT_CARD_SPEC.md** ✅
**Location:** Root directory  
**What it contains:**
- Product card component specifications
- Image aspect ratios (1:1 square)
- Badge system (NEW, SALE, FEATURED)
- Wishlist and Quick Add buttons
- Product grid layouts (desktop, tablet, mobile)
- Hover/tap interactions
- Price and title hierarchy
- All states and variants

**Use for:** Designing product cards and product grid layouts

---

### 3. **HOMEPAGE_REDESIGN_SPEC.md** ⚠️
**Location:** Root directory  
**Status:** File exists but may need content restoration

**Should contain:**
- Homepage layout sections
- Typography scale
- Color usage
- Button styles
- Section spacing
- Desktop and mobile layouts

---

## 🎨 Do You Have to Use Them in Figma?

### **Short Answer: No, they're reference guides, not requirements.**

These specifications are **design guides** to help you:

✅ **Use them as:**
- Reference for measurements and spacing
- Color and typography guidelines
- Component structure inspiration
- Responsive breakpoint guidance
- Interaction behavior ideas

❌ **You don't have to:**
- Follow every measurement exactly
- Use all the specified components
- Implement every interaction
- Match the specs pixel-perfect

### **Think of them as:**
- **Design briefs** - What the design should achieve
- **Style guides** - Colors, typography, spacing systems
- **Component libraries** - Reusable design patterns
- **Reference documentation** - Quick lookup for measurements

---

## 🚀 How to Use Them in Figma

### Option 1: Reference While Designing
1. Open the spec document in a browser or text editor
2. Keep it open while designing in Figma
3. Refer to measurements, colors, and spacing as needed
4. Adapt and adjust based on what looks best

### Option 2: Create Design Tokens
1. Extract colors from specs → Create Figma color styles
2. Extract typography → Create Figma text styles
3. Extract spacing → Use in auto-layout padding/gaps
4. Build components based on the structure described

### Option 3: Follow Step-by-Step Guide
1. Each spec has a "Figma Implementation Guide" section
2. Follow the numbered steps to build components
3. Use the component structure diagrams
4. Create variants as specified

---

## 📐 Quick Measurements Reference

### Header & Navigation
- **Top Bar Height:** 32px
- **Header Default:** 88px (desktop), 72px (mobile)
- **Header Scrolled:** 72px (desktop), 64px (mobile)
- **Logo Default:** 112px (desktop), 48px (mobile)
- **Nav Link Gap:** 32px (desktop)

### Product Cards
- **Card Width:** 280px (desktop)
- **Image Aspect:** 1:1 (square, 280×280px)
- **Badge Size:** Auto-width × 24px height
- **Grid Gap:** 24px (desktop), 16px (mobile)

### Colors
- **Cream 50:** `#fefdfb` (backgrounds)
- **Charcoal 900:** `#3d3d3d` (text, badges)
- **Navy 900:** `#102a43` (CTAs, emphasized links)
- **Charcoal 700:** `#4f4f4f` (body text)

### Typography
- **Nav Links:** Inter, 11px, Semibold, Uppercase
- **Product Names:** Playfair Display, 18px, Medium
- **Prices:** Inter, 20px, Bold
- **Mobile Nav:** Playfair Display, 24px, Semibold

---

## 🎯 What to Focus On

### Must-Have Elements:
1. **Brand consistency** - Logo prominent, colors match
2. **Clear hierarchy** - BOYS emphasized, navigation logical
3. **Mobile-friendly** - Touch targets 44px+, readable text
4. **Sticky header** - Smooth scroll behavior

### Nice-to-Have:
- Exact measurements from specs
- All specified interactions
- Every variant and state
- Pixel-perfect spacing

---

## 💡 Tips

1. **Start with the big picture** - Layout and hierarchy first
2. **Use specs as guidelines** - Not strict rules
3. **Test on mobile** - Mobile experience is critical
4. **Iterate** - Adjust based on what looks best
5. **Keep it consistent** - Use the same spacing/colors throughout

---

## 📁 File Locations

All specs are in your project root:
```
/Users/raregem.zillion/Desktop/EXTREME DEPT KIDZ 1.0/
├── FIGMA_HEADER_NAV_SPEC.md
├── FIGMA_PRODUCT_CARD_SPEC.md
└── HOMEPAGE_REDESIGN_SPEC.md (may need restoration)
```

---

## ❓ Need Help?

If you need:
- **Specific measurements** → Check the relevant spec file
- **Color codes** → Look in the "Color System" section
- **Component structure** → Check the "Component Structure" section
- **Responsive breakpoints** → Check the "Responsive" section

**Remember:** These are guides to help you, not constraints. Use your design judgment and adapt as needed!
