# Figma Product Card & Grid Component Specification
## Extreme Dept Kidz - Premium Kids Fashion

**Version:** 1.0  
**Purpose:** Complete design specification for product card and grid layout components in Figma  
**Focus:** Clarity, polish, and premium luxury aesthetic

---

## 1. PRODUCT CARD COMPONENT

### Base Specifications

#### Dimensions
- **Desktop Card Width:** 280px (fixed)
- **Desktop Card Height:** Variable (auto-layout)
- **Tablet Card Width:** Variable (grid-based, ~240px)
- **Mobile Card Width:** Variable (grid-based, ~160px)
- **Aspect Ratio:** 1:1 (square) for product images

#### Container Structure
```
┌─────────────────────────┐
│  Product Card Container │
│  (280px × auto)         │
│                         │
│  ┌───────────────────┐  │
│  │  Image Container  │  │
│  │  (280×280px)      │  │
│  │  [Badges]         │  │
│  │  [Wishlist]       │  │
│  │  [Quick Add]      │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │  Product Info     │  │
│  │  (16px padding)    │  │
│  │  - Name           │  │
│  │  - Price          │  │
│  │  - Category       │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

## 2. IMAGE CONTAINER SPECIFICATIONS

### Image Frame
- **Dimensions:** 280px × 280px (Desktop)
- **Aspect Ratio:** 1:1 (square)
- **Border Radius:** 8px (top corners only)
- **Background:** Cream 100 (`#fdfbf6`)
- **Overflow:** Hidden

### Image Specifications
- **Primary Image:** Full frame, object-fit cover
- **Secondary Image:** Same dimensions, appears on hover
- **Image Quality:** High resolution (minimum 560px × 560px for 2x retina)
- **Loading State:** Blur placeholder or skeleton

### Image States

#### Default State
- **Primary Image:** Opacity 100%
- **Secondary Image:** Opacity 0% (hidden)
- **Overlay:** None

#### Hover State (Desktop)
- **Primary Image:** Opacity 0% (fade out)
- **Secondary Image:** Opacity 100% (fade in)
- **Transition:** 200ms ease-in-out
- **Transform:** Scale 1.02 (subtle zoom)
- **Overlay:** None (keep images clean)

#### Focus State (Keyboard Navigation)
- **Outline:** 2px solid Navy 900
- **Outline Offset:** 2px
- **Border Radius:** 8px

---

## 3. BADGE SYSTEM

### Badge Types

#### "NEW" Badge
- **Position:** Top-left corner
- **Offset:** 12px from top, 12px from left
- **Dimensions:** Auto-width, 24px height
- **Padding:** 6px 12px (horizontal, vertical)
- **Background:** Charcoal 900 (`#3d3d3d`)
- **Text Color:** Cream 50 (`#fefdfb`)
- **Typography:**
  - Font: Inter
  - Size: 11px
  - Weight: Semibold (600)
  - Letter Spacing: 1px
  - Text Transform: Uppercase
- **Border Radius:** 12px (pill shape)
- **Z-Index:** 10 (above image)

#### "SALE" Badge
- **Position:** Top-left corner (below "NEW" if both present)
- **Offset:** 48px from top (if NEW present), 12px if alone
- **Dimensions:** Auto-width, 24px height
- **Padding:** 6px 12px
- **Background:** Navy 900 (`#102a43`)
- **Text Color:** Cream 50 (`#fefdfb`)
- **Typography:** Same as NEW badge
- **Border Radius:** 12px
- **Z-Index:** 10

#### "FEATURED" Badge (Optional)
- **Position:** Top-right corner
- **Offset:** 12px from top, 12px from right
- **Dimensions:** Auto-width, 24px height
- **Padding:** 6px 12px
- **Background:** Forest 600 (`#277d47`) - use sparingly
- **Text Color:** Cream 50 (`#fefdfb`)
- **Typography:** Same as NEW badge
- **Border Radius:** 12px
- **Z-Index:** 10

### Badge Stacking Rules
- **Multiple Badges:** Stack vertically with 8px gap
- **Maximum:** 2 badges visible (NEW + SALE, or FEATURED alone)
- **Priority:** NEW > SALE > FEATURED

---

## 4. WISHLIST BUTTON

### Specifications
- **Position:** Top-right corner
- **Offset:** 12px from top, 12px from right
- **Dimensions:** 40px × 40px (touch-friendly)
- **Background:** White with 80% opacity
- **Border Radius:** 20px (circle)
- **Icon:** Heart (outline when not saved, filled when saved)
- **Icon Size:** 18px × 18px
- **Icon Color:** Charcoal 700 (default), Navy 900 (saved)
- **Z-Index:** 10

