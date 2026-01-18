# Figma Header & Navigation Redesign Specification
## Extreme Dept Kidz - Premium Kids Fashion

**Version:** 1.0  
**Purpose:** Complete design specification for header and navigation components in Figma  
**Focus:** Strong brand presence, clear hierarchy, mobile-friendly, sticky behavior

---

## DESIGN GOALS

### Primary Objectives
1. **Strong Brand Presence:** Logo prominent, brand identity clear
2. **Clear Category Hierarchy:** BOYS emphasized, logical navigation flow
3. **Mobile-Friendly:** Touch-optimized, accessible navigation
4. **Sticky Header:** Smooth scroll behavior, maintains usability

### Brand Positioning
- **Primary Focus:** Boys' premium streetwear (emphasized in navigation)
- **Visual Tone:** Premium, confident, sophisticated
- **User Experience:** Intuitive, fast, accessible

---

## 1. TOP BAR COMPONENT

### Desktop Specifications

#### Dimensions
- **Height:** 32px (fixed)
- **Width:** Full width
- **Position:** Fixed top, above main header
- **Z-Index:** 60 (above header)

#### Styling
- **Background:** Charcoal 900 (`#1a1a1a`)
- **Text Color:** Cream 50 (`#fefdfb`)
- **Border:** Bottom border, Charcoal 800, 1px, 50% opacity
- **Padding:** 8px vertical, 32px horizontal (container)

#### Content Layout
```
┌─────────────────────────────────────────────────────────┐
│  Top Bar (32px height, full width)                    │
│  ┌─────────────────────┐      ┌─────────────────────┐ │
│  │ Left: Utility Links │      │ Right: Tagline      │ │
│  │ - Free Shipping     │      │ "Premium Streetwear │ │
│  │ - Customer Care     │      │  for Young Legends"│ │
│  │ - Track Order       │      │                     │ │
│  └─────────────────────┘      └─────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### Typography
- **Font:** Inter (Sans-serif)
- **Size:** 11px (Desktop), 10px (Mobile)
- **Weight:** Regular (400)
- **Line Height:** 1.4
- **Letter Spacing:** 0

#### Links
- **Spacing:** 16px gap between links
- **Icon Size:** 12px × 12px
- **Icon-Text Gap:** 4px
- **Hover:** Cream 200 color, transition 200ms

#### Responsive Behavior
- **Desktop:** All links visible
- **Tablet:** Hide "Track Order" link
- **Mobile:** Show only "Free Shipping" link, hide tagline

---

## 2. MAIN HEADER - DESKTOP

### Base Specifications

#### Dimensions
- **Default Height:** 88px (5.5rem)
- **Scrolled Height:** 72px (4.5rem)
- **Width:** Full width
- **Position:** Fixed, below Top Bar
- **Top Offset:** 32px (Top Bar height)
- **Z-Index:** 50

#### Container
- **Max Width:** 1280px (centered)
- **Padding:** 32px horizontal (Desktop), 24px (Tablet), 16px (Mobile)
- **Background (Default):** Cream 50, 95% opacity, backdrop-blur-sm
- **Background (Scrolled):** Cream 50, 95% opacity, backdrop-blur-md, border-bottom

#### Border & Shadow
- **Default:** No border, no shadow
- **Scrolled:** 
  - Border: Bottom, 1px, Cream 200, 50% opacity
  - Shadow: 0 2px 8px rgba(0, 0, 0, 0.08)

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Header Container (1280px max, centered)                │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Logo    │  │  Navigation  │  │  Actions    │     │
│  │          │  │  (Nav Links) │  │  (Icons)    │     │
│  └──────────┘  └──────────────┘  └──────────────┘     │
│  (Flex: space-between, items-center)                    │
└─────────────────────────────────────────────────────────┘
```

### Logo Section

#### Dimensions
- **Default Height:** 112px (7rem)
- **Scrolled Height:** 80px (5rem)
- **Width:** Auto (maintains aspect ratio)
- **Max Width:** 420px (Desktop), 360px (Tablet), 280px (Mobile)

