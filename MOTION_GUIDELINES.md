# Motion Guidelines & Micro-Interactions
## Extreme Dept Kidz Design System

**Version:** 1.0  
**Purpose:** Subtle, performance-friendly animation guidelines for consistent micro-interactions  
**Principle:** Motion should enhance, not distract

---

## 🎯 CORE PRINCIPLES

### Animation Philosophy
1. **Subtle & Refined:** Animations should feel premium, not flashy
2. **Performance First:** Use GPU-accelerated properties (transform, opacity)
3. **Purposeful:** Every animation should have a clear purpose
4. **Accessible:** Respect `prefers-reduced-motion`
5. **Fast:** Keep durations short (100-300ms for interactions)

### Performance Rules
- ✅ **Use:** `transform`, `opacity`, `filter`
- ❌ **Avoid:** `width`, `height`, `top`, `left`, `margin`, `padding` (causes reflow)
- ✅ **Use:** `will-change` sparingly (only when needed)
- ✅ **Use:** `transform: translateZ(0)` for GPU acceleration

---

## ⏱️ TIMING & EASING

### Duration Scale

| Duration | Value | Usage |
|----------|-------|-------|
| `duration-fast` | 100ms | Button press, active states |
| `duration-normal` | 200ms | Hover effects, focus states |
| `duration-slow` | 300ms | Card reveals, page transitions |
| `duration-slower` | 400ms | Complex animations, entrances |

### Easing Functions

#### Standard Ease (Default)
- **Function:** `cubic-bezier(0.4, 0, 0.2, 1)`
- **Usage:** Most interactions, hover effects
- **Feel:** Smooth, natural

**CSS:**
```css
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

**Tailwind:**
```css
transition-all duration-200 ease-in-out
```

---

#### Ease Out (Entrances)
- **Function:** `cubic-bezier(0, 0, 0.2, 1)`
- **Usage:** Elements appearing, fade-ins
- **Feel:** Quick start, smooth end

**CSS:**
```css
transition: all 300ms cubic-bezier(0, 0, 0.2, 1);
```

**Tailwind:**
```css
transition-all duration-300 ease-out
```

---

#### Ease In (Exits)
- **Function:** `cubic-bezier(0.4, 0, 1, 1)`
- **Usage:** Elements disappearing, fade-outs
- **Feel:** Smooth start, quick end

**CSS:**
```css
transition: all 200ms cubic-bezier(0.4, 0, 1, 1);
```

**Tailwind:**
```css
transition-all duration-200 ease-in
```

---

#### Spring (Bouncy)
- **Function:** Custom spring animation
- **Usage:** Cart badge, success feedback
- **Feel:** Playful, energetic

**CSS (Framer Motion):**
```css
transition: {
  type: "spring",
  stiffness: 500,
  damping: 30
}
```

---

### CSS Variables
```css
--duration-fast: 0.1s;
--duration-normal: 0.2s;
--duration-slow: 0.3s;
--duration-slower: 0.4s;

--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

---

## 🖱️ HOVER EFFECTS

### Button Hover

#### Primary Button
- **Duration:** 200ms
- **Easing:** `ease-in-out`
- **Properties:**
  - Background: `navy-900` → `navy-800`
  - Transform: `scale(1.02)`
  - Shadow: `0 4px 12px rgba(16, 42, 67, 0.3)`

**CSS:**
```css
.button-primary {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.button-primary:hover {
  background-color: var(--color-navy-800);
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(16, 42, 67, 0.3);
}
```

**Tailwind:**
```css
transition-all duration-200 ease-in-out
hover:bg-navy-800 hover:scale-[1.02] hover:shadow-lg
```

**Figma:**
- Create hover variant
- Background: Navy 800
- Scale: 102%
- Add shadow effect

---

### Card Hover

#### Product Card
- **Duration:** 300ms
- **Easing:** `ease-in-out`
- **Properties:**
  - Transform: `scale(1.02)` + `translateY(-4px)`
  - Shadow: Increase from `0 2px 8px` to `0 8px 24px`
  - Image: Fade primary → secondary (200ms)

**CSS:**
```css
.product-card {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover {
  transform: scale(1.02) translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.product-card-image-primary {
  transition: opacity 200ms ease-in-out;
}

.product-card:hover .product-card-image-primary {
  opacity: 0;
}

.product-card-image-secondary {
  opacity: 0;
  transition: opacity 200ms ease-in-out;
}

.product-card:hover .product-card-image-secondary {
  opacity: 1;
}
```