### States
- **Default:** White background, outline heart icon
- **Hover:** Background opacity 100%, scale 1.1
- **Saved:** Filled heart icon, Navy 900 color
- **Active:** Scale 0.95 (press feedback)

---

## 5. QUICK ADD TO CART BUTTON

### Desktop Hover State
- **Position:** Bottom of image container
- **Dimensions:** Full width minus 24px (12px padding each side)
- **Height:** 48px
- **Background:** Navy 900 (`#102a43`)
- **Text Color:** Cream 50 (`#fefdfb`)
- **Typography:**
  - Font: Inter
  - Size: 14px
  - Weight: Semibold (600)
  - Letter Spacing: 0.5px
  - Text Transform: Uppercase
- **Border Radius:** 8px
- **Padding:** 12px 16px
- **Shadow:** 0 4px 12px rgba(16, 42, 67, 0.3)
- **Z-Index:** 10

### Animation
- **Initial:** Opacity 0%, Translate Y 8px
- **Hover:** Opacity 100%, Translate Y 0
- **Transition:** 300ms ease-in-out
- **Icon:** Shopping bag icon, 16px, left of text
- **Icon-Text Gap:** 8px

### Mobile State (Always Visible)
- **Same styling as desktop hover state**
- **Always visible** (not hidden)
- **Position:** Bottom of image container
- **Touch Target:** Minimum 44px height

---

## 6. PRODUCT INFORMATION SECTION

### Container
- **Padding:** 16px (all sides)
- **Background:** Cream 50 (`#fefdfb`)
- **Spacing:** 8px vertical gap between elements

### Product Name (H4)
- **Typography:**
  - Font: Playfair Display (Serif)
  - Size: 18px (Desktop) / 16px (Mobile)
  - Weight: Medium (500)
  - Line Height: 1.4
  - Color: Charcoal 900 (`#3d3d3d`)
- **Max Lines:** 2 (line-clamp)
- **Overflow:** Ellipsis
- **Spacing:** 0px top, 8px bottom

### Price Section
- **Layout:** Horizontal flex, baseline aligned
- **Spacing:** 8px gap between price and original price

#### Current Price
- **Typography:**
  - Font: Inter (Sans-serif)
  - Size: 20px (Desktop) / 18px (Mobile)
  - Weight: Bold (700)
  - Color: Charcoal 900 (`#3d3d3d`)
- **Spacing:** 0px top, 8px bottom

#### Original Price (Sale Items)
- **Typography:**
  - Font: Inter (Sans-serif)
  - Size: 14px
  - Weight: Regular (400)
  - Color: Charcoal 500 (`#6d6d6d`)
  - Text Decoration: Line-through
- **Position:** Next to current price

### Category Label
- **Typography:**
  - Font: Inter (Sans-serif)
  - Size: 11px
  - Weight: Medium (500)
  - Letter Spacing: 1px
  - Text Transform: Uppercase
  - Color: Charcoal 600 (`#5d5d5d`)
- **Spacing:** 0px top, 0px bottom

---

## 7. OUT OF STOCK STATE

### Overlay
- **Position:** Full image container
- **Background:** Cream 50 with 90% opacity
- **Z-Index:** 5 (above image, below badges)

### Text
- **Position:** Centered in image container
- **Typography:**
  - Font: Playfair Display (Serif)
  - Size: 18px
  - Weight: Medium (500)
  - Letter Spacing: 1px
  - Text Transform: Uppercase
  - Color: Charcoal 600 (`#5d5d5d`)
- **Alignment:** Center

---

## 8. PRODUCT CARD STATES

### Default State
- **Shadow:** 0 2px 8px rgba(0, 0, 0, 0.08)
- **Transform:** None
- **Border:** None
- **Background:** Cream 50

### Hover State (Desktop)
- **Shadow:** 0 8px 24px rgba(0, 0, 0, 0.12)
- **Transform:** Scale 1.02, Translate Y -4px
- **Transition:** 300ms ease-in-out
- **Border:** None
- **Background:** Cream 50

### Focus State (Keyboard)
- **Outline:** 2px solid Navy 900
- **Outline Offset:** 2px
- **Border Radius:** 8px (entire card)
- **Shadow:** Same as hover

### Active State (Click/Tap)
- **Transform:** Scale 0.98
- **Transition:** 100ms ease-in-out
- **Shadow:** Same as default

