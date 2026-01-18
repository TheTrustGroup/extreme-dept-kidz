# Frontend Performance Optimization Plan
## Extreme Dept Kidz - Ranked by Impact vs Risk

**Date:** Current  
**Focus:** Image loading, CLS prevention, font loading, CSS efficiency  
**Methodology:** Improvements ranked by impact (performance gain) vs risk (implementation complexity/breaking changes)

---

## 📊 CURRENT STATE ANALYSIS

### Image Loading Strategy
**Current Implementation:**
- ✅ Using `next/image` with automatic optimization
- ✅ Lazy loading for below-fold images
- ✅ Priority loading for hero images
- ✅ AVIF and WebP formats enabled
- ⚠️ All product cards use `fetchPriority="low"` (even first visible ones)
- ⚠️ Secondary images load on hover (could cause CLS)
- ⚠️ No blur placeholders for product images
- ⚠️ `sizes` attribute could be more precise

### CLS (Cumulative Layout Shift)
**Current Implementation:**
- ✅ Aspect ratios set (`aspect-square`)
- ✅ Skeleton loaders exist
- ✅ Fixed dimensions on containers
- ⚠️ Secondary images don't reserve space (load on hover)
- ⚠️ Some images may not have explicit width/height
- ⚠️ Font loading could cause layout shift (though `display: swap` helps)

### Font Loading
**Current Implementation:**
- ✅ Using `next/font` with `display: swap`
- ✅ Preload enabled
- ✅ Fallback fonts specified
- ⚠️ Loading all font weights (300, 400, 500, 600, 700 for Inter)
- ⚠️ Loading all font weights (400, 500, 600, 700 for Playfair)
- ⚠️ No font subsetting optimization
- ⚠️ Could use `font-display: optional` for non-critical fonts

### CSS Efficiency
**Current Implementation:**
- ✅ Using Tailwind CSS (good tree-shaking)
- ✅ CSS variables for design tokens
- ⚠️ Some duplicate CSS rules in `globals.css`
- ⚠️ `will-change` used on body (should be scoped)
- ⚠️ `content-visibility: auto` on all images (could be more selective)
- ⚠️ Some unused CSS might exist

---

## 🎯 OPTIMIZATION IMPROVEMENTS (Ranked)

### TIER 1: HIGH IMPACT, LOW RISK ⭐⭐⭐

#### 1. Optimize Image Loading Priority
**Impact:** High (improves LCP, reduces initial load)  
**Risk:** Low (no breaking changes)

**Current Issue:**
- All product cards use `fetchPriority="low"` even when visible
- First 4-6 product cards should use `fetchPriority="high"` or `"auto"`

**Solution:**
```tsx
// In ProductCard or ProductGrid
const isAboveFold = index < 4; // First 4 cards
<Image
  fetchPriority={isAboveFold ? "auto" : "low"}
  loading={isAboveFold ? "eager" : "lazy"}
/>
```

**Expected Impact:**
- LCP improvement: 200-500ms
- Better initial render
- No visual changes

**Files to Modify:**
- `components/products/ProductCard.tsx`
- `components/products/ProductGrid.tsx`

---

#### 2. Add Blur Placeholders for Product Images
**Impact:** High (prevents layout shift, improves perceived performance)  
**Risk:** Low (enhancement only)

**Current Issue:**
- Product images load without placeholders
- Causes white space flash

**Solution:**
```tsx
// Generate blur data URL or use Next.js blur placeholder
<Image
  placeholder="blur"
  blurDataURL={generateBlurDataURL(280, 280)}
  // or use static blur hash
/>
```

**Expected Impact:**
- CLS reduction: 0.05-0.1
- Better perceived performance
- Smoother loading experience

**Files to Modify:**
- `components/products/ProductCard.tsx`
- Create utility: `lib/utils/image-blur.ts`

---

#### 3. Preload Secondary Images on Hover Intent
**Impact:** Medium-High (smoother hover experience)  
**Risk:** Low (progressive enhancement)

**Current Issue:**
- Secondary images load when hovered (delay visible)
- Could preload on hover intent

