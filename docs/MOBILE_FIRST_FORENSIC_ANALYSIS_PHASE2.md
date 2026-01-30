# Phase 2 — Mobile-First Forensic Analysis

**Audit Date:** January 2025  
**Simulation:** Low bandwidth, mid-range Android, 3G/unstable networks, low memory, small screens, high pixel density  
**Scope:** LCP, CLS, FID/INP, TTI, hydration, JS payload, images, fonts, scroll jank, touch responsiveness

---

## Executive Summary

The stack is already tuned for performance: AVIF/WebP, font swap, passive scroll, LazyMotion, deferred WebVitals/FloatingCart, and good splitChunks. **Main risks on constrained mobile:** (1) Header and above-the-fold client tree are not code-split, so hydration and TTI can suffer on 3G/low-end devices; (2) widespread `will-change`/`translateZ(0)` can increase layer count and memory pressure; (3) no connection-aware prefetch, so image prefetch can compete with critical requests on slow networks; (4) two font families with multiple weights add latency. This document calls out **performance bottlenecks**, **mobile-specific optimizations**, **bundle strategy**, and **rendering optimizations**.

---

## 1. Simulated Conditions

| Condition | Assumption | Impact focus |
|-----------|------------|--------------|
| **Low bandwidth** | 3G / 400–800 Kbps | LCP, image/font size, prefetch, critical path JS |
| **Mid-range Android** | 4–6 GB RAM, mid-tier GPU | Layer count, main-thread work, hydration time |
| **3G / unstable** | High RTT, packet loss | TTFB, caching, retries, non-blocking loads |
| **Low memory** | 4 GB, shared with other apps | CLS, layer thrashing, backdrop-filter, large chunks |
| **Small screens** | 360–414 px width | LCP element size, tap targets, layout (already 360 in deviceSizes) |
| **High pixel density** | 2x–3x | Image sizes, srcset, memory per image |

---

## 2. Core Web Vitals & Key Metrics

### 2.1 LCP (Largest Contentful Paint)

**Target:** &lt; 2.5s (good), &lt; 1.8s (ideal for mobile in docs).

| Factor | Current | Risk (mobile) | Recommendation |
|--------|---------|----------------|-----------------|
| **LCP element** | Hero image (`/Extreme 1.png`) | Correct; hero is primary LCP candidate | Keep; ensure only one priority image per route |
| **Hero image** | Next/Image, `priority`, `loading="eager"`, `fetchPriority="high"`, `sizes="100vw"`, `quality={85}` | Good | Add explicit `<link rel="preload" as="image" href="..." />` in document head for slow 3G so browser can start fetch before/with HTML |
| **Hero path** | `/Extreme 1.png` (space in filename) | Some CDNs/proxies may require URL-encoding | Use URL-encoded path in preload if added; verify in production |
| **Placeholder** | `placeholder="blur"` with short base64 | Reduces CLS; minimal payload | Keep |
| **Fonts** | Playfair + Inter, `display: "swap"`, `preload: true` | Text visible quickly; font swap can slightly shift LCP if LCP is text | Already good; consider reducing to 2 weights per family for critical path |
| **Header** | In Suspense with `PageLoader` fallback | Until Header hydrates, header is skeleton; main content can paint. Header is client-heavy (Framer, Lucide, MegaMenu, Search, Cart) | Consider lazy-loading MegaMenu/SearchOverlay/CartPreview only when opened to shrink initial JS |
| **Streaming** | Home: Hero + TrustBar in main bundle; sections in dynamic chunks with SSR | LCP (hero) is in first paint; sections stream | Good; keep Hero + TrustBar in main bundle |

**Bottlenecks:**  
- No preload for hero image in `<head>` (Next.js injects when component runs; on 3G a head preload can start earlier).  
- Header is part of critical client tree; its JS size delays “interactive” and can delay when LCP is finalized if browser waits for main-thread.

---

### 2.2 CLS (Cumulative Layout Shift)

**Target:** &lt; 0.1 (good), &lt; 0.05 (ideal).