**Tailwind:**
```css
transition-all duration-300 ease-in-out
hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl
```

**Figma:**
- Create hover variant
- Transform: Scale 102%, Translate Y -4px
- Shadow: 0 8px 24px rgba(0, 0, 0, 0.12)

---

### Link Hover

#### Navigation Link
- **Duration:** 400ms
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)`
- **Properties:**
  - Underline: Width 0 → 100%, centered → left-aligned
  - Text: `translateY(-1px)`

**CSS:**
```css
.nav-link {
  position: relative;
  transition: transform 200ms ease-in-out;
}

.nav-link:hover {
  transform: translateY(-1px);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: var(--color-navy-900);
  transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1),
              left 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover::after {
  width: 100%;
  left: 0;
}
```

**Tailwind:**
```css
relative transition-transform duration-200
hover:-translate-y-0.5
after:absolute after:bottom-[-6px] after:left-1/2 after:w-0 after:h-0.5 after:bg-navy-900 after:transition-all after:duration-300
hover:after:w-full hover:after:left-0
```

**Figma:**
- Create hover variant
- Underline: Width 100%, Left 0
- Text: Translate Y -1px

---

### Icon Hover

#### Icon Button
- **Duration:** 200ms
- **Easing:** `ease-in-out`
- **Properties:**
  - Background: Transparent → `cream-200`
  - Color: `charcoal-700` → `charcoal-900`
  - Transform: `scale(1.1)`

**CSS:**
```css
.icon-button {
  transition: all 200ms ease-in-out;
}

.icon-button:hover {
  background-color: var(--color-cream-200);
  color: var(--color-charcoal-900);
  transform: scale(1.1);
}
```

**Tailwind:**
```css
transition-all duration-200 ease-in-out
hover:bg-cream-200 hover:text-charcoal-900 hover:scale-110
```

---

## 👆 BUTTON PRESS STATES

### Active State (Press Feedback)

#### Primary Button
- **Duration:** 100ms
- **Easing:** `ease-in-out`
- **Properties:**
  - Transform: `scale(0.98)`
  - Background: `navy-900` → `navy-950`

**CSS:**
```css
.button-primary:active {
  transform: scale(0.98);
  background-color: var(--color-navy-950);
  transition: all 100ms ease-in-out;
}
```

**Tailwind:**
```css
active:scale-[0.98] active:bg-navy-950 transition-transform duration-100
```

**Figma:**
- Create active variant
- Scale: 98%
- Background: Navy 950

---

#### Secondary Button
- **Duration:** 100ms
- **Properties:**
  - Transform: `scale(0.98)`

**CSS:**
```css
.button-secondary:active {
  transform: scale(0.98);
  transition: transform 100ms ease-in-out;
}
```

**Tailwind:**
```css
active:scale-[0.98] transition-transform duration-100
```

---

### Touch Feedback (Mobile)

#### Tap Feedback
- **Duration:** 100ms press, 200ms release
- **Properties:**
  - Transform: `scale(0.95)` on press
  - Opacity: 0.8 on press

**CSS:**
```css
.button:active {
  transform: scale(0.95);
  opacity: 0.8;
  transition: all 100ms ease-in-out;
}
```

**Tailwind:**
```css
active:scale-95 active:opacity-80 transition-all duration-100
```

---

## 🔄 PAGE TRANSITIONS

### Route Transitions

#### Page Fade In
- **Duration:** 300ms
- **Easing:** `ease-out`
- **Properties:**
  - Opacity: 0 → 1
  - Transform: `translateY(20px)` → `translateY(0)`

**CSS (Framer Motion):**
```css
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}
```

**Framer Motion:**
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  {children}
</motion.div>
```

---

#### Page Fade Out
- **Duration:** 200ms
- **Easing:** `ease-in`
- **Properties:**
  - Opacity: 1 → 0

**CSS:**
```css
.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transition: opacity 200ms ease-in;
}
```

---

### Section Reveals

#### Scroll-Triggered Fade In
- **Duration:** 400ms
- **Easing:** `ease-out`
- **Trigger:** When element is 20% visible
- **Properties:**
  - Opacity: 0 → 1
  - Transform: `translateY(30px)` → `translateY(0)`

**CSS (Intersection Observer):**
```css
.section-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 400ms ease-out, transform 400ms ease-out;
}

.section-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Framer Motion:**
```jsx
const { ref, inView } = useInView({
  triggerOnce: true,
  threshold: 0.2,
});