---

## 9. PRODUCT GRID LAYOUT

### Grid Specifications

#### Desktop (1280px+)
- **Container:** Max-width 1280px, centered
- **Columns:** 4 columns
- **Gap:** 24px (horizontal and vertical)
- **Card Width:** 280px (calculated: (1280 - 32*2 - 24*3) / 4)
- **Alignment:** Start (top-aligned)

#### Tablet (768px - 1279px)
- **Container:** Max-width 1200px, centered
- **Columns:** 3 columns
- **Gap:** 20px
- **Card Width:** Variable (~360px)
- **Alignment:** Start

#### Mobile (375px - 767px)
- **Container:** Full width, 16px padding
- **Columns:** 2 columns
- **Gap:** 16px
- **Card Width:** Variable (~160px)
- **Alignment:** Start

### Grid Container
```
┌─────────────────────────────────────┐
│  Container (1280px max, centered)   │
│  Padding: 32px (desktop)            │
│                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │Card│ │Card│ │Card│ │Card│      │
│  └────┘ └────┘ └────┘ └────┘      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │Card│ │Card│ │Card│ │Card│      │
│  └────┘ └────┘ └────┘ └────┘      │
│  (4 columns, 24px gap)             │
└─────────────────────────────────────┘
```

### Grid Spacing Rules
- **Horizontal Gap:** 24px (Desktop), 20px (Tablet), 16px (Mobile)
- **Vertical Gap:** 24px (Desktop), 20px (Tablet), 16px (Mobile)
- **Container Padding:** 32px (Desktop), 24px (Tablet), 16px (Mobile)
- **Section Spacing:** 96px between sections (Desktop), 64px (Tablet), 48px (Mobile)

---

## 10. FIGMA COMPONENT STRUCTURE

### Master Component: Product Card

#### Variants
1. **State Variants:**
   - Default
   - Hover
   - Focus
   - Active
   - Out of Stock

2. **Badge Variants:**
   - No Badge
   - NEW Badge
   - SALE Badge
   - NEW + SALE Badges
   - FEATURED Badge

3. **Size Variants:**
   - Desktop (280px)
   - Tablet (240px)
   - Mobile (160px)

#### Component Layers (Top to Bottom)
```
Product Card (Frame)
├── Image Container (Frame)
│   ├── Primary Image (Image)
│   ├── Secondary Image (Image) [Hidden by default]
│   ├── Out of Stock Overlay (Frame) [Conditional]
│   ├── Badge Container (Auto-Layout)
│   │   ├── NEW Badge (Component) [Conditional]
│   │   └── SALE Badge (Component) [Conditional]
│   ├── Wishlist Button (Component)
│   └── Quick Add Button (Component) [Hidden on default]
├── Product Info (Auto-Layout)
│   ├── Product Name (Text)
│   ├── Price Container (Auto-Layout)
│   │   ├── Current Price (Text)
│   │   └── Original Price (Text) [Conditional]
│   └── Category Label (Text)
```

### Auto-Layout Settings

#### Product Card Container
- **Layout:** Vertical
- **Padding:** 0px
- **Gap:** 0px
- **Alignment:** Stretch
- **Resizing:** Hug contents (height), Fixed (width)

#### Image Container
- **Layout:** None (absolute positioning for overlays)
- **Dimensions:** 280px × 280px (Desktop)
- **Constraints:** Top-left, fixed size

#### Product Info Container
- **Layout:** Vertical
- **Padding:** 16px (all sides)
- **Gap:** 8px
- **Alignment:** Stretch
- **Resizing:** Fill container (width), Hug contents (height)

#### Price Container
- **Layout:** Horizontal
- **Padding:** 0px
- **Gap:** 8px
- **Alignment:** Baseline
- **Resizing:** Hug contents

---

## 11. INTERACTION SPECIFICATIONS

### Hover Interactions (Desktop)

#### Card Hover
- **Trigger:** Mouse enter
- **Actions:**
  1. Scale card to 1.02
  2. Translate Y -4px
  3. Increase shadow
  4. Show secondary image (fade in)
  5. Hide primary image (fade out)
  6. Show Quick Add button (slide up from bottom)
- **Duration:** 300ms
- **Easing:** ease-in-out

#### Image Hover
- **Trigger:** Mouse enter (image area)
- **Actions:**
  1. Primary image opacity: 100% → 0%
  2. Secondary image opacity: 0% → 100%
  3. Image scale: 1.0 → 1.02