| Factor | Current | Risk (mobile) | Recommendation |
|--------|---------|----------------|-----------------|
| **Hero** | `minHeight: calc(100vh - 2rem - 3.5rem)`, aspect/contain in globals | Reserved space; low CLS | Keep |
| **Product cards** | `aspect-ratio: 4/5`, `min-height: 400px/420px`, `contain: layout style paint` | Stable cards | Keep |
| **Images** | Next/Image + OptimizedImage with dimensions, blur placeholder | Good | Keep |
| **Fonts** | `adjustFontFallback: true`, `display: "swap"` | Reduces shift when fonts load | Keep |
| **Scrollbar** | `scrollbar-gutter: stable` in globals | Prevents horizontal shift when scrollbar appears | Keep |
| **body** | `will-change: contents` in globals | Can create unnecessary layer / containment; rarely needed | Remove or scope to specific animated subtree |
| **Widespread layers** | Many `will-change: transform`, `transform: translateZ(0)`, `contain: layout style paint` on product cards, glass, header, scroll containers | On low-memory devices, too many layers can cause compositor thrashing and indirect layout jank | Prefer applying `will-change` only to elements that actually animate (e.g. on hover/active); avoid on every card by default |
| **Skeleton** | StreamingSkeleton / ProductGridSkeleton with fixed min-height | Matches card layout | Good |

**Bottlenecks:**  
- `body { will-change: contents }` is unnecessary for typical layout and can increase layer cost.  
- Global use of `will-change: transform` on static elements (e.g. all product cards) can increase GPU memory and layer count on mid-range Android.

---

### 2.3 FID / INP (First Input Delay / Interaction to Next Paint)

**Target:** &lt; 100 ms. (web-vitals reports INP; FID is deprecated.)

| Factor | Current | Risk (mobile) | Recommendation |
|--------|---------|----------------|-----------------|
| **Scroll** | Header: `window.addEventListener("scroll", ..., { passive: true })`; FloatingCartButton: same | Passive scroll doesn’t block main thread | Keep |
| **Touch** | `touch-action: manipulation` in globals | Removes 300 ms tap delay; good for INP | Keep |
| **Main-thread load** | Providers (Theme, Reveal, LazyMotion, Toast, Cart, CartDrawer) + ConditionalHeader (Header, MegaMenu, Search, CartPreview, etc.) all hydrate early | Large client tree on first load can keep main thread busy and delay first input response on 3G/mid-range | Defer non-critical UI: keep Header shell; lazy-load MegaMenu, SearchOverlay, CartPreview on first open |
| **LazyMotion** | `domAnimation` only (no full framer-motion) | Smaller Framer payload; less script to parse/run | Keep |
| **Deferred** | LazyFloatingCartButton (100 ms), LazyWebVitals (requestIdleCallback, 2s timeout), CartDrawer (dynamic, ssr: false) | Reduces initial JS and work during hydration | Keep |

**Bottlenecks:**  
- First input often goes to Header (menu, search, cart). If Header’s chunk is large and loads with main bundle, INP can spike until hydration completes.  
- No explicit “loading” or “busy” state for buttons during hydration; consider `aria-busy` or disabled state until interactive if needed.

---

### 2.4 TTI (Time to Interactive)

**Target:** &lt; 2.3s (referenced in lib/web-vitals.ts). Note: TTI is not in the web-vitals package; INP/FCP/LCP are. Use TTI as an internal/design target.

| Factor | Current | Risk (mobile) | Recommendation |
|--------|---------|----------------|-----------------|
| **Critical JS** | Layout: Providers + ConditionalHeader + main (children). Header is not dynamic | Single large “shell” chunk that must parse and execute before page feels interactive | Split Header: minimal shell (logo, menu icon, cart icon) + dynamic MegaMenu, SearchOverlay, CartPreview on open |
| **Home page** | HeroSection + TrustBar in main bundle; HomeProductSectionsWithSWR, ShopByStyle, etc. via nextDynamic with ssr: true | Sections are separate chunks; they stream and hydrate when loaded | Good; consider loading below-fold sections with a small delay (e.g. requestIdleCallback) on mobile to prioritize above-fold |
| **Chunk size** | splitChunks: react, framer-motion, lucide-react, recharts, forms, date-fns; maxSize 244000, minSize 20000 | Prevents huge single chunks | Good |
| **optimizePackageImports** | framer-motion, lucide-react, recharts, date-fns, zod | Tree-shaking for these libs | Good |
| **Console** | removeConsole in production (keep error) | Less runtime overhead | Good |