<motion.div
  ref={ref}
  initial={{ opacity: 0, y: 30 }}
  animate={inView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
  {content}
</motion.div>
```

---

#### Staggered Children
- **Duration:** 300ms per item
- **Stagger:** 50ms delay between items
- **Properties:**
  - Opacity: 0 → 1
  - Transform: `translateY(20px)` → `translateY(0)`

**Framer Motion:**
```jsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  }}
>
  {items.map((item, index) => (
    <motion.div
      key={index}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3 }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

## ⏳ LOADING STATES

### Button Loading

#### Spinner Animation
- **Duration:** 1s (infinite loop)
- **Easing:** `linear`
- **Properties:**
  - Rotate: 0° → 360°

**CSS:**
```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.button-loading {
  animation: spin 1s linear infinite;
}
```

**Tailwind:**
```css
animate-spin
```

**Figma:**
- Create loading variant
- Rotate: 360° (continuous)

---

### Skeleton Loading

#### Skeleton Pulse
- **Duration:** 1.5s (infinite loop)
- **Easing:** `ease-in-out`
- **Properties:**
  - Opacity: 0.4 → 0.8 → 0.4

**CSS:**
```css
@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

.skeleton {
  background-color: var(--color-cream-200);
  animation: pulse 1.5s ease-in-out infinite;
}
```

**Tailwind:**
```css
bg-cream-200 animate-pulse
```

**Figma:**
- Create skeleton variant
- Opacity: 40% → 80% → 40% (loop)

---

### Progress Indicator

#### Linear Progress
- **Duration:** Variable (based on load time)
- **Easing:** `linear`
- **Properties:**
  - Width: 0% → 100%

**CSS:**
```css
.progress-bar {
  width: 0%;
  transition: width 0.3s linear;
}

.progress-bar.loading {
  width: 100%;
}
```

---

### Shimmer Effect

#### Shimmer Loading
- **Duration:** 2s (infinite loop)
- **Easing:** `linear`
- **Properties:**
  - Background position: -200% → 200%

**CSS:**
```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    var(--color-cream-200) 0%,
    var(--color-cream-100) 50%,
    var(--color-cream-200) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}
```

**Tailwind:**
```css
bg-gradient-to-r from-cream-200 via-cream-100 to-cream-200 bg-[length:200%_100%] animate-shimmer
```

---

## 🎨 SPECIAL EFFECTS

### Badge Entrance

#### Cart Badge Pop
- **Duration:** 400ms (spring)
- **Easing:** Spring animation
- **Properties:**
  - Scale: 0 → 1
  - Opacity: 0 → 1

**Framer Motion:**
```jsx
<motion.span
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{
    type: "spring",
    stiffness: 500,
    damping: 30,
  }}
>
  {count}
</motion.span>
```

---

### Image Reveal

#### Image Fade In
- **Duration:** 400ms
- **Easing:** `ease-out`
- **Properties:**
  - Opacity: 0 → 1
  - Filter: `blur(4px)` → `blur(0)`

**CSS:**
```css
.image-loading {
  opacity: 0;
  filter: blur(4px);
  transition: opacity 400ms ease-out, filter 400ms ease-out;
}

.image-loaded {
  opacity: 1;
  filter: blur(0);
}
```

---

### Modal/Drawer Entrance

#### Slide In (Right)
- **Duration:** 400ms (spring)
- **Easing:** Spring animation
- **Properties:**
  - Transform: `translateX(100%)` → `translateX(0)`

**Framer Motion:**
```jsx
<motion.div
  initial={{ x: "100%" }}
  animate={{ x: 0 }}
  exit={{ x: "100%" }}
  transition={{
    type: "spring",
    damping: 35,
    stiffness: 400,
    mass: 0.8,
  }}
>
  {content}
</motion.div>
```

---

#### Fade In (Overlay)
- **Duration:** 300ms
- **Easing:** `ease-in-out`
- **Properties:**
  - Opacity: 0 → 1
  - Backdrop blur: 0 → 8px

**CSS:**
```css
.overlay-enter {
  opacity: 0;
  backdrop-filter: blur(0);
}

.overlay-enter-active {
  opacity: 1;
  backdrop-filter: blur(8px);
  transition: opacity 300ms ease-in-out, backdrop-filter 300ms ease-in-out;
}
```

---

## ♿ ACCESSIBILITY

### Reduced Motion

#### Respect User Preferences
- **Check:** `prefers-reduced-motion`
- **Action:** Disable or simplify animations

**CSS:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**JavaScript:**
```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Disable animations
  motionConfig = { duration: 0 };
}
```

---

### Focus Indicators

#### Keyboard Focus
- **Duration:** Instant (no animation)
- **Properties:**
  - Outline: 2px solid `navy-900`
  - Outline offset: 2px

**CSS:**
```css
:focus-visible {
  outline: 2px solid var(--color-navy-900);
  outline-offset: 2px;
  transition: none; /* Instant, no animation */
}
```

---

## 📊 PERFORMANCE OPTIMIZATION

### GPU Acceleration

#### Force Hardware Acceleration
- **Use:** `transform: translateZ(0)` or `will-change: transform`

**CSS:**
```css
.animated-element {
  transform: translateZ(0);
  will-change: transform; /* Only when animating */
}
```

---

### Animation Best Practices

1. **Use Transform & Opacity:**
   ```css
   /* ✅ Good */
   transform: translateX(100px);
   opacity: 0.5;
   
   /* ❌ Bad */
   left: 100px;
   visibility: hidden;
   ```

2. **Avoid Layout Properties:**
   ```css
   /* ❌ Avoid */
   width: 200px;
   height: 100px;
   margin: 10px;
   padding: 20px;
   ```

3. **Use `will-change` Sparingly:**
   ```css
   /* Only when element is actively animating */
   .element-about-to-animate {
     will-change: transform;
   }
   
   /* Remove after animation */
   .element-animated {
     will-change: auto;
   }
   ```

4. **Debounce Scroll Animations:**
   ```js
   let ticking = false;
   
   function onScroll() {
     if (!ticking) {
       window.requestAnimationFrame(() => {
         // Update animations
         ticking = false;
       });
       ticking = true;
     }
   }
   ```

---

## 🎯 USAGE GUIDELINES

### When to Animate

✅ **Do Animate:**
- User interactions (hover, click, focus)
- State changes (loading, success, error)
- Page/section transitions
- Micro-feedback (badge updates, cart adds)

❌ **Don't Animate:**
- Critical information (don't delay access)
- Large layout shifts
- Too many elements at once
- Without purpose

---

### Animation Hierarchy

1. **Primary Actions:** 200ms, subtle
2. **Secondary Actions:** 300ms, noticeable
3. **Page Transitions:** 300-400ms, smooth
4. **Loading States:** Continuous, clear

---

## 📝 FIGMA IMPLEMENTATION

### Setting Up Animations in Figma

1. **Create Component Variants:**
   - Default, Hover, Active, Focus, Loading
   - Use "Interactive Components" for hover/click

2. **Set Up Prototypes:**
   - Hover: On hover → Change to hover variant (200ms)
   - Click: On click → Change to active variant (100ms)
   - Page transitions: Smart animate (300ms)

3. **Use Easing:**
   - Ease In Out: `cubic-bezier(0.4, 0, 0.2, 1)`
   - Ease Out: `cubic-bezier(0, 0, 0.2, 1)`

---

## 🔧 CODE IMPLEMENTATION

### CSS Variables
```css
:root {
  --duration-fast: 0.1s;
  --duration-normal: 0.2s;
  --duration-slow: 0.3s;
  --duration-slower: 0.4s;
  
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
}
```

### Tailwind Config
```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      transitionDuration: {
        'fast': '100ms',
        'normal': '200ms',
        'slow': '300ms',
        'slower': '400ms',
      },
      transitionTimingFunction: {
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
      },
    },
  },
}
```

---

## 📋 QUICK REFERENCE

### Common Patterns

| Interaction | Duration | Easing | Properties |
|------------|----------|--------|------------|
| Button Hover | 200ms | ease-in-out | scale(1.02), bg change |
| Button Press | 100ms | ease-in-out | scale(0.98) |
| Card Hover | 300ms | ease-in-out | scale(1.02), translateY(-4px) |
| Link Underline | 400ms | ease-in-out | width 0→100% |
| Page Fade In | 300ms | ease-out | opacity 0→1, translateY(20px) |
| Loading Spinner | 1s | linear | rotate 0→360° (loop) |
| Skeleton Pulse | 1.5s | ease-in-out | opacity 0.4→0.8 (loop) |

---

**These motion guidelines ensure subtle, performance-friendly animations that enhance the premium feel of Extreme Dept Kidz!**