#### Styling
- **Image:** High-quality logo image
- **Aspect Ratio:** Maintain original (2800×480)
- **Object Fit:** Contain
- **Hover:** Scale 1.02, transition 200ms

#### Positioning
- **Alignment:** Left, vertically centered
- **Flex Shrink:** 0 (prevents compression)

### Navigation Section

#### Dimensions
- **Height:** Match header height
- **Width:** Auto (flexible)
- **Alignment:** Center (between logo and actions)

#### Navigation Links
- **Spacing:** 32px gap between links (Desktop), 24px (Large Desktop)
- **Typography:**
  - Font: Inter (Sans-serif)
  - Size: 11px
  - Weight: Semibold (600) for regular, Bold (700) for emphasized
  - Letter Spacing: 1px
  - Text Transform: Uppercase
- **Colors:**
  - Default: Charcoal 700 (`#4f4f4f`)
  - Emphasized (BOYS): Navy 900 (`#102a43`)
  - Hover: Charcoal 900 (`#3d3d3d`)
  - Active: Navy 900

#### Nav Link Structure
```
┌─────────────────────────────────────┐
│  Nav Link Container                 │
│  ┌───────────────────────────────┐ │
│  │  Link Text                    │ │
│  │  (11px, uppercase, semibold)  │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │  Underline (animated)         │ │
│  │  (2px height, Navy 900)      │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Hover Animation
- **Underline:** Width 0 → 100%, centered → left-aligned
- **Text:** Translate Y -1px (subtle lift)
- **Duration:** 400ms
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)`

#### Emphasized Link (BOYS)
- **Color:** Navy 900 (always)
- **Weight:** Bold (700)
- **Underline:** Always visible (2px, Navy 900)

### Actions Section

#### Dimensions
- **Height:** Match header height
- **Width:** Auto
- **Alignment:** Right, vertically centered
- **Spacing:** 16px gap between icons (Desktop), 12px (Tablet)

#### Icon Buttons
- **Size:** 40px × 40px (touch-friendly)
- **Padding:** 8px
- **Icon Size:** 20px × 20px
- **Border Radius:** 8px
- **Background:** Transparent
- **Color:** Charcoal 700 (default), Charcoal 900 (hover)

#### Icon Button States
- **Default:** Transparent background, Charcoal 700 icon
- **Hover:** Cream 200 background, Charcoal 900 icon
- **Active:** Scale 0.95
- **Focus:** 2px Navy 900 outline, 2px offset

#### Cart Badge
- **Position:** Top-right of cart icon
- **Size:** 20px × 20px (minimum)
- **Background:** Navy 900
- **Text Color:** Cream 50
- **Typography:** Inter, 10px, Medium
- **Border Radius:** 10px (circle)
- **Animation:** Scale 0 → 1 (spring animation)

---

## 3. MEGA MENU - DESKTOP

### Specifications

#### Dimensions
- **Width:** Full width (100vw)
- **Height:** Auto (content-based, ~400px typical)
- **Position:** Absolute, below header
- **Top Offset:** Header height
- **Z-Index:** 45

#### Styling
- **Background:** White (`#ffffff`)
- **Border:** Top, 2px, Cream 200
- **Shadow:** 0 10px 40px rgba(0, 0, 0, 0.15)
- **Backdrop:** Charcoal 900, 30% opacity, backdrop-blur-sm

#### Container
- **Max Width:** 1280px (centered)
- **Padding:** 48px vertical, 32px horizontal

### Content Layout

```
┌─────────────────────────────────────────────────────────┐
│  Mega Menu Container (1280px max, centered)             │
│                                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ New  │ │ Tops │ │Bottoms│ │Outer │ │Acces.│       │
│  │      │ │      │ │      │ │wear  │ │      │       │
│  │[Img] │ │[Img] │ │[Img] │ │[Img] │ │[Img] │       │
│  │      │ │      │ │      │ │      │ │      │       │
│  │Title │ │Title │ │Title │ │Title │ │Title │       │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │
│  (5 columns, 24px gap)                                 │
│                                                         │
│  ─────────────────────────────────────────────         │
│  [View All Boys' Collection] →                         │
└─────────────────────────────────────────────────────────┘
```