**Solution:**
```tsx
// Preload secondary image on mouse enter (before hover)
useEffect(() => {
  if (secondaryImage && isHovered) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = secondaryImage.url;
    document.head.appendChild(link);
  }
}, [isHovered, secondaryImage]);
```

**Expected Impact:**
- Smoother image swap
- Better UX
- Minimal performance overhead

**Files to Modify:**
- `components/products/ProductCard.tsx`

---

#### 4. Optimize Font Weights (Remove Unused)
**Impact:** Medium (reduces font file size)  
**Risk:** Low (only if weights aren't used)

**Current Issue:**
- Loading Inter: 300, 400, 500, 600, 700 (5 weights)
- Loading Playfair: 400, 500, 600, 700 (4 weights)
- May not use all weights

**Solution:**
```tsx
// Audit usage, remove unused weights
const inter = Inter({
  weight: ["400", "500", "600"], // Remove 300, 700 if unused
});

const playfair = Playfair_Display({
  weight: ["400", "500", "600", "700"], // Keep if all used
});
```

**Expected Impact:**
- Font file size reduction: 20-40%
- Faster font loading
- Better FCP

**Files to Modify:**
- `app/layout.tsx`
- Audit: `grep -r "font-weight: 300"` and `font-weight: 700`

---

#### 5. Scope `will-change` Property
**Impact:** Medium (better performance, less memory)  
**Risk:** Low (optimization only)

**Current Issue:**
- `will-change: scroll-position` on body (too broad)
- Should be scoped to specific elements

**Solution:**
```css
/* Remove from body */
body {
  /* will-change: scroll-position; ❌ Remove */
}

/* Add to specific animated elements */
.animated-element {
  will-change: transform;
}
```

**Expected Impact:**
- Reduced memory usage
- Better browser optimization
- No visual changes

**Files to Modify:**
- `app/globals.css`

---

### TIER 2: HIGH IMPACT, MEDIUM RISK ⭐⭐

#### 6. Reserve Space for Secondary Images
**Impact:** High (prevents CLS on hover)  
**Risk:** Medium (layout changes)

**Current Issue:**
- Secondary images don't reserve space
- Could cause layout shift when loaded

**Solution:**
```tsx
// Preload secondary image in hidden state
{secondaryImage && (
  <Image
    src={secondaryImage.url}
    fill
    className="opacity-0 absolute inset-0"
    aria-hidden="true"
    loading="eager"
    fetchPriority="high"
    sizes="..."
  />
)}
```

**Expected Impact:**
- CLS reduction: 0.02-0.05
- No layout shift on hover
- Slightly larger initial bundle

**Files to Modify:**
- `components/products/ProductCard.tsx`

---

#### 7. Optimize `sizes` Attribute for Product Images
**Impact:** Medium (better image selection)  
**Risk:** Low (responsive behavior)

**Current Issue:**
- Generic `sizes` attribute: `"(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`
- Could be more precise based on actual grid layout

**Solution:**
```tsx
// More precise sizes based on grid
const sizes = isMobile 
  ? "(max-width: 640px) 50vw" // 2 columns
  : isTablet
  ? "(max-width: 1024px) 33vw" // 3 columns
  : "280px"; // Fixed 280px on desktop
```

**Expected Impact:**
- Better image selection
- Reduced bandwidth
- Faster loading

**Files to Modify:**
- `components/products/ProductCard.tsx`
- `components/products/ProductGrid.tsx`

---

#### 8. Remove Duplicate CSS Rules
**Impact:** Medium (smaller CSS bundle)  
**Risk:** Low (cleanup)

**Current Issue:**
- Duplicate `.sr-only` rules in `globals.css`
- Some redundant CSS

**Solution:**
- Consolidate duplicate rules
- Remove unused CSS
- Use Tailwind utilities where possible

**Expected Impact:**
- CSS bundle reduction: 1-2KB
- Cleaner codebase
- Easier maintenance

**Files to Modify:**
- `app/globals.css`

---

#### 9. Optimize Font Display Strategy
**Impact:** Medium (better FCP, prevents FOIT)  
**Risk:** Low (progressive enhancement)

**Current Issue:**
- Using `display: swap` (good, but could optimize)
- Could use `display: optional` for non-critical fonts

**Solution:**
```tsx
// Keep swap for primary font (Inter)
const inter = Inter({
  display: "swap", // Keep
});

// Use optional for decorative font if not critical
const playfair = Playfair_Display({
  display: "optional", // Only if Playfair not critical for FCP
});
```

**Expected Impact:**
- Faster FCP if Playfair not critical
- Better perceived performance
- May show fallback font briefly

**Files to Modify:**
- `app/layout.tsx`

---

### TIER 3: MEDIUM IMPACT, LOW RISK ⭐

#### 10. Add Image Dimensions to Prevent CLS
**Impact:** Medium (prevents layout shift)  
**Risk:** Low (enhancement)

**Current Issue:**
- Some images use `fill` without explicit dimensions
- Could add width/height hints

**Solution:**
```tsx
// Add explicit dimensions where possible
<Image
  src={image.url}
  width={280}
  height={280}
  // or use fill with aspect-ratio container
/>
```

**Expected Impact:**
- CLS reduction: 0.01-0.03
- Better layout stability
- No visual changes

**Files to Modify:**
- `components/products/ProductCard.tsx`
- Other image components

---

#### 11. Optimize `content-visibility` Usage
**Impact:** Medium (better rendering performance)  
**Risk:** Low (optimization)

**Current Issue:**
- `content-visibility: auto` on all images
- Could be more selective

**Solution:**
```css
/* Only on below-fold images */
.below-fold img {
  content-visibility: auto;
}

/* Remove from above-fold */
.above-fold img {
  content-visibility: visible;
}
```

**Expected Impact:**
- Better initial render
- Reduced paint time
- No visual changes

**Files to Modify:**
- `app/globals.css`

---

#### 12. Add Resource Hints for Critical Images
**Impact:** Medium (faster image loading)  
**Risk:** Low (progressive enhancement)

**Current Issue:**
- No preconnect/prefetch for image CDN
- Could add for critical images

**Solution:**
```tsx
// In layout.tsx or page
<link rel="preconnect" href="https://your-image-cdn.com" />
<link rel="dns-prefetch" href="https://your-image-cdn.com" />
```

**Expected Impact:**
- Faster image loading
- Better LCP
- Minimal overhead

**Files to Modify:**
- `app/layout.tsx`

---

### TIER 4: LOW-MEDIUM IMPACT, LOW RISK

#### 13. Optimize CSS Variables Usage
**Impact:** Low-Medium (slightly smaller CSS)  
**Risk:** Low (optimization)

**Current Issue:**
- All CSS variables defined but may not all be used
- Could audit and remove unused

**Solution:**
- Audit CSS variable usage
- Remove unused variables
- Consolidate similar values

**Expected Impact:**
- CSS bundle reduction: <1KB
- Cleaner codebase

**Files to Modify:**
- `app/globals.css`

---

#### 14. Add Image Loading Intersection Observer
**Impact:** Low-Medium (better lazy loading)  
**Risk:** Low (enhancement)

**Current Issue:**
- Using native `loading="lazy"` (good)
- Could add intersection observer for more control

**Solution:**
```tsx
// Use Intersection Observer for better control
const [shouldLoad, setShouldLoad] = useState(false);
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setShouldLoad(true);
      observer.disconnect();
    }
  });
  if (ref.current) observer.observe(ref.current);
  return () => observer.disconnect();
}, []);
```

**Expected Impact:**
- Better lazy loading control
- Slightly better performance
- More complexity

**Files to Modify:**
- `components/products/ProductCard.tsx`

---

## 📋 IMPLEMENTATION PRIORITY

### Phase 1: Quick Wins (Week 1)
1. ✅ Optimize Image Loading Priority (#1)
2. ✅ Add Blur Placeholders (#2)
3. ✅ Scope `will-change` Property (#5)
4. ✅ Remove Duplicate CSS Rules (#8)

**Expected Impact:**
- LCP: -200-500ms
- CLS: -0.05-0.1
- CSS Bundle: -1-2KB

---

### Phase 2: Medium Effort (Week 2)
5. ✅ Optimize Font Weights (#4)
6. ✅ Reserve Space for Secondary Images (#6)
7. ✅ Optimize `sizes` Attribute (#7)
8. ✅ Optimize Font Display Strategy (#9)

**Expected Impact:**
- Font Loading: -20-40% file size
- CLS: -0.02-0.05
- Image Bandwidth: -10-20%

---

### Phase 3: Polish (Week 3)
9. ✅ Preload Secondary Images on Hover (#3)
10. ✅ Add Image Dimensions (#10)
11. ✅ Optimize `content-visibility` (#11)
12. ✅ Add Resource Hints (#12)

**Expected Impact:**
- Perceived Performance: Improved
- CLS: -0.01-0.03
- Overall polish

---

## 🎯 EXPECTED PERFORMANCE GAINS

### Core Web Vitals Targets

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| **LCP** | ~2.5s | <2.0s | -200-500ms |
| **CLS** | ~0.1 | <0.05 | -0.05-0.1 |
| **FCP** | ~1.5s | <1.2s | -200-300ms |
| **FID/INP** | <100ms | <100ms | Maintain |

### Bundle Size

| Asset | Current | Target | Reduction |
|-------|---------|--------|-----------|
| **Fonts** | ~200KB | ~120KB | -40% |
| **CSS** | ~50KB | ~48KB | -4% |
| **Images** | Variable | Optimized | Better selection |

---

## ⚠️ RISK ASSESSMENT

### Low Risk (Safe to Implement)
- ✅ Image loading priority optimization
- ✅ Blur placeholders
- ✅ Font weight optimization
- ✅ CSS cleanup
- ✅ `will-change` scoping

### Medium Risk (Test Thoroughly)
- ⚠️ Secondary image preloading (could increase initial load)
- ⚠️ Font display strategy change (may show fallback)
- ⚠️ `sizes` attribute changes (test responsive behavior)

### High Risk (Requires Careful Testing)
- ❌ None identified in this plan

---

## 📝 IMPLEMENTATION CHECKLIST

### Image Loading
- [ ] Add `fetchPriority="auto"` to first 4 product cards
- [ ] Add blur placeholders to product images
- [ ] Preload secondary images on hover intent
- [ ] Optimize `sizes` attribute for grid layouts
- [ ] Reserve space for secondary images

### CLS Prevention
- [ ] Ensure all images have aspect ratios
- [ ] Add explicit dimensions where possible
- [ ] Test layout stability on slow connections
- [ ] Verify skeleton loaders match content dimensions

### Font Loading
- [ ] Audit font weight usage
- [ ] Remove unused font weights
- [ ] Consider `display: optional` for decorative fonts
- [ ] Test font loading on slow connections

### CSS Efficiency
- [ ] Remove duplicate CSS rules
- [ ] Scope `will-change` properties
- [ ] Optimize `content-visibility` usage
- [ ] Audit and remove unused CSS variables

---

## 🔧 QUICK FIXES (Can Implement Immediately)

### 1. Fix Image Priority in ProductGrid
```tsx
// In ProductGrid.tsx
products.map((product, index) => (
  <ProductCard 
    product={product} 
    priority={index < 4} // First 4 cards
  />
))
```

### 2. Add Blur Placeholder Utility
```tsx
// lib/utils/image-blur.ts
export function generateBlurDataURL(width: number, height: number): string {
  // Generate base64 blur placeholder
}
```

### 3. Remove will-change from body
```css
/* app/globals.css */
body {
  /* Remove: will-change: scroll-position; */
}
```

### 4. Consolidate Duplicate CSS
```css
/* Remove duplicate .sr-only rules */
/* Keep only one definition */
```

---

## 📊 MONITORING & VALIDATION

### Before Implementation
- Run Lighthouse audit
- Measure Core Web Vitals
- Check bundle sizes
- Test on slow 3G

### After Implementation
- Re-run Lighthouse audit
- Compare Core Web Vitals
- Verify bundle size reduction
- Test on slow 3G
- Check for visual regressions

### Tools
- Lighthouse (Chrome DevTools)
- Web Vitals extension
- Next.js Bundle Analyzer
- Chrome Performance tab

---

**This optimization plan prioritizes high-impact, low-risk improvements that will significantly improve performance while maintaining design integrity and functionality.**
