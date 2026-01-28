# Micro-Interactions Specification  
**Extreme Dept Kidz — Premium E-commerce Interactions**

Comprehensive timing, easing, and visual feedback guidelines for buttons, product cards, and navigation. Designed for **perceived speed** and **polish**.

---

## Design Principles

1. **Perceived Speed:** Instant visual feedback (< 100ms) + smooth animations (200–300ms)
2. **Polish:** Consistent easing curves, subtle depth, refined scale/color shifts
3. **Accessibility:** Respect `prefers-reduced-motion`, maintain focus states
4. **Premium Feel:** Gentle, luxurious motion—never jarring or bouncy

---

## 1. Button Interactions

### 1.1 Primary Button (Navy-900, Cream-50 text)

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Idle** | — | — | `bg-navy-900`, `text-cream-50`, `shadow-navy` |
| **Hover** | 200ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `bg-navy-800`, `scale(1.02)`, `shadow-glass-lg` |
| **Active/Press** | 100ms | `cubic-bezier(0.4, 0, 1, 1)` | `bg-navy-950`, `scale(0.98)`, shadow reduces |
| **Focus** | 150ms | `ease-out` | `ring-2 ring-navy-500 ring-offset-2`, `outline-none` |
| **Loading** | — | — | Spinner replaces text, button disabled, `opacity-75` |
| **Disabled** | — | — | `bg-charcoal-200`, `text-charcoal-400`, `opacity-50`, `cursor-not-allowed` |

**CSS Variables:**
```css
--button-primary-hover-duration: 200ms;
--button-primary-active-duration: 100ms;
--button-primary-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--button-primary-active-easing: cubic-bezier(0.4, 0, 1, 1);
```

**Implementation Notes:**
- Hover: `transform: scale(1.02)` + `translateY(-1px)` for subtle lift
- Active: Immediate scale-down (`0.98`) for tactile feedback
- Focus ring: 2px navy-500, 2px offset, rounded
- Loading spinner: 16px, `animate-spin`, `motion-reduce:animate-none`

---

### 1.2 Secondary Button (Transparent, Navy-900 border)

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Idle** | — | — | `bg-transparent`, `border-2 border-navy-900`, `text-navy-900` |
| **Hover** | 200ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `bg-navy-900`, `text-cream-50`, `scale(1.02)`, `shadow-glass` |
| **Active** | 100ms | `cubic-bezier(0.4, 0, 1, 1)` | `bg-navy-950`, `scale(0.98)` |
| **Focus** | 150ms | `ease-out` | `ring-2 ring-navy-500 ring-offset-2` |

**Implementation Notes:**
- Border fills on hover (smooth color transition)
- Scale matches primary button for consistency

---

### 1.3 Ghost Button (Transparent, text only)

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Idle** | — | — | `bg-transparent`, `text-charcoal-900` |
| **Hover** | 200ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `bg-cream-200/60`, `text-charcoal-900`, `scale(1.02)` |
| **Active** | 100ms | `cubic-bezier(0.4, 0, 1, 1)` | `bg-cream-300`, `scale(0.98)` |
| **Focus** | 150ms | `ease-out` | `ring-2 ring-charcoal-500 ring-offset-2` |

---

### 1.4 Icon Button (Header, cart, search, account)

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Idle** | — | — | `text-charcoal-700`, `bg-transparent`, `rounded-lg` |
| **Hover** | 200ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `text-charcoal-900`, `bg-cream-200/60`, `scale(1.05)` |
| **Active** | 100ms | `cubic-bezier(0.4, 0, 1, 1)` | `bg-cream-300`, `scale(0.95)` |
| **Focus** | 150ms | `ease-out` | `ring-2 ring-navy-500 ring-offset-2` |

**Implementation Notes:**
- Icon-only buttons: `min-h-[44px] min-w-[44px]` for touch targets
- Scale slightly larger (1.05) for better visibility on small icons
- Background pill appears on hover (subtle, not full)

---

## 2. Product Card Interactions