#### Category Cards
- **Aspect Ratio:** 4:5 (portrait)
- **Border Radius:** 8px
- **Image:** Full bleed with gradient overlay
- **Title:** Bottom-aligned, 18px, Playfair Display, Semibold
- **Hover:** Scale 1.05, brightness increase

#### Grid Layout
- **Columns:** 5 (Desktop), 3 (Tablet)
- **Gap:** 24px
- **Card Height:** ~320px (based on width)

#### Footer Link
- **Typography:** Inter, 14px, Medium
- **Color:** Charcoal 700, Navy 900 on hover
- **Icon:** Chevron right, 16px
- **Spacing:** 32px top padding, border-top separator

### Animation
- **Entrance:** Fade in + slide down (300ms)
- **Exit:** Fade out + slide up (200ms)
- **Stagger:** 50ms delay between cards

---

## 4. MOBILE HEADER

### Base Specifications

#### Dimensions
- **Default Height:** 72px (4.5rem)
- **Scrolled Height:** 64px (4rem)
- **Width:** Full width
- **Position:** Fixed top
- **Z-Index:** 50

#### Container
- **Padding:** 16px horizontal
- **Background:** Same as desktop (Cream 50, 95% opacity)
- **Border & Shadow:** Same as desktop scrolled state

### Layout Structure

```
┌─────────────────────────────────────┐
│  Mobile Header (full width)          │
│  ┌──────┐              ┌──────────┐ │
│  │ Logo │              │ Actions  │ │
│  │      │              │ [Menu]   │ │
│  └──────┘              └──────────┘ │
│  (Flex: space-between)              │
└─────────────────────────────────────┘
```

#### Logo (Mobile)
- **Height:** 48px (default), 40px (scrolled)
- **Max Width:** 200px
- **Alignment:** Left, vertically centered

#### Menu Button
- **Size:** 48px × 48px (touch-friendly)
- **Icon:** Menu (hamburger), 24px × 24px
- **Color:** Charcoal 900
- **Background:** Transparent, Cream 200 on hover
- **Border Radius:** 8px

#### Actions (Mobile - Hidden)
- **Search, Account, Cart:** Hidden in header
- **Accessible via:** Mobile navigation drawer

---

## 5. MOBILE NAVIGATION DRAWER

### Specifications

#### Dimensions
- **Width:** 100% (small screens), 384px max (tablets)
- **Height:** Full viewport height
- **Position:** Fixed, right side
- **Z-Index:** 50

#### Styling
- **Background:** Cream 50 (`#fefdfb`)
- **Shadow:** 0 25px 50px rgba(0, 0, 0, 0.25)
- **Backdrop:** Charcoal 900, 40% opacity, backdrop-blur-md

### Layout Structure

```
┌─────────────────────────┐
│  Mobile Nav Drawer      │
│  ┌───────────────────┐ │
│  │ Header             │ │
│  │ [Menu] [Close]    │ │
│  ├───────────────────┤ │
│  │ Navigation Links   │ │
│  │ - BOYS            │ │
│  │ - NEW ARRIVALS    │ │
│  │ - GIRLS           │ │
│  │ - COLLECTIONS     │ │
│  │ - About           │ │
│  │ - Contact         │ │
│  ├───────────────────┤ │
│  │ Footer Actions    │ │
│  │ - Account         │ │
│  │ - Cart (3)        │ │
│  └───────────────────┘ │
└─────────────────────────┘
```

### Header Section
- **Height:** 72px
- **Padding:** 24px
- **Border:** Bottom, 1px, Cream 200
- **Layout:** Flex, space-between, items-center