**Bottlenecks:**  
- Header and its dependencies (Framer, Lucide, search, cart, mega menu) load with the initial route and block “interactive” on slow CPUs/networks.  
- No route-level or component-level “interactive” marker; TTI is inferred from LCP + main-thread quiet. Reducing main bundle and deferring non-critical UI will directly improve TTI.

---

### 2.5 Hydration Timing

| Factor | Current | Risk (mobile) | Recommendation |
|--------|---------|----------------|-----------------|
| **Suspense** | Header: fallback `<PageLoader />`; main: fallback `<PageLoader />`; Footer/CartDrawer: fallback `null` | If Header or page is slow, user sees full-page or header skeleton; good for perceived load, but hydration still runs for full tree | Keep; consider lighter header skeleton (e.g. logo + placeholder bar) to reduce perceived wait |
| **Order** | Providers → ProductsUpdateListener → Header (Suspense) → main (Suspense) → Footer → CartDrawer → LazyFloatingCartButton → LazyWebVitals | Hydration order is tree order; Header and main contend for main thread | Defer CartDrawer and Footer hydration via dynamic + delay if metrics show benefit |
| **SSR** | Home sections use nextDynamic with ssr: true | HTML is sent; JS loads in chunks; no “blank then paint” for sections | Good |
| **Client-only** | CartDrawer, FloatingCartButton, WebVitals: ssr false and/or delayed | Not blocking first paint | Good |

**Bottlenecks:**  
- Full Header (with all icons and dropdowns) hydrates as soon as its chunk is available; that’s a lot of components on 3G.  
- ProductsUpdateListener is small but runs on every page; acceptable.

---

### 2.6 JS Payload Size

| Factor | Current | Risk (mobile) | Recommendation |
|--------|---------|----------------|-----------------|
| **splitChunks** | react, framer-motion, lucide-react, recharts, forms, date-fns, vendor, common; enforce true for react/framer | Good separation; framer and lucide can be large | Keep; ensure Header doesn’t pull full lucide set (use tree-shaking / named imports) |
| **optimizePackageImports** | framer-motion, lucide-react, recharts, date-fns, zod | Reduces bundle size | Keep |
| **Dynamic imports** | Home: 6 section chunks; CartDrawer; FloatingCartButton; WebVitals | Below-fold and secondary UI are split | Good |
| **ConditionalHeader** | Not dynamic; pulls Header → TopBar, MegaMenu, SearchOverlay, CartPreview, Auth modals, ThemeToggle, etc. | First-route JS includes entire header tree | Make Header shell minimal; lazy-load MegaMenu, SearchOverlay, CartPreview (e.g. dynamic import when menu/search/cart open) |
| **sideEffects: false** | In webpack optimization | Can break packages that rely on side-effectful imports | Verify builds and runtime; if any lib breaks, set sideEffects per package or remove for that chunk |
| **minSize 20k, maxSize 244k** | Prevents tiny and huge chunks | Balanced | Good |

**Bottlenecks:**  
- Initial route (e.g. `/`) loads: layout (fonts, globals, Providers) + page shell + HeroSection + TrustBar + Header + shared chunks (react, framer-motion, lucide, etc.). Header’s own code + its deps are the main candidate for reduction.  
- Run `ANALYZE=true npm run build` and inspect which chunks are in the critical path; then lazy-load any large, non–above-the-fold pieces (e.g. SearchOverlay, MegaMenu).

---

### 2.7 Image Loading Behavior