### 2.1 Card Container

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Idle** | — | — | `bg-cream-50/90`, `border border-cream-200/60`, `shadow-glass`, `rounded-xl` |
| **Hover** | 300ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `scale(1.02)`, `translateY(-6px)`, `shadow-glass-lg`, `border-cream-300/80` |
| **Focus** | 150ms | `ease-out` | `ring-2 ring-navy-900 ring-offset-2` |

**Implementation Notes:**
- Lift effect: `transform: translateY(-6px)` + `scale(1.02)`
- Shadow deepens: `shadow-glass` → `shadow-glass-lg`
- Border brightens slightly for depth
- Image swap (see 2.2) triggers simultaneously

---

### 2.2 Product Image Swap (Primary → Secondary)

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Primary (idle)** | — | — | `opacity-100`, `z-index-1` |
| **Secondary (hidden)** | — | — | `opacity-0`, `z-index-0`, `absolute inset-0` |
| **Hover transition** | 200ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Primary fades out (`opacity-0`), secondary fades in (`opacity-100`) |

**Implementation Notes:**
- Both images preloaded to prevent layout shift
- Cross-fade (not slide) for premium feel
- Secondary image: `loading="eager"`, `fetchPriority="high"` for instant swap

---

### 2.3 Quick Add to Cart Button (Product card hover)

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Hidden (idle)** | — | — | `opacity-0`, `translateY(8px)`, `pointer-events-none` |
| **Visible (hover)** | 300ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `opacity-100`, `translateY(0)`, `pointer-events-auto` |
| **Button hover** | 200ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `bg-navy-800`, `scale(1.02)`, `shadow-glass-lg` |
| **Button active** | 100ms | `cubic-bezier(0.4, 0, 1, 1)` | `bg-navy-950`, `scale(0.98)` |

**Implementation Notes:**
- Slides up from bottom (`translateY(8px)` → `0`)
- Fades in simultaneously (`opacity-0` → `100`)
- Button itself has standard primary button interactions
- Position: `absolute bottom-0 left-0 right-0`, `z-10`, `px-3 pb-3`

---

### 2.4 Badge Animations ("NEW", "SALE")

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Mount (initial)** | 400ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | `scale(0)` → `scale(1)`, `opacity-0` → `opacity-100` |
| **Hover (card)** | 200ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `scale(1.05)` (subtle pulse) |

**Implementation Notes:**
- Slight bounce on mount (`cubic-bezier(0.34, 1.56, 0.64, 1)`) for playful feel
- Position: `absolute top-3 left-3`, `z-10`
- Badge colors: `bg-charcoal-900` (NEW), `bg-navy-900` (SALE), `text-cream-50`

---

### 2.5 Wishlist Button (Heart icon)

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Idle** | — | — | `text-charcoal-400`, `bg-cream-50/80 backdrop-blur-sm`, `rounded-full` |
| **Hover** | 200ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `text-charcoal-600`, `bg-cream-100`, `scale(1.1)` |
| **Active (toggle)** | 150ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | `scale(0.9)` → `scale(1.1)` (bounce), fill changes |
| **Filled (active)** | — | — | `text-red-500` (or brand accent), filled icon |

**Implementation Notes:**
- Toggle animation: quick scale bounce for tactile feedback
- Position: `absolute top-3 right-3`, `z-10`
- Size: `w-10 h-10` (40px touch target)

---

## 3. Navigation Interactions

### 3.1 Desktop Nav Links (BOYS, GIRLS, etc.)

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Idle** | — | — | `text-charcoal-700`, `font-semibold uppercase tracking-wider` |
| **Hover** | 300ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `text-charcoal-900`, `bg-cream-200/50`, `translateY(-1px)`, underline expands |
| **Active (current)** | — | — | `text-navy-900`, `font-bold`, underline visible (`scale-x-100`) |
| **Focus** | 150ms | `ease-out` | `ring-2 ring-navy-500 ring-offset-2`, `rounded-lg` |

**Underline Animation:**
- Initial: `scale-x-0`, `transform-origin: center`
- Hover: `scale-x-100` (expands from center)
- Duration: 300ms
- Easing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- Style: `h-[2px]`, `bg-navy-900`, `rounded-full`, `absolute bottom-1.5`

**Implementation Notes:**
- Background pill: `px-3 py-2 rounded-lg -mx-1` (extends slightly beyond text)
- Text lifts slightly (`translateY(-1px)`) for depth
- Underline expands from center for polished feel

