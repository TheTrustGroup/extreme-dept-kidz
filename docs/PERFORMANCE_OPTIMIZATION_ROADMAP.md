# Performance Optimization Roadmap

**Prioritized Engineering Tasks for 1M+ Monthly Users**

---

## Tier 1: Critical Performance Fixes (Week 1-2)

### 1.1 Consolidate Product List Stats API
- **Current:** 6 separate API calls for quick-filter counts
- **Fix:** Single endpoint `/api/admin/products/stats` or include in list response
- **Files:** `app/api/admin/products/route.ts`, `app/admin/products/page.tsx`
- **Impact:** 5x reduction in API calls; 200-300ms faster page load
- **Effort:** 0.5 day
- **Priority:** P1

### 1.2 Redis-Backed Rate Limiting
- **Current:** In-memory rate limiting (doesn't scale)
- **Fix:** Migrate to Upstash Redis (Vercel integration)
- **Files:** `lib/auth/rate-limit.ts`, `lib/security/rate-limiter.ts`
- **Impact:** Distributed rate limiting; prevents bypass
- **Effort:** 1-2 days
- **Priority:** P0 (Security + Performance)

### 1.3 Lazy Load Header Components
- **Current:** Header loads all sub-components (MegaMenu, SearchOverlay, CartPreview) upfront
- **Fix:** Code-split; lazy load with `React.lazy()` and `Suspense`
- **Files:** `components/layout/Header.tsx`
- **Impact:** 50KB+ reduction in initial JS bundle; faster TTI
- **Effort:** 2-3 days
- **Priority:** P1

---

## Tier 2: High-Impact Optimizations (Weeks 3-4)

### 2.1 Optimize SWR Caching
- **Current:** SWR uses `cache: "no-store"`, bypassing CDN
- **Fix:** Use `cache: "default"` or `revalidate`; leverage ISR cache
- **Files:** `components/home/HomeProductSectionsWithSWR.tsx`
- **Impact:** Reduced origin hits; faster client-side navigation
- **Effort:** 1 day
- **Priority:** P2

### 2.2 Database Query Optimization
- **Current:** `getProductsByCategory` uses `include` (overfetching); `/api/products` loads full catalog then filters
- **Fix:** Selective fields; server-side filtering/pagination
- **Files:** `app/api/products/route.ts`, `lib/db/index.ts`
- **Impact:** Smaller payloads; faster API responses
- **Effort:** 2-3 days
- **Priority:** P2

### 2.3 N+1 Query Elimination
- **Current:** Admin orders list makes 6 parallel API calls for counts
- **Fix:** Single aggregated query or include counts in main response
- **Files:** `app/api/admin/orders/route.ts`, `components/admin/orders/ComprehensiveOrderTable.tsx`
- **Impact:** Reduced DB load; faster admin dashboard
- **Effort:** 1-2 days
- **Priority:** P2

### 2.4 Image Optimization Audit
- **Current:** Good AVIF/WebP support; verify all images use Next.js Image
- **Fix:** Audit all `<img>` tags; convert to `<Image>`; verify `sizes` attribute
- **Files:** Audit all components
- **Impact:** Better image loading; reduced bandwidth
- **Effort:** 2-3 days
- **Priority:** P2

---

## Tier 3: Advanced Optimizations (Month 2)

### 3.1 Read Replicas for Read-Heavy Operations
- **Current:** All reads go to primary DB
- **Fix:** Configure Prisma read replica; use for GET requests
- **Files:** `lib/db/prisma.ts`, `app/api/products/route.ts`
- **Impact:** Reduced load on primary; better read performance
- **Effort:** 2-3 days
- **Priority:** P3

### 3.2 Edge Caching Strategy
- **Current:** ISR with revalidatePath/revalidateTag; single Vercel region
- **Fix:** Optimize cache tags; consider multi-region deployment
- **Files:** `lib/utils/cache-revalidation.ts`, `vercel.json`
- **Impact:** Faster global response times
- **Effort:** 2-3 days
- **Priority:** P3

### 3.3 Background Jobs for Long Operations
- **Current:** Bulk actions (duplicate, export) run synchronously
- **Fix:** Move to background jobs (Vercel Cron + queue); return job ID; poll for status
- **Files:** `app/api/admin/products/bulk/route.ts`, new job queue system
- **Impact:** No timeouts; better UX for bulk operations
- **Effort:** 5-7 days
- **Priority:** P3

### 3.4 Database Connection Pooling
- **Current:** Prisma default pooling
- **Fix:** Configure pool size, timeout, connection limits
- **Files:** `lib/db/prisma.ts`, `prisma/schema.prisma`
- **Impact:** Better resource management; prevents connection exhaustion
- **Effort:** 1-2 days
- **Priority:** P3

---

## Tier 4: Monitoring & Observability (Ongoing)

### 4.1 Performance Monitoring
- **Fix:** Set up Real User Monitoring (RUM); track Core Web Vitals
- **Tools:** Vercel Analytics, Web Vitals API, custom dashboard
- **Impact:** Visibility into production performance
- **Effort:** 2-3 days
- **Priority:** P2

### 4.2 API Response Time Monitoring
- **Fix:** Add timing middleware; log slow queries (> 500ms)
- **Files:** `lib/utils/logger.ts`, API routes
- **Impact:** Identify performance bottlenecks
- **Effort:** 1-2 days
- **Priority:** P2

### 4.3 Database Query Monitoring
- **Fix:** Enable Prisma query logging; track slow queries
- **Files:** `lib/db/prisma.ts`
- **Impact:** Identify N+1 queries, slow operations
- **Effort:** 1 day
- **Priority:** P2

---

## Performance Targets

### Page Load (Desktop)
- **LCP:** < 1.5s
- **FCP:** < 1.0s
- **TTI:** < 2.5s
- **CLS:** < 0.1

### Page Load (Mobile 3G)
- **LCP:** < 2.5s
- **FCP:** < 1.5s
- **TTI:** < 3.5s
- **CLS:** < 0.1

### API Response Times (p95)
- **Product list:** < 200ms
- **Product detail:** < 150ms
- **Admin products:** < 300ms
- **Admin orders:** < 400ms

### Bundle Sizes
- **Initial JS:** < 200KB (mobile), < 300KB (desktop)
- **Total JS:** < 500KB (mobile), < 800KB (desktop)
- **CSS:** < 50KB

---

## Quick Wins (Low Effort, High Impact)

1. **Consolidate Product Stats API** (0.5 day) → 5x fewer API calls
2. **Optimize SWR Caching** (1 day) → Reduced origin hits
3. **Lazy Load Header** (2-3 days) → 50KB+ bundle reduction
4. **Image Optimization Audit** (2-3 days) → Better image loading

---

## Implementation Timeline

- **Week 1:** Tier 1.1-1.2 (Stats API, Redis rate limiting)
- **Week 2:** Tier 1.3 (Lazy load header)
- **Weeks 3-4:** Tier 2.1-2.4 (SWR, DB queries, N+1, images)
- **Month 2:** Tier 3.1-3.4 (Read replicas, edge caching, background jobs, pooling)
- **Ongoing:** Tier 4 (Monitoring)

---

## ROI Analysis

| Optimization | Effort | Impact | ROI |
|--------------|--------|--------|-----|
| Consolidate Stats API | 0.5d | High | ⭐⭐⭐⭐⭐ |
| Redis Rate Limiting | 1-2d | Critical | ⭐⭐⭐⭐⭐ |
| Lazy Load Header | 2-3d | High | ⭐⭐⭐⭐ |
| SWR Caching | 1d | Medium | ⭐⭐⭐⭐ |
| DB Query Optimization | 2-3d | High | ⭐⭐⭐⭐ |
| Read Replicas | 2-3d | Medium | ⭐⭐⭐ |

---

**Total Estimated Effort:** 20-30 days  
**Expected Impact:** 40-50% improvement in performance metrics
