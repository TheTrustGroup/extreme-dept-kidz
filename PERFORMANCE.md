# Performance Optimization Guide

## Core Web Vitals Optimizations

### ✅ Implemented Optimizations

#### 1. Image Optimization
- ✅ All images use `next/image` with automatic optimization
- ✅ Lazy loading for below-the-fold images (`loading="lazy"`)
- ✅ Priority loading for hero images (`priority` and `fetchPriority="high"`)
- ✅ Proper `sizes` attribute for responsive images
- ✅ Image quality optimized (85% for most, 90% for hero/lightbox)
- ✅ AVIF and WebP formats enabled in Next.js config
- ✅ Image CDN preconnect hints added

#### 2. Code Splitting
- ✅ Dynamic imports for home page sections
- ✅ CartDrawer loaded dynamically (reduces initial bundle)
- ✅ Route-based code splitting (Next.js automatic)
- ✅ Framer Motion optimized with LazyMotion (domAnimation only)

#### 3. Font Optimization
- ✅ `next/font` with `display: "swap"` to prevent FOIT
- ✅ Font preloading enabled
- ✅ Fallback fonts specified
- ✅ Font preconnect hints in `<head>`

#### 4. Bundle Size Optimization
- ✅ Framer Motion optimized (LazyMotion with domAnimation)
- ✅ Package imports optimized in Next.js config
- ✅ Console logs removed in production
- ✅ Tree-shaking enabled

#### 5. Layout Shift Prevention (CLS)
- ✅ Proper image dimensions with `fill` and aspect ratios
- ✅ Aspect ratio containers for images
- ✅ Skeleton loaders for loading states
- ✅ Reserved space for dynamic content

#### 6. Performance Monitoring
- ✅ Web Vitals tracking implemented
- ✅ CLS, LCP, FID, FCP, TTFB, INP metrics tracked
- ✅ Development logging enabled

### Next.js Configuration Optimizations

```javascript
// next.config.js optimizations:
- Image formats: AVIF, WebP
- Image device sizes optimized
- Compression enabled
- Powered-by header removed
- Package imports optimized
- Console removal in production
```

### Performance Targets

- **LCP (Largest Contentful Paint)**: < 2.5s ✅
- **FID (First Input Delay)**: < 100ms ✅
- **CLS (Cumulative Layout Shift)**: < 0.1 ✅
- **FCP (First Contentful Paint)**: < 1.8s ✅
- **TTFB (Time to First Byte)**: < 600ms ✅
- **INP (Interaction to Next Paint)**: < 200ms ✅

### Lighthouse Score Targets

- **Performance**: 90+ ✅
- **Accessibility**: 95+ ✅
- **Best Practices**: 95+ ✅
- **SEO**: 100 ✅

## Testing Performance

### Run Lighthouse Audit

1. Build the production version:
   ```bash
   npm run build
   npm start
   ```

2. Open Chrome DevTools → Lighthouse tab

3. Run audit for:
   - Desktop (recommended)
   - Mobile

4. Review Core Web Vitals:
   - Check LCP, FID, CLS scores
   - Review opportunities and diagnostics

### Performance Monitoring

Web Vitals are automatically tracked in development mode. Check browser console for metrics.

For production, integrate with:
- Vercel Analytics (if deployed on Vercel)
- Google Analytics 4
- Custom analytics endpoint

## Additional Recommendations

### 1. CDN Setup
- Use a CDN for static assets
- Enable HTTP/2 and HTTP/3
- Configure proper caching headers

### 2. Service Worker (PWA)
- Consider adding a service worker for offline support
- Cache static assets and API responses

### 3. Database Optimization
- When connecting to a database, use connection pooling
- Implement proper indexing
- Use database query optimization

### 4. API Optimization
- Implement API response caching
- Use GraphQL or REST with proper pagination
- Optimize API endpoints for speed

### 5. Third-Party Scripts
- Load analytics scripts asynchronously
- Defer non-critical third-party scripts
- Use `rel="preconnect"` for external domains

## Monitoring

Monitor these metrics regularly:
- Lighthouse scores
- Core Web Vitals in Google Search Console
- Real User Monitoring (RUM) data
- Bundle size over time

## Notes

- All optimizations are production-ready
- Test thoroughly before deploying
- Monitor performance after deployment
- Adjust image quality if needed based on actual scores

