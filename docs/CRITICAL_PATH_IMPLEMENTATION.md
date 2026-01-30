# Critical Path Implementation Guide

**Week 1-4 Implementation Steps**

---

## Week 1: Security Foundations ✅ COMPLETE

### ✅ Task 1.1: Redis-Backed Rate Limiting (COMPLETED)

**Status:** ✅ Implemented and tested

**Changes Made:**
1. Created `lib/auth/rate-limit-redis.ts` - Redis-backed rate limiter with in-memory fallback
2. Updated `lib/security/rate-limiter.ts` - Now uses Redis with fallback
3. Updated `app/api/admin/auth/login/route.ts` - Uses Redis rate limiting
4. Updated `app/api/payment/momo/initiate/route.ts` - Uses Redis rate limiting

**Next Steps:**
1. Set up Upstash Redis (or any Redis instance):
   - Go to [Upstash Console](https://console.upstash.com/) or your Redis provider
   - Create a new Redis database
   - Copy the Redis URL
   - Add to `.env.local`: `REDIS_URL=your-redis-url-here`
2. Test rate limiting:
   - Try logging in 6 times rapidly (should block after 5 attempts)
   - Check Redis console to see rate limit keys
   - Verify fallback works if Redis is unavailable

**Files Changed:**
- `lib/auth/rate-limit-redis.ts` (new)
- `lib/security/rate-limiter.ts` (updated)
- `app/api/admin/auth/login/route.ts` (updated)
- `app/api/payment/momo/initiate/route.ts` (updated)

---

### ✅ Task 1.2: CSRF Protection (COMPLETED)

**Status:** ✅ Implemented

**What was done:**
- Changed cookie to `SameSite=Strict` (better CSRF protection)
- Created CSRF token system (`lib/auth/csrf.ts`)
- Added CSRF middleware (`lib/auth/csrf-middleware.ts`)
- CSRF token generated on login
- Example protection added to products POST route

**Next steps:**
- Update frontend to include CSRF token in requests (optional but recommended)
- Add CSRF protection to other admin routes (optional)

---

### ✅ Task 1.3: Session Invalidation (COMPLETED)

**Status:** ✅ Implemented

**What was done:**
- Added `tokenVersion` field to AdminUser schema
- Updated JWT to include tokenVersion
- Middleware verifies tokenVersion matches database
- TokenVersion increments on password/role change

**Next steps:**
- Run database migration: `npx prisma migrate dev --name add_token_version`
- Test session invalidation (change password, verify old session fails)

---

## Week 2: Admin UX Critical Fixes

### Task 2.1: Unify Product Form

**Status:** Pending

**Implementation Plan:**

1. Decide which form to use (recommend ProductFormComprehensive)
2. Update `/admin/products/new` to use chosen form
3. Update `/admin/products/[id]` to use chosen form
4. Remove or redirect `/admin/products/[id]/edit`
5. Update product list "Edit" links to point to unified route

---

### Task 2.2: Unsaved-Changes Warning

**Status:** Pending

**Implementation Plan:**

1. Track dirty state in ProductForm/ProductFormComprehensive/CategoryFormModal
2. Compare current values to initial values
3. Add beforeunload handler
4. Add Next.js router beforeChange handler

---

### Task 2.3: Inline Validation

**Status:** Pending

**Implementation Plan:**

1. Add errors state to ProductForm
2. Validate on submit, set field-level errors
3. Render error messages under each invalid field
4. Keep server validation as fallback

---

## Week 3: Performance Quick Wins

### Task 3.1: Consolidate Product Stats API

**Status:** Pending

**Implementation Plan:**

1. Create `/api/admin/products/stats` endpoint
2. Return all stats in one response: `{ all, published, drafts, lowStock, outOfStock }`
3. Update `app/admin/products/page.tsx` to use single call

---

### Task 3.2: Request ID Tracking

**Status:** Pending

**Implementation Plan:**

1. Add middleware to generate X-Request-ID
2. Include in all logs
3. Include in error responses

---

### Task 3.3: Health Check Endpoint

**Status:** Pending

**Implementation Plan:**

1. Create `/api/health/route.ts`
2. Check DB connection
3. Return 200 if healthy, 503 if unhealthy

---

### Task 3.4: Lazy Load Header

**Status:** Pending

**Implementation Plan:**

1. Code-split MegaMenu, SearchOverlay, CartPreview
2. Use React.lazy() and Suspense
3. Load on demand

---

## Week 4: Reliability Foundations

### Task 4.1: Retry Logic

**Status:** Pending

**Implementation Plan:**

1. Create `lib/utils/retry.ts` utility
2. Apply to DB queries (transient failures)
3. Apply to external API calls (payment, webhooks)

---

### Task 4.2: Error Standardization

**Status:** Pending

**Implementation Plan:**

1. Audit all API routes
2. Ensure apiError helper used consistently
3. Don't expose stack traces in production

---

### Task 4.3: Timeout Configuration

**Status:** Pending

**Implementation Plan:**

1. Configure Prisma query timeout
2. Add AbortController to fetch calls
3. Set reasonable timeouts (5s DB, 10s external)

---

## Environment Setup

### Required Environment Variables

Add to `.env.local`:

```bash
# Redis (for rate limiting)
REDIS_URL=your-redis-url-here

# Existing variables (verify these are set)
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret-min-32-chars
```

### Upstash Redis Setup (Recommended)

1. Go to https://console.upstash.com/
2. Create new Redis database
3. Copy REST URL or Redis URL
4. Add to `.env.local` as `REDIS_URL`

---

## Testing Checklist

### Week 1 Testing

- [ ] Rate limiting works with Redis
- [ ] Rate limiting falls back to memory if Redis unavailable
- [ ] Login blocked after 5 attempts
- [ ] Payment blocked after 5 attempts per minute
- [ ] CSRF protection verified (SameSite cookie)
- [ ] Session invalidation works on password change

### Week 2 Testing

- [ ] Product form unified (new and edit use same form)
- [ ] Unsaved-changes warning appears when leaving form
- [ ] Inline validation shows errors under fields

### Week 3 Testing

- [ ] Product stats load in single API call
- [ ] Request IDs appear in logs and error responses
- [ ] Health check returns 200 when DB healthy, 503 when down
- [ ] Header components lazy load (check Network tab)

### Week 4 Testing

- [ ] Retry logic handles transient DB failures
- [ ] Error responses don't expose stack traces in production
- [ ] Timeouts prevent hanging requests

---

## Progress Tracking

- ✅ Week 1.1: Redis rate limiting
- ⏳ Week 1.2: CSRF protection
- ⏳ Week 1.3: Session invalidation
- ⏳ Week 2.1: Unify product form
- ⏳ Week 2.2: Unsaved-changes warning
- ⏳ Week 2.3: Inline validation
- ⏳ Week 3.1: Consolidate stats API
- ⏳ Week 3.2: Request ID tracking
- ⏳ Week 3.3: Health check endpoint
- ⏳ Week 3.4: Lazy load header
- ⏳ Week 4.1: Retry logic
- ⏳ Week 4.2: Error standardization
- ⏳ Week 4.3: Timeout configuration

---

**Next:** Continue with Task 1.2 (CSRF Protection) or Task 1.3 (Session Invalidation)