---

### 3.2 Mega Menu (Dropdown on BOYS hover)

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Hidden** | — | — | `opacity-0`, `translateY(-8px)`, `pointer-events-none` |
| **Visible (hover)** | 250ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `opacity-100`, `translateY(0)`, `pointer-events-auto` |
| **Exit** | 200ms | `cubic-bezier(0.4, 0, 1, 1)` | `opacity-0`, `translateY(-4px)` |

**Implementation Notes:**
- Slides down from nav (`translateY(-8px)` → `0`)
- Fades in simultaneously
- Background: `bg-cream-50/95 backdrop-blur-xl`, `shadow-glass-lg`
- Position: `absolute top-full left-0 right-0`, `z-50`, `mt-2`

---

### 3.3 Mobile Menu Button (Hamburger)

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Idle** | — | — | `text-charcoal-900`, `bg-transparent` |
| **Hover** | 200ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `bg-cream-200`, `rounded-lg` |
| **Active (open)** | 300ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Icon rotates 90° (if animated), menu slides in |

**Menu Drawer Animation:**
- Slide: `translateX(-100%)` → `translateX(0)` (from left)
- Duration: 300ms
- Easing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- Backdrop: `bg-charcoal-900/50 backdrop-blur-sm`, fades in 200ms

---

### 3.4 Search Overlay

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Hidden** | — | — | `opacity-0`, `backdrop-blur-0`, `pointer-events-none` |
| **Visible (open)** | 250ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `opacity-100`, `backdrop-blur-md`, `pointer-events-auto` |
| **Input focus** | 150ms | `ease-out` | Input scales to `1.02`, border highlights |

**Implementation Notes:**
- Overlay: `bg-charcoal-900/60 backdrop-blur-md`, full viewport
- Search box: slides down (`translateY(-20px)` → `0`), fades in
- Input: `bg-cream-50`, `border-2 border-navy-900`, focus ring

---

## 4. Cart & Checkout Interactions

### 4.1 Cart Drawer (Slide-in)

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Hidden** | — | — | `translateX(100%)`, `opacity-0` |
| **Visible (open)** | 350ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `translateX(0)`, `opacity-100` |
| **Backdrop** | 250ms | `ease-out` | `bg-charcoal-900/50 backdrop-blur-sm`, fades in |

**Implementation Notes:**
- Slides from right (`translateX(100%)` → `0`)
- Width: `w-full sm:w-96` (full mobile, 384px desktop)
- Backdrop click closes drawer

---

### 4.2 Add to Cart Success (Toast/Notification)

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Mount** | 300ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | `scale(0.9)` → `scale(1)`, `opacity-0` → `opacity-100`, slides up (`translateY(20px)` → `0`) |
| **Visible** | 3000ms | — | Static display |
| **Unmount** | 250ms | `cubic-bezier(0.4, 0, 1, 1)` | `opacity-100` → `opacity-0`, `translateY(-10px)` |

**Implementation Notes:**
- Position: `fixed top-20 right-4`, `z-[100]`
- Style: `bg-cream-50`, `border border-cream-200`, `shadow-glass-lg`, `rounded-lg`
- Content: Icon + "Added to cart" + product name
- Auto-dismiss after 3s

---

### 4.3 Cart Item Quantity Controls

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Button hover** | 150ms | `ease-out` | `bg-cream-200`, `scale(1.1)` |
| **Button active** | 100ms | `cubic-bezier(0.4, 0, 1, 1)` | `scale(0.95)` |
| **Quantity change** | 200ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Number pulses (`scale(1.05)` → `1`) |

**Implementation Notes:**
- Buttons: `w-8 h-8`, `rounded-full`, `border border-cream-300`
- Quantity input: `w-12`, centered, no spinner arrows

---

## 5. Form Interactions

### 5.1 Input Fields

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Idle** | — | — | `bg-cream-50`, `border border-cream-300`, `text-charcoal-900` |
| **Focus** | 150ms | `ease-out` | `border-navy-900`, `ring-2 ring-navy-500/20`, `bg-cream-50` |
| **Error** | 200ms | `ease-out` | `border-red-500`, `ring-2 ring-red-500/20`, shake animation |
| **Success** | 200ms | `ease-out` | `border-sage-500`, `ring-2 ring-sage-500/20` |