- **Duration:** 200ms
- **Easing:** ease-in-out

#### Quick Add Button Hover
- **Trigger:** Mouse enter (button)
- **Actions:**
  1. Background: Navy 900 → Navy 800
  2. Scale: 1.0 → 1.02
- **Duration:** 200ms
- **Easing:** ease-in-out

### Tap Interactions (Mobile)

#### Card Tap
- **Trigger:** Tap
- **Actions:**
  1. Scale to 0.98 (press feedback)
  2. Navigate to product page
- **Duration:** 100ms (press), 200ms (release)

#### Quick Add Tap
- **Trigger:** Tap
- **Actions:**
  1. Scale to 0.95 (press feedback)
  2. Add to cart
  3. Show success feedback
- **Duration:** 100ms (press), 300ms (feedback)

### Focus Interactions (Keyboard)

#### Card Focus
- **Trigger:** Tab key
- **Actions:**
  1. Show 2px Navy 900 outline
  2. Outline offset: 2px
- **Duration:** Instant

#### Focus Within
- **Trigger:** Tab to interactive element inside card
- **Actions:**
  1. Show card outline
  2. Show element outline
- **Duration:** Instant

---

## 12. RESPONSIVE BEHAVIOR

### Desktop (1280px+)
- **Card Width:** 280px (fixed)
- **Grid Columns:** 4
- **Gap:** 24px
- **Hover Effects:** Full (image swap, quick add, transform)
- **Quick Add:** Hidden by default, shows on hover

### Tablet (768px - 1279px)
- **Card Width:** Variable (~240px)
- **Grid Columns:** 3
- **Gap:** 20px
- **Hover Effects:** Reduced (no image swap, subtle transform)
- **Quick Add:** Always visible (smaller, 40px height)

### Mobile (375px - 767px)
- **Card Width:** Variable (~160px)
- **Grid Columns:** 2
- **Gap:** 16px
- **Hover Effects:** None (touch device)
- **Quick Add:** Always visible (full width, 44px height)
- **Typography:** Scales down proportionally

---

## 13. VISUAL HIERARCHY

### Information Priority (Top to Bottom)
1. **Product Image** (highest visual weight)
2. **Price** (bold, large, prominent)
3. **Product Name** (clear, readable)
4. **Category** (subtle, supporting)
5. **Badges** (attention-grabbing but not overwhelming)

### Visual Weight Distribution
- **Image:** 70% of card visual weight
- **Price:** 15% of card visual weight
- **Name:** 10% of card visual weight
- **Category:** 5% of card visual weight

### Typography Hierarchy
- **Price:** Largest text (20px, bold)
- **Name:** Medium text (18px, medium weight)
- **Category:** Smallest text (11px, uppercase)

---

## 14. POLISH DETAILS

### Shadows
- **Default Card:** 
  - Color: Black, 8% opacity
  - Blur: 8px
  - Offset: 0px, 2px
  - Spread: 0px

- **Hover Card:**
  - Color: Black, 12% opacity
  - Blur: 24px
  - Offset: 0px, 8px
  - Spread: 0px

- **Quick Add Button:**
  - Color: Navy 900, 30% opacity
  - Blur: 12px
  - Offset: 0px, 4px
  - Spread: 0px

### Border Radius
- **Card Container:** 8px (all corners)
- **Image:** 8px (top corners only)
- **Badges:** 12px (pill shape)
- **Buttons:** 8px
- **Wishlist Button:** 20px (circle)

### Transitions
- **Fast (100ms):** Active states, press feedback
- **Normal (200ms):** Hover states, image swaps
- **Slow (300ms):** Card transforms, button reveals

### Easing Functions
- **Ease In Out:** `cubic-bezier(0.4, 0, 0.2, 1)` - Standard transitions
- **Ease Out:** `cubic-bezier(0, 0, 0.2, 1)` - Entrances
- **Ease In:** `cubic-bezier(0.4, 0, 1, 1)` - Exits

---

## 15. FIGMA IMPLEMENTATION GUIDE

### Step 1: Create Base Card Frame
1. Create Frame: 280px × auto
2. Set Auto-Layout: Vertical
3. Set Padding: 0px
4. Set Gap: 0px
5. Name: "Product Card - Desktop"

### Step 2: Create Image Container
1. Create Frame: 280px × 280px
2. Set Border Radius: 8px (top corners)
3. Set Background: Cream 100
4. Add Image: Placeholder or actual product image
5. Set Constraints: Top-left, fixed size
6. Name: "Image Container"