| Factor | Current | Risk (mobile) | Recommendation |
|--------|---------|----------------|-----------------|
| **Formats** | avif, webp in next.config | Modern formats; good for bandwidth | Keep |
| **deviceSizes** | [360, 640, 768, 1024, 1280, 1536, 1920] | 360 covers small phones | Good |
| **imageSizes** | [16, 32, 48, 64, 96, 128, 256, 384] | Good range for thumbs and cards | Good |
| **Hero** | priority, eager, fetchPriority high, sizes 100vw, quality 85, blur placeholder | Optimal for LCP | Keep |
| **OptimizedImage** | useIntersectionObserver, rootMargin 200px, triggerOnce; LCP skips observer | Lazy below-fold; LCP loads immediately | Good |
| **Quality** | getOptimizedQuality: mobile 75, LCP 90 | Saves bytes on mobile | Good |
| **SmartImagePrefetch** | Prefetch when in view (IntersectionObserver), maxConcurrent 3, prefetchDistance 200 | On 3G, prefetch can compete with critical requests | Make prefetch connection-aware: disable or reduce when `navigator.connection.effectiveType === '2g'` or `saveData === true` |
| **Blur placeholder** | Used for hero and product cards | Reduces CLS | Keep |

**Bottlenecks:**  
- Prefetch always on: on slow/unstable networks, prefetching 3 images can delay LCP or INP.  
- No explicit `loading="lazy"` in OptimizedImage for below-fold (Next/Image defaults to lazy for non-priority); confirm behavior for product grids.

---

### 2.8 Font Loading Behavior

| Factor | Current | Risk (mobile) | Recommendation |
|--------|---------|----------------|-----------------|
| **Families** | Playfair_Display (4 weights), Inter (5 weights) | Multiple weights = more requests and bytes on 3G | Subset to 2 weights per family for critical path (e.g. 400, 600 or 400, 700) |
| **display** | "swap" | No FOIT; text visible with fallback immediately | Keep |
| **preload** | true | Next.js preloads font CSS/files | Keep |
| **adjustFontFallback** | true | Reduces CLS when custom font loads | Keep |
| **Preconnect** | fonts.googleapis.com, fonts.gstatic.com in head | Reduces connection delay | Keep |

**Bottlenecks:**  
- Nine font variants (4 + 5) can add ~200–400 ms on 3G. Reducing to 2 weights each (e.g. 400, 600) cuts requests and can improve LCP/TTI.

---

### 2.9 Scroll Jank

| Factor | Current | Risk (mobile) | Recommendation |
|--------|---------|----------------|-----------------|
| **scroll-behavior** | globals.css: html has `scroll-behavior: auto` (line ~64) and later `scroll-behavior: smooth` (line ~398) | Conflicting; one overrides the other | Use a single rule; prefer `auto` for performance on mobile, or `smooth` only for in-page anchors |
| **Passive listeners** | Header scroll, FloatingCartButton scroll use `{ passive: true }` | Scroll doesn’t block main thread | Keep |
| **-webkit-overflow-scrolling: touch** | On html, body, scroll containers | Momentum scrolling on iOS | Keep |
| **will-change / translateZ(0)** | Applied to many elements (header, glass panels, product cards, scroll containers, images) | Too many layers on low-memory devices can cause compositor thrashing and jank | Restrict to elements that actually animate (e.g. .product-card:hover, .btn:active); remove from static cards and static scroll containers |
| **Backdrop-filter** | Reduced on mobile (8px) in globals | Less GPU cost on scroll | Good |
| **contain** | layout style paint on product cards, images, hero | Limits layout/paint; can help scrolling | Keep; avoid overuse of `contain: layout style` on huge subtrees |

**Bottlenecks:**  
- Duplicate/conflicting scroll-behavior.  
- Excessive will-change/translateZ(0) increases layer count; on mid-range Android with many product cards visible, this can cause jank during scroll.

---

### 2.10 Touch Responsiveness

| Factor | Current | Risk (mobile) | Recommendation |
|--------|---------|----------------|-----------------|
| **touch-action: manipulation** | In globals on * | Removes 300 ms click delay | Keep |
| **-webkit-tap-highlight-color: transparent** | In globals | Avoids default tap flash | Keep |
| **Button / tap targets** | min-height 44px in button, many links/controls | WCAG 2.5.5; good | Keep |
| **Passive scroll** | Used where needed | Prevents scroll from blocking touch handling | Keep |