#### Title
- **Typography:** Playfair Display, 20px, Bold
- **Color:** Charcoal 900
- **Text:** "Menu"

#### Close Button
- **Size:** 48px × 48px
- **Icon:** X, 24px × 24px
- **Color:** Charcoal 900, Navy 900 on hover
- **Background:** Transparent, Cream 200 on hover

### Navigation Links Section
- **Padding:** 48px vertical, 24px horizontal
- **Spacing:** 32px gap between links
- **Scrollable:** Yes (if content overflows)

#### Link Styling
- **Typography:** Playfair Display, 24px, Semibold
- **Color:** Charcoal 900 (default), Navy 900 (emphasized/hover)
- **Weight:** Bold (700) for emphasized (BOYS)
- **Padding:** 8px vertical
- **Touch Target:** Minimum 48px height

### Footer Actions Section
- **Padding:** 24px
- **Border:** Top, 1px, Cream 200
- **Spacing:** 12px gap between items

#### Action Items
- **Typography:** Inter, 18px, Medium
- **Icon Size:** 20px × 20px
- **Icon-Text Gap:** 16px
- **Touch Target:** Minimum 48px height
- **Layout:** Flex, items-center, full width

#### Cart Badge (in drawer)
- **Size:** 24px × 24px
- **Background:** Navy 900
- **Text:** Cream 50, 12px, Medium
- **Position:** Right-aligned in action item

### Animation
- **Entrance:** Slide in from right (400ms, spring)
- **Exit:** Slide out to right (300ms, ease)
- **Backdrop:** Fade in/out (300ms)
- **Link Stagger:** 80ms delay between links

---

## 6. BOTTOM NAVIGATION BAR (MOBILE)

### Specifications

#### Dimensions
- **Height:** 64px (fixed)
- **Width:** Full width
- **Position:** Fixed bottom
- **Z-Index:** 50

#### Styling
- **Background:** Cream 50, 98% opacity, backdrop-blur-md
- **Border:** Top, 1px, Cream 200
- **Shadow:** 0 -4px 12px rgba(0, 0, 0, 0.08)

### Layout Structure

```
┌─────────────────────────────────────┐
│  Bottom Nav Bar (64px height)       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│  │Shop│ │Srch│ │Cart│ │Acct│     │
│  │Icon│ │Icon│ │Icon│ │Icon│     │
│  │Text│ │Text│ │Text│ │Text│     │
│  └────┘ └────┘ └────┘ └────┘     │
│  (4 equal columns)                  │
└─────────────────────────────────────┘
```

#### Navigation Items
- **Layout:** 4 equal columns
- **Touch Target:** Full column width, 64px height
- **Padding:** 8px vertical, 4px horizontal
- **Alignment:** Center (icon + text)

#### Icons
- **Size:** 24px × 24px
- **Color:** Charcoal 600 (default), Navy 900 (active)
- **Spacing:** 4px gap below icon

#### Labels
- **Typography:** Inter, 10px, Medium
- **Color:** Charcoal 600 (default), Navy 900 (active)
- **Text Transform:** None

#### Active State
- **Icon:** Navy 900 color
- **Label:** Navy 900 color, Medium weight
- **Indicator:** Optional subtle background (Cream 200)

#### Cart Badge
- **Position:** Top-right of cart icon
- **Size:** 18px × 18px
- **Background:** Navy 900
- **Text:** Cream 50, 9px, Medium
- **Border Radius:** 9px (circle)

---

## 7. STICKY HEADER BEHAVIOR

### Scroll States

#### State 1: At Top (Default)
- **Position:** Fixed, 32px from top (below Top Bar)
- **Height:** 88px (Desktop), 72px (Mobile)
- **Background:** Cream 50, 95% opacity, backdrop-blur-sm
- **Border:** None
- **Shadow:** None
- **Logo Height:** 112px (Desktop), 48px (Mobile)