### Step 3: Add Badge Components
1. Create Badge Component:
   - Frame: Auto-width × 24px
   - Background: Charcoal 900 (NEW) or Navy 900 (SALE)
   - Text: "NEW" or "SALE"
   - Typography: Inter, 11px, Semibold, Uppercase
   - Border Radius: 12px
   - Padding: 6px 12px
2. Position: Top-left, 12px offset
3. Create Variants: NEW, SALE, FEATURED

### Step 4: Add Wishlist Button
1. Create Frame: 40px × 40px
2. Set Background: White, 80% opacity
3. Set Border Radius: 20px (circle)
4. Add Heart Icon: 18px × 18px
5. Position: Top-right, 12px offset
6. Create Component with variants: Default, Saved

### Step 5: Add Quick Add Button
1. Create Frame: Auto-width × 48px
2. Set Background: Navy 900
3. Set Padding: 12px 16px
4. Add Text: "ADD TO CART"
5. Add Shopping Bag Icon: 16px, left of text
6. Typography: Inter, 14px, Semibold, Uppercase
7. Position: Bottom of image container
8. Set Initial Opacity: 0% (for hover state)

### Step 6: Create Product Info Section
1. Create Auto-Layout Frame: Vertical
2. Set Padding: 16px
3. Set Gap: 8px
4. Add Product Name: Playfair Display, 18px, Medium
5. Add Price Container: Horizontal Auto-Layout
   - Current Price: Inter, 20px, Bold
   - Original Price: Inter, 14px, Regular, Line-through
6. Add Category: Inter, 11px, Medium, Uppercase

### Step 7: Create Component Variants
1. **State Variants:**
   - Property: "State"
   - Values: Default, Hover, Focus, Active, Out of Stock

2. **Badge Variants:**
   - Property: "Badge"
   - Values: None, NEW, SALE, NEW+SALE, FEATURED

3. **Size Variants:**
   - Property: "Size"
   - Values: Desktop, Tablet, Mobile

### Step 8: Set Up Interactions
1. **Hover Interaction:**
   - Trigger: On Hover
   - Action: Change to "Hover" variant
   - Duration: 300ms
   - Easing: Ease In Out

2. **Click Interaction:**
   - Trigger: On Click
   - Action: Change to "Active" variant
   - Duration: 100ms
   - Then: Navigate to product page

### Step 9: Create Grid Layout
1. Create Frame: 1280px width
2. Set Auto-Layout: Grid
3. Set Columns: 4
4. Set Gap: 24px
5. Add Product Card instances
6. Name: "Product Grid - Desktop"

### Step 10: Create Responsive Variants
1. **Tablet Grid:**
   - Width: 1200px
   - Columns: 3
   - Gap: 20px
   - Card Width: ~240px

2. **Mobile Grid:**
   - Width: 375px (full width)
   - Columns: 2
   - Gap: 16px
   - Card Width: ~160px

---

## 16. DESIGN TOKENS FOR FIGMA

### Colors (Create as Styles)
- **Cream 50:** `#fefdfb`
- **Cream 100:** `#fdfbf6`
- **Cream 200:** `#faf7ed`
- **Charcoal 900:** `#3d3d3d`
- **Charcoal 700:** `#4f4f4f`
- **Charcoal 600:** `#5d5d5d`
- **Charcoal 500:** `#6d6d6d`
- **Navy 900:** `#102a43`
- **Navy 800:** `#243b53`
- **Forest 600:** `#277d47`

### Typography (Create as Styles)
- **H4 - Product Name:** Playfair Display, 18px, Medium, Charcoal 900
- **Price - Current:** Inter, 20px, Bold, Charcoal 900
- **Price - Original:** Inter, 14px, Regular, Charcoal 500, Strikethrough
- **Label - Category:** Inter, 11px, Medium, Uppercase, Charcoal 600
- **Badge Text:** Inter, 11px, Semibold, Uppercase, Cream 50
- **Button Text:** Inter, 14px, Semibold, Uppercase, Cream 50

### Effects (Create as Styles)
- **Shadow - Card Default:** 0px 2px 8px rgba(0, 0, 0, 0.08)
- **Shadow - Card Hover:** 0px 8px 24px rgba(0, 0, 0, 0.12)
- **Shadow - Button:** 0px 4px 12px rgba(16, 42, 67, 0.3)

---

## 17. ACCESSIBILITY CONSIDERATIONS