No major bottlenecks; touch setup is solid.

---

## 3. Performance Bottlenecks (Prioritized)

1. **Header and above-the-fold client JS**  
   Header (and thus ConditionalHeader) is not code-split. It pulls Framer, Lucide, MegaMenu, SearchOverlay, CartPreview, auth modals. This delays hydration and TTI on 3G/mid-range devices.  
   **Action:** Keep a minimal Header (logo, menu icon, cart icon, search icon); lazy-load MegaMenu, SearchOverlay, CartPreview (and optionally auth modals) when first opened.

2. **No preload for hero image**  
   LCP image is discovered when HeroSection runs. On 3G, adding `<link rel="preload" as="image" href="..." />` in document head can start the request earlier.  
   **Action:** Add preload for the hero image URL (e.g. in layout or via next/head) for the homepage; ensure URL is correct (e.g. encoded if path has spaces).

3. **Widespread will-change and translateZ(0)**  
   Used on many static elements (all product cards, glass panels, scroll containers). Increases compositor layers and memory.  
   **Action:** Apply will-change/translateZ only to elements that actually animate (e.g. on :hover or when an animation class is toggled); remove from default state of cards and static containers.

4. **body { will-change: contents }**  
   Unnecessary for typical layout and can add cost.  
   **Action:** Remove or restrict to a specific animated wrapper if ever needed.

5. **SmartImagePrefetch always on**  
   On 3G/slow or data-saver, prefetch can compete with LCP and critical JS.  
   **Action:** Use Network Information API and saveData: disable or reduce prefetch when `effectiveType === '2g'` or `navigator.connection.saveData === true`.

6. **Font weights**  
   Nine font variants add latency.  
   **Action:** Subset to 2 weights per family for initial load (e.g. 400, 600); load additional weights lazily if needed for specific pages.

7. **scroll-behavior conflict**  
   Two different values in globals.css.  
   **Action:** Single source of truth; prefer `auto` for mobile performance.

8. **sideEffects: false**  
   Aggressive tree-shaking; can break some packages.  
   **Action:** Run full build and test; if something breaks, use package-specific sideEffects or relax for that cache group.

---

## 4. Mobile-Specific Optimizations

| Optimization | Priority | Description |
|--------------|----------|-------------|
| **Lazy-load Header overlays** | High | Dynamic import MegaMenu, SearchOverlay, CartPreview (and optionally auth modals) when user opens menu/search/cart. Reduces initial JS and speeds TTI/INP. |
| **Preload hero image** | High | Add `<link rel="preload" as="image" href="..." />` for hero on homepage (and ensure URL encoding if path has spaces). |
| **Connection-aware prefetch** | High | In SmartImagePrefetch (and any other prefetch logic), check `navigator.connection` and `navigator.saveData`; disable or reduce prefetch on 2g/slow/saveData. |
| **Reduce font weights on critical path** | Medium | Load only 400 + 600 (or 700) for Playfair and Inter initially; lazy-load other weights if needed. |
| **Scope will-change** | Medium | Use will-change only on elements that are currently animating (e.g. add/remove class on hover or when animation runs). Remove from default state of product cards and static containers. |
| **Remove body will-change: contents** | Low | Delete or scope to a specific node. |
| **Unify scroll-behavior** | Low | One rule in globals; prefer `auto` for mobile. |
| **Lighter header skeleton** | Optional | If Header Suspense fallback is PageLoader, consider a minimal bar (logo + icons placeholder) to reduce perceived wait. |
| **Reduce backdrop-filter on low memory** | Optional | Already 8px on mobile; could disable backdrop-filter when `navigator.deviceMemory <= 4` if supported and if jank persists. |

---

## 5. Bundle Optimization Strategy