#### State 2: Scrolled (>20px)
- **Position:** Fixed, 0px from top (Top Bar hidden or compressed)
- **Height:** 72px (Desktop), 64px (Mobile)
- **Background:** Cream 50, 95% opacity, backdrop-blur-md
- **Border:** Bottom, 1px, Cream 200, 50% opacity
- **Shadow:** 0 2px 8px rgba(0, 0, 0, 0.08)
- **Logo Height:** 80px (Desktop), 40px (Mobile)

### Transition Animation
- **Duration:** 300ms
- **Easing:** `ease-in-out`
- **Properties:** Height, background blur, border, shadow

### Top Bar Behavior (Optional)
- **Option A:** Hide on scroll (fade out)
- **Option B:** Compress to 24px height
- **Option C:** Keep visible (recommended for trust signals)

---

## 8. NAVIGATION HIERARCHY

### Primary Navigation (Desktop)

#### Link Order & Emphasis
1. **BOYS** (Emphasized)
   - Color: Navy 900
   - Weight: Bold (700)
   - Underline: Always visible
   - Mega Menu: Yes

2. **NEW ARRIVALS**
   - Color: Charcoal 700
   - Weight: Semibold (600)
   - Underline: On hover
   - Mega Menu: No

3. **GIRLS**
   - Color: Charcoal 700
   - Weight: Semibold (600)
   - Underline: On hover
   - Mega Menu: No (optional)

4. **COLLECTIONS**
   - Color: Charcoal 700
   - Weight: Semibold (600)
   - Underline: On hover
   - Mega Menu: No

### Secondary Navigation (Mobile Drawer)

#### Link Order
1. BOYS (Emphasized)
2. NEW ARRIVALS
3. GIRLS
4. COLLECTIONS
5. About
6. Contact

#### Visual Hierarchy
- **Primary Links:** 24px, Playfair Display, Semibold
- **Secondary Links:** 20px, Playfair Display, Medium
- **Spacing:** 32px between primary, 24px between secondary

---

## 9. SEARCH FUNCTIONALITY

### Search Icon Button
- **Size:** 40px × 40px
- **Icon:** Search, 20px × 20px
- **Position:** Actions section (right side)
- **Color:** Charcoal 700, Charcoal 900 on hover

### Search Overlay (Desktop)
- **Position:** Fixed, full screen
- **Background:** Charcoal 900, 80% opacity, backdrop-blur-md
- **Z-Index:** 60
- **Content:** Centered search input, recent searches, suggestions

### Search Input
- **Width:** 600px max (Desktop), full width (Mobile)
- **Height:** 64px
- **Background:** White
- **Border:** 2px, Navy 900
- **Border Radius:** 8px
- **Typography:** Inter, 18px, Regular
- **Padding:** 20px horizontal

---

## 10. FIGMA COMPONENT STRUCTURE

### Master Components

#### 1. Top Bar Component
- **Variants:**
  - State: Default, Scrolled
  - Size: Desktop, Tablet, Mobile

#### 2. Header Component
- **Variants:**
  - State: Default, Scrolled
  - Size: Desktop, Tablet, Mobile
  - Mega Menu: Open, Closed

#### 3. Nav Link Component
- **Variants:**
  - State: Default, Hover, Active, Focus
  - Emphasis: Normal, Emphasized (BOYS)

#### 4. Mega Menu Component
- **Variants:**
  - State: Open, Closed
  - Size: Desktop, Tablet

#### 5. Mobile Nav Drawer Component
- **Variants:**
  - State: Open, Closed

#### 6. Bottom Nav Bar Component (Mobile)
- **Variants:**
  - Active Item: Shop, Search, Cart, Account

### Component Layers

#### Header Structure
```
Header (Frame)
├── Top Bar (Component)
├── Main Header (Frame)
│   ├── Logo (Image/Link)
│   ├── Navigation (Auto-Layout)
│   │   ├── Nav Link - BOYS (Component)
│   │   ├── Nav Link - NEW ARRIVALS (Component)
│   │   ├── Nav Link - GIRLS (Component)
│   │   └── Nav Link - COLLECTIONS (Component)
│   └── Actions (Auto-Layout)
│       ├── Search Button (Component)
│       ├── Account Link (Component)
│       └── Cart Button (Component)
└── Mega Menu (Component) [Conditional]
```