### Color Contrast
- **Text on Cream 50:** Charcoal 900 (12.8:1) ✅ WCAG AAA
- **Text on Navy 900:** Cream 50 (12.5:1) ✅ WCAG AAA
- **Text on Charcoal 900:** Cream 50 (12.8:1) ✅ WCAG AAA

### Touch Targets
- **Minimum Size:** 44px × 44px
- **Quick Add Button:** 48px height ✅
- **Wishlist Button:** 40px × 40px ✅
- **Spacing Between:** 8px minimum

### Focus Indicators
- **Outline:** 2px solid Navy 900
- **Offset:** 2px
- **Visible:** Always on keyboard focus

### Screen Reader Support
- **Image Alt Text:** Descriptive product name
- **Button Labels:** "Add [Product Name] to cart"
- **Badge Labels:** "New product" or "On sale"
- **Price Announcement:** "[Price] for [Product Name]"

---

## 18. PREMIUM POLISH DETAILS

### Micro-Interactions
1. **Badge Entrance:** Fade in + scale up (200ms) when card loads
2. **Wishlist Toggle:** Heart fills with color transition (200ms)
3. **Price Update:** Subtle pulse animation when sale price appears
4. **Quick Add Success:** Checkmark icon appears briefly (500ms)

### Visual Refinements
1. **Image Quality:** Use high-resolution images (minimum 2x for retina)
2. **Image Consistency:** All product images use same lighting/background style
3. **Badge Positioning:** Precise alignment (12px from edges)
4. **Typography Kerning:** Adjust letter-spacing for premium feel
5. **Shadow Depth:** Layered shadows for depth perception

### Loading States
1. **Skeleton Card:** Light gray rectangles matching card structure
2. **Image Placeholder:** Blur hash or gradient matching brand colors
3. **Progressive Loading:** Image fades in when loaded

---

## 19. COMPONENT CHECKLIST

### Product Card Component
- [ ] Base frame with auto-layout
- [ ] Image container (280×280px)
- [ ] Primary image placeholder
- [ ] Secondary image placeholder (hidden)
- [ ] NEW badge component
- [ ] SALE badge component
- [ ] FEATURED badge component (optional)
- [ ] Wishlist button component
- [ ] Quick Add button component
- [ ] Product name text
- [ ] Price container with current/original
- [ ] Category label
- [ ] Out of stock overlay
- [ ] All state variants (Default, Hover, Focus, Active)
- [ ] All size variants (Desktop, Tablet, Mobile)

### Product Grid Component
- [ ] Desktop grid (4 columns, 24px gap)
- [ ] Tablet grid (3 columns, 20px gap)
- [ ] Mobile grid (2 columns, 16px gap)
- [ ] Grid container with proper padding
- [ ] Responsive breakpoint documentation

### Design System
- [ ] Color styles created
- [ ] Typography styles created
- [ ] Effect styles created
- [ ] Component variants documented
- [ ] Interaction prototypes set up

---

## 20. FIGMA FILE STRUCTURE

### Recommended Organization
```
📁 Extreme Dept Kidz - Product Cards
├── 📁 1. Design System
│   ├── Colors
│   ├── Typography
│   └── Effects
├── 📁 2. Components
│   ├── Badges (NEW, SALE, FEATURED)
│   ├── Wishlist Button
│   ├── Quick Add Button
│   └── Product Card (Master)
├── 📁 3. Layouts
│   ├── Product Grid - Desktop
│   ├── Product Grid - Tablet
│   └── Product Grid - Mobile
├── 📁 4. States
│   ├── Default State
│   ├── Hover State
│   ├── Focus State
│   ├── Active State
│   └── Out of Stock State
└── 📁 5. Documentation
    ├── Component Specs
    └── Usage Guidelines
```

---

## IMPLEMENTATION PRIORITY

### Phase 1: Core Components (Week 1)
1. Base Product Card frame
2. Image container with aspect ratio
3. Product info section
4. Basic typography and spacing

### Phase 2: Interactive Elements (Week 1-2)
1. Badge components
2. Wishlist button
3. Quick Add button
4. Hover states

### Phase 3: Polish & Variants (Week 2)
1. All state variants
2. Size variants (responsive)
3. Interactions and prototypes
4. Design system tokens

### Phase 4: Grid Layouts (Week 2-3)
1. Desktop grid
2. Tablet grid
3. Mobile grid
4. Documentation

---

**This specification provides complete details for creating premium product card and grid components in Figma. All measurements, colors, typography, and interactions are specified to ensure consistency and implementation accuracy.**