| Strategy | Current | Recommendation |
|----------|---------|----------------|
| **Route-based splitting** | Yes (dynamic sections on home) | Keep; extend to Header overlays (MegaMenu, Search, CartPreview). |
| **Vendor chunks** | react, framer-motion, lucide-react, recharts, forms, date-fns | Keep; ensure only used icons/components are imported (tree-shake). |
| **optimizePackageImports** | framer-motion, lucide-react, recharts, date-fns, zod | Keep; add any other large tree-shakeable libs used in critical path. |
| **Max chunk size** | 244 KB | Good; consider slightly lower (e.g. 200 KB) for mobile if analysis shows big chunks on first load. |
| **Critical path definition** | Layout + Header + Hero + TrustBar | Shrink to: Layout + minimal Header (logo + 3 icons) + Hero + TrustBar. Move rest to on-demand. |
| **Analyze** | `ANALYZE=true npm run build` | Run regularly; identify chunks loaded on first paint and trim (dynamic import, defer). |
| **Recharts** | In separate chunk; used in admin | Ensure storefront does not import recharts on first route. |

---

## 6. Rendering Optimizations

| Area | Current | Recommendation |
|------|----------|----------------|
| **Streaming** | Home sections in Suspense with SSR dynamic chunks | Keep; consider requestIdleCallback or small delay before loading below-fold section chunks on mobile to prioritize LCP and INP. |
| **Skeleton consistency** | ProductGridSkeleton matches ProductCard min-height/aspect | Keep to avoid CLS. |
| **Image dimensions** | Next/Image and OptimizedImage use dimensions/placeholder | Keep to avoid CLS. |
| **Containment** | contain: layout style paint on cards, images, hero | Keep; avoid applying to very large subtrees (e.g. entire main) unless measured. |
| **Backdrop-filter** | Reduced on mobile (8px) and in reduced-motion | Keep. |
| **LazyMotion** | domAnimation only | Keep to limit Framer cost. |
| **Deferred components** | FloatingCartButton (100 ms), WebVitals (idle), CartDrawer (dynamic) | Keep; consider deferring Footer to idle or low priority on mobile if it’s heavy. |

---

## 7. Summary Table

| Metric | Target | Current posture | Main risk |
|--------|--------|------------------|-----------|
| **LCP** | &lt; 1.8s | Hero priority, blur placeholder, fonts swap | No head preload for hero; Header JS can delay main-thread |
| **CLS** | &lt; 0.05 | Reserved hero/card space, fonts adjustFallback, scrollbar-gutter | body will-change; too many will-change layers |
| **INP** | &lt; 100 ms | Passive scroll, touch-action manipulation, deferred non-critical | Large Header hydration blocks first input |
| **TTI** | &lt; 2.3s | Chunk splitting, LazyMotion, deferred FAB/WebVitals | Header in critical path; no lazy overlays |
| **Hydration** | — | Suspense + skeletons; CartDrawer/WebVitals deferred | Full Header hydrates early |
| **JS payload** | — | splitChunks, optimizePackageImports, dynamic sections | Header + deps in initial load |
| **Images** | — | AVIF/WebP, lazy, quality by context, OptimizedImage | Prefetch not connection-aware |
| **Fonts** | — | swap, preload, adjustFallback | Many weights (9) |
| **Scroll jank** | — | Passive scroll, reduced blur on mobile | scroll-behavior conflict; excess will-change |
| **Touch** | — | touch-action manipulation, 44px targets | — |

---

## 8. Next Steps

1. **Implement:** Lazy-load MegaMenu, SearchOverlay, CartPreview (dynamic import on first open).  
2. **Implement:** Preload hero image in document head for homepage.  
3. **Implement:** Connection-aware SmartImagePrefetch (2g/saveData → disable or reduce).  
4. **Tune:** Reduce critical-path font weights to 2 per family; scope will-change; remove body will-change; fix scroll-behavior.  
5. **Measure:** Run Lighthouse and real-device tests (Chrome DevTools 3G, mid-tier Android) and compare LCP, INP, CLS, TTI before/after.  
6. **Monitor:** Ensure web-vitals (LCP, FCP, INP, CLS, TTFB) are sent to analytics in production and set alerts for regressions.