**Shake Animation (Error):**
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
```
- Duration: 400ms
- Easing: `ease-in-out`

---

### 5.2 Checkbox & Radio

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Idle** | — | — | `border-2 border-cream-300`, `bg-cream-50`, `rounded` |
| **Hover** | 200ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `border-navy-600`, `bg-cream-100`, `scale(1.05)` |
| **Checked** | 200ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | `bg-navy-900`, `border-navy-900`, checkmark scales in (`scale(0)` → `1`) |

**Implementation Notes:**
- Checkmark: `scale(0)` → `scale(1)` with slight bounce
- Size: `w-5 h-5` (20px)

---

## 6. Loading States

### 6.1 Skeleton Loaders

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Pulse** | 1500ms | `ease-in-out` | `opacity-50` → `opacity-100` → `opacity-50` (infinite) |

**Shimmer Effect (Alternative):**
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```
- Duration: 2s
- Easing: `linear`
- Background: `linear-gradient(90deg, cream-100 0%, cream-200 50%, cream-100 100%)`

---

### 6.2 Spinner (Button loading)

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Rotate** | 1000ms | `linear` | Continuous 360° rotation |

**Implementation Notes:**
- Size: `w-4 h-4` (16px)
- Color: Inherits text color
- Respects `prefers-reduced-motion`: `motion-reduce:animate-none`

---

## 7. Scroll Animations

### 7.1 Fade-in on Scroll (Sections)

| State | Duration | Easing | Visual Feedback |
|-------|----------|--------|-----------------|
| **Before viewport** | — | — | `opacity-0`, `translateY(20px)` |
| **In viewport** | 500ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `opacity-100`, `translateY(0)` |

**Implementation Notes:**
- Trigger: `IntersectionObserver` with `threshold: 0.1`, `rootMargin: "-50px"`
- Stagger children: 100ms delay between items

---

## 8. CSS Variables Summary

Add to `app/globals.css`:

```css
:root {
  /* Button timings */
  --duration-button-hover: 200ms;
  --duration-button-active: 100ms;
  --duration-button-focus: 150ms;
  
  /* Card timings */
  --duration-card-hover: 300ms;
  --duration-image-swap: 200ms;
  --duration-badge-mount: 400ms;
  
  /* Nav timings */
  --duration-nav-hover: 300ms;
  --duration-menu-open: 250ms;
  --duration-menu-close: 200ms;
  
  /* Form timings */
  --duration-input-focus: 150ms;
  --duration-input-error: 200ms;
  
  /* Easing curves */
  --ease-premium: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-active: cubic-bezier(0.4, 0, 1, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: ease-out;
}
```

---

## 9. Accessibility Considerations

1. **Reduced Motion:** All animations respect `prefers-reduced-motion: reduce`
   - Use `@media (prefers-reduced-motion: reduce) { animation: none; }`
   - Or Tailwind: `motion-reduce:animate-none`

2. **Focus States:** Always visible, never removed
   - Ring: 2px, offset 2px, high contrast color

3. **Touch Targets:** Minimum 44×44px for all interactive elements

4. **Loading States:** Clear feedback (spinner, skeleton, disabled state)

---

## 10. Implementation Checklist

- [ ] Add CSS variables to `globals.css`
- [ ] Update Button component with new timings/easing
- [ ] Update ProductCard with image swap + quick add animations
- [ ] Update Header nav links with underline animation
- [ ] Add cart drawer slide-in animation
- [ ] Implement toast notification for add-to-cart
- [ ] Add form input focus/error states
- [ ] Test with `prefers-reduced-motion` enabled
- [ ] Verify touch targets on mobile (44×44px minimum)
- [ ] Performance: Use `transform` and `opacity` only (GPU-accelerated)

---

**Result:** Micro-interactions that feel **instant** (< 100ms initial feedback), **smooth** (200–300ms transitions), and **premium** (refined easing, subtle depth). Every interaction reinforces the brand's luxury positioning while maintaining accessibility and performance.