---

## 11. RESPONSIVE BREAKPOINTS

### Desktop (1280px+)
- **Header Height:** 88px (default), 72px (scrolled)
- **Logo Height:** 112px (default), 80px (scrolled)
- **Navigation:** Visible, horizontal
- **Actions:** All icons visible
- **Mega Menu:** Full width, 5 columns

### Tablet (768px - 1279px)
- **Header Height:** 80px (default), 64px (scrolled)
- **Logo Height:** 96px (default), 64px (scrolled)
- **Navigation:** Hidden (use mobile menu)
- **Actions:** Search + Cart visible
- **Mega Menu:** 3 columns (if shown)

### Mobile (375px - 767px)
- **Header Height:** 72px (default), 64px (scrolled)
- **Logo Height:** 48px (default), 40px (scrolled)
- **Navigation:** Hidden (drawer only)
- **Actions:** Menu button only
- **Bottom Nav:** Visible

---

## 12. INTERACTION SPECIFICATIONS

### Hover Interactions (Desktop)

#### Nav Link Hover
- **Trigger:** Mouse enter
- **Actions:**
  1. Text color: Charcoal 700 → Charcoal 900
  2. Underline: Width 0 → 100%, centered → left
  3. Text translate: Y 0 → Y -1px
- **Duration:** 400ms
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)`

#### Icon Button Hover
- **Trigger:** Mouse enter
- **Actions:**
  1. Background: Transparent → Cream 200
  2. Icon color: Charcoal 700 → Charcoal 900
- **Duration:** 200ms
- **Easing:** ease-in-out

#### Logo Hover
- **Trigger:** Mouse enter
- **Actions:**
  1. Scale: 1.0 → 1.02
- **Duration:** 200ms
- **Easing:** ease-in-out

### Scroll Interactions

#### Header Scroll
- **Trigger:** Scroll > 20px
- **Actions:**
  1. Height: 88px → 72px
  2. Background blur: sm → md
  3. Border: None → Bottom border
  4. Shadow: None → Shadow
  5. Logo height: 112px → 80px
- **Duration:** 300ms
- **Easing:** ease-in-out

### Tap Interactions (Mobile)

#### Menu Button Tap
- **Trigger:** Tap
- **Actions:**
  1. Scale: 1.0 → 0.95 (press)
  2. Open drawer (slide in)
- **Duration:** 100ms (press), 400ms (drawer)

#### Nav Link Tap (Mobile)
- **Trigger:** Tap
- **Actions:**
  1. Navigate to page
  2. Close drawer
- **Duration:** 200ms

---

## 13. ACCESSIBILITY SPECIFICATIONS

### Keyboard Navigation
- **Tab Order:** Logo → Nav Links → Actions
- **Focus Indicator:** 2px Navy 900 outline, 2px offset
- **Skip Link:** "Skip to main content" (visible on focus)

### Screen Reader Support
- **Nav Label:** "Main navigation"
- **Link Labels:** Descriptive (e.g., "Shop Boys collection")
- **Button Labels:** "Search products", "View account", "Shopping cart"
- **Menu State:** `aria-expanded` on menu button

### Touch Targets
- **Minimum Size:** 44px × 44px
- **Spacing:** 8px minimum between targets
- **Mobile Menu Links:** 48px height minimum

---

## 14. PREMIUM POLISH DETAILS

### Visual Refinements
1. **Backdrop Blur:** Subtle glassmorphism effect
2. **Shadow Depth:** Layered shadows for elevation
3. **Smooth Transitions:** All state changes animated
4. **Precise Alignment:** Pixel-perfect spacing
5. **Brand Consistency:** Logo always prominent

### Micro-Interactions
1. **Nav Link Underline:** Smooth width animation
2. **Cart Badge:** Spring animation on add
3. **Menu Button:** Icon rotation on open/close
4. **Mega Menu:** Staggered card entrance

### Performance
1. **Backdrop Blur:** Use CSS `backdrop-filter` (hardware accelerated)
2. **Animations:** Use `transform` and `opacity` (GPU accelerated)
3. **Lazy Loading:** Mega menu images load on hover

---

## 15. FIGMA IMPLEMENTATION GUIDE

### Step 1: Create Top Bar
1. Frame: Full width × 32px
2. Background: Charcoal 900
3. Auto-Layout: Horizontal, space-between
4. Add utility links (left) and tagline (right)
5. Create component with variants

### Step 2: Create Header Base
1. Frame: Full width × 88px (default)
2. Background: Cream 50, 95% opacity
3. Auto-Layout: Horizontal, space-between, center-aligned
4. Set constraints: Left-right, top
5. Name: "Header - Desktop"

### Step 3: Add Logo
1. Place logo image
2. Set height: 112px (default), 80px (scrolled)
3. Set constraints: Left, center vertically
4. Add hover interaction: Scale 1.02

### Step 4: Create Nav Links
1. Auto-Layout: Horizontal, 32px gap
2. Create Nav Link component:
   - Text: Inter, 11px, Semibold, Uppercase
   - Underline: 2px height, Navy 900, animated
3. Create variants: Default, Hover, Active, Emphasized
4. Add hover interaction: Underline animation

### Step 5: Create Actions Section
1. Auto-Layout: Horizontal, 16px gap
2. Create Icon Button component:
   - Size: 40px × 40px
   - Icon: 20px × 20px
   - States: Default, Hover, Active, Focus
3. Add cart badge component

### Step 6: Create Mega Menu
1. Frame: Full width, auto height
2. Background: White
3. Grid: 5 columns, 24px gap
4. Create category card component
5. Add footer link section
6. Set up open/close animation

### Step 7: Create Mobile Header
1. Frame: Full width × 72px
2. Auto-Layout: Horizontal, space-between
3. Logo: 48px height
4. Menu button: 48px × 48px
5. Create component with scrolled variant

### Step 8: Create Mobile Nav Drawer
1. Frame: 384px width, full height
2. Background: Cream 50
3. Auto-Layout: Vertical
4. Sections: Header, Navigation, Footer
5. Add slide-in animation

### Step 9: Create Bottom Nav Bar
1. Frame: Full width × 64px
2. Auto-Layout: Horizontal, equal columns
3. Create nav item component:
   - Icon: 24px
   - Label: 10px
   - States: Default, Active
4. Add cart badge

### Step 10: Set Up Interactions
1. **Header Scroll:**
   - Trigger: Scroll > 20px
   - Action: Change to "Scrolled" variant

2. **Nav Link Hover:**
   - Trigger: On Hover
   - Action: Change to "Hover" variant

3. **Mega Menu:**
   - Trigger: Hover on BOYS link
   - Action: Show Mega Menu

4. **Mobile Menu:**
   - Trigger: Click menu button
   - Action: Open drawer (slide in)

---

## 16. DESIGN TOKENS

### Colors
- **Cream 50:** `#fefdfb` (Header background)
- **Cream 200:** `#faf7ed` (Borders, hover backgrounds)
- **Charcoal 700:** `#4f4f4f` (Nav link default)
- **Charcoal 900:** `#3d3d3d` (Nav link hover, text)
- **Navy 900:** `#102a43` (Emphasized link, accents)
- **Charcoal 950:** `#1a1a1a` (Top bar, overlays)

### Typography
- **Nav Link:** Inter, 11px, Semibold, Uppercase, 1px letter-spacing
- **Nav Link Emphasized:** Inter, 11px, Bold, Uppercase
- **Mobile Nav Link:** Playfair Display, 24px, Semibold
- **Top Bar Text:** Inter, 11px, Regular
- **Bottom Nav Label:** Inter, 10px, Medium

### Spacing
- **Header Padding:** 32px horizontal (Desktop)
- **Nav Link Gap:** 32px (Desktop), 24px (Large Desktop)
- **Icon Button Gap:** 16px (Desktop), 12px (Tablet)
- **Mega Menu Padding:** 48px vertical, 32px horizontal
- **Mobile Drawer Padding:** 24px horizontal

### Effects
- **Backdrop Blur:** `blur(8px)` (default), `blur(12px)` (scrolled)
- **Shadow Default:** None
- **Shadow Scrolled:** 0 2px 8px rgba(0, 0, 0, 0.08)
- **Mega Menu Shadow:** 0 10px 40px rgba(0, 0, 0, 0.15)

---

## 17. RESPONSIVE LAYOUTS

### Desktop Layout (1920px)
```
┌─────────────────────────────────────────────────────────┐
│  Top Bar (32px)                                          │
├─────────────────────────────────────────────────────────┤
│  Header (88px → 72px on scroll)                         │
│  [Logo] [BOYS NEW ARRIVALS GIRLS COLLECTIONS] [Icons]  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Mega Menu (when BOYS hovered)                      │ │
│  │ [5 category cards with images]                     │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Tablet Layout (1024px)
```
┌─────────────────────────────────────┐
│  Top Bar (32px)                      │
├─────────────────────────────────────┤
│  Header (80px → 64px on scroll)     │
│  [Logo]                    [Menu]  │
└─────────────────────────────────────┘
```

### Mobile Layout (375px)
```
┌─────────────────────┐
│  Top Bar (32px)     │
├─────────────────────┤
│  Header (72px)      │
│  [Logo]    [Menu]   │
├─────────────────────┤
│                     │
│  [Page Content]     │
│                     │
├─────────────────────┤
│  Bottom Nav (64px)  │
│  [Shop][Srch][Cart] │
└─────────────────────┘
```

---

## 18. COMPONENT CHECKLIST

### Top Bar
- [ ] Base frame with auto-layout
- [ ] Utility links (left side)
- [ ] Tagline (right side)
- [ ] Responsive variants
- [ ] Hover states

### Desktop Header
- [ ] Base frame with auto-layout
- [ ] Logo component
- [ ] Navigation section
- [ ] Nav link components (4 links)
- [ ] Actions section
- [ ] Icon button components
- [ ] Cart badge component
- [ ] Scrolled state variant
- [ ] Default state variant

### Mega Menu
- [ ] Container frame
- [ ] Category card components (5 cards)
- [ ] Footer link section
- [ ] Open/closed variants
- [ ] Hover interactions

### Mobile Header
- [ ] Base frame
- [ ] Logo (mobile size)
- [ ] Menu button
- [ ] Scrolled variant

### Mobile Nav Drawer
- [ ] Drawer frame
- [ ] Header section
- [ ] Navigation links (6 links)
- [ ] Footer actions
- [ ] Open/closed variants
- [ ] Slide animation

### Bottom Nav Bar
- [ ] Bar frame
- [ ] Nav item components (4 items)
- [ ] Active state variants
- [ ] Cart badge

---

## 19. IMPLEMENTATION PRIORITY

### Phase 1: Foundation (Week 1)
1. Top Bar component
2. Desktop header base
3. Logo component
4. Nav link components

### Phase 2: Navigation (Week 1-2)
1. Navigation section
2. Actions section
3. Mega menu component
4. Hover interactions

### Phase 3: Mobile (Week 2)
1. Mobile header
2. Mobile nav drawer
3. Bottom nav bar
4. Touch interactions

### Phase 4: Polish (Week 2-3)
1. Scroll behavior
2. Animations
3. Responsive variants
4. Documentation

---

**This specification provides complete details for creating premium header and navigation components in Figma. All measurements, states, interactions, and responsive behaviors are specified to ensure consistency and implementation accuracy.**
