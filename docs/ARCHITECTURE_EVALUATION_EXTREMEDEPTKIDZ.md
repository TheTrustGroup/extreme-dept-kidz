# Architecture & Systems Engineering Evaluation  
## extremedeptkidz.com Platform

**Evaluator:** Principal Software Architect / Systems Engineer  
**Scope:** Mission-critical readiness, scalability, real-time behavior, failure modes, operational stress  
**Date:** February 2025

---

## Executive Summary

The platform has **strong foundations** in data modeling, auth, security hardening, and performance tuning. Several areas are **production-ready** and built to last. However, **critical gaps** in the order and payment lifecycle prevent it from being **mission-critical** under real-world load: **orders are never persisted**, **payment success does not create orders or update inventory**, and **order tracking uses mock data**. Until these are addressed, the system will not scale reliably for revenue and fulfillment.

| Area | Verdict | Notes |
|------|---------|--------|
| Data model & schema | ✅ Strong | Indexes, RBAC, audit trail, inventory logs |
| Auth & RBAC | ✅ Strong | JWT, CSRF, rate limit, retry, bot detection |
| API & infra patterns | ✅ Good | Standardized responses, CORS, health, request ID |
| Security baseline | ✅ Good | Env validation, HSTS, headers, no console in prod |
| **Order & payment lifecycle** | ❌ **Critical** | No order creation; no DB persistence; track order mock |
| **Payment reliability** | ⚠️ At risk | No webhook; client-only verification; no idempotency |
| **Rate limiting at scale** | ⚠️ At risk | In-memory fallback per instance (serverless) |
| Observability & ops | ⚠️ Gaps | No APM, no metrics, logging reduced in prod |

---

## 1. What Is Built Well (Apple-Grade Foundations)

### 1.1 Data Model & Database

- **Prisma schema** is clear and scalable: `Product`, `ProductVariant`, `Order`, `OrderItem`, `InventoryLog`, `AdminUser`, `AdminActivityLog`, `CompleteLook`, `NewsletterSubscriber`. Appropriate indexes on slug, categoryId, status, createdAt, etc.
- **Inventory** supports `reserved` and `InventoryLog` for audit; sync uses **transactions** (all-or-nothing).
- **Connection handling**: Prisma singleton, Supabase pooler URL normalization (`pgbouncer=true`, `sslmode=require`), lazy init when `DATABASE_URL` is missing (build without DB). Good for serverless cold starts.
- **Retry & timeout**: `retryPrismaQuery` with configurable timeout and exponential backoff; used in login and health check.

### 1.2 Authentication & Authorization

- **Admin auth**: JWT in httpOnly cookie, CSRF token, `tokenVersion` for session invalidation.
- **RBAC**: Role hierarchy (viewer → driver → warehouse/cashier/manager → admin → super_admin) and permission checks (`hasPermission`, `hasRequiredRole`).
- **Login hardening**: Bot detection, rate limiting (Redis with in-memory fallback), failed-attempt tracking, timing-attack delay, activity logging. Env checks (JWT_SECRET, DATABASE_URL) fail fast with clear errors.
- **Middleware**: Request ID generation (Web Crypto), CORS for known origins (main, www, warehouse, localhost).

### 1.3 API & Infrastructure

- **Response contract**: `apiSuccess` / `apiError` / `apiValidationError` / `apiUnauthorized` / `apiNotFound` / `apiRateLimit` with request ID and safe production error messages.
- **Validation**: Zod schemas (e.g. `adminLoginSchema`, `initiateSchema` for Paystack).
- **Health**: `GET /api/health` returns 200/503 with DB check and retry; suitable for load balancers and monitoring.
- **Caching**: Static assets and `_next/static` use long-lived immutable cache; dynamic routes and product/order APIs use `no-store` to avoid stale data.
- **Next.js**: Bundle splitting (react, framer-motion, lucide-react, recharts, etc.), image config (avif/webp, device sizes), compression, security headers (HSTS, X-Frame-Options, etc.), `serverComponentsExternalPackages: ['@prisma/client']`.

### 1.4 Security Baseline

- **Env validation** (`lib/config/env.ts`): Required vars (JWT_SECRET, DATABASE_URL, NEXT_PUBLIC_SITE_URL) validated at runtime; production fails fast.
- **Headers**: X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS.
- **Production**: `removeConsole` keeps only `console.error`; `poweredByHeader: false`.

---

## 2. Critical Gaps (Must Fix for Mission-Critical Scale)

### 2.1 Orders Are Never Created

**Finding:** The checkout flow does **not** create an `Order` or `OrderItem` in the database.

- In `CheckoutPageClient.tsx`, `orderId` is set to `ORD-${Date.now()}` (client-only).
- Paystack (or MoMo) is initiated with this id; on success the UI clears the cart and redirects to success. **No server-side order creation or inventory deduction.**
- Admin order list and stats read from `prisma.order`; there is no API that performs `prisma.order.create(...)` in the customer checkout path.
- **Impact:** Revenue and fulfillment cannot be tracked; inventory is not reserved or decremented on sale; “Track order” cannot show real data.

**Recommendation:**

1. Introduce a **Create Order** API (e.g. `POST /api/orders` or part of checkout) that:
   - Accepts cart items, shipping, payment method, and (for idempotency) a client-generated idempotency key.
   - Runs in a **transaction**: create `Order` (status PENDING), create `OrderItem`s, optionally reserve inventory (`ProductVariant.reserved` or equivalent).
   - Returns `orderId` (and optionally `orderNumber`) for use in Paystack/MoMo metadata.
2. Call this API **before** redirecting to Paystack (or after collecting intent); use the returned `orderId` as the payment reference so that when payment is confirmed (webhook or verify), you update the same order and commit inventory.

### 2.2 Payment Success Not Tied to Order or Inventory

**Finding:** Payment verification is **client-only** (polling on `/checkout/payment-status`). There is **no Paystack webhook** and no server-side step that, on payment success, updates an order and deducts inventory.

- `verifyPaystackTransaction` only checks status; no code path creates or updates `Order` or `InventoryLog`.
- If the user closes the tab after paying, the payment can succeed but no order is recorded and stock is not updated.
- **Impact:** Money received but no order record; inventory and financials diverge; support and operations cannot reconcile.

**Recommendation:**

1. **Paystack webhook** (e.g. `POST /api/webhooks/paystack`):
   - Verify signature using Paystack secret.
   - On `charge.success`, load order by reference (orderId), set `paymentStatus: COMPLETED`, update `Order.status` (e.g. PROCESSING), deduct/reserve inventory and write `InventoryLog`.
   - Make the handler **idempotent** (e.g. if order already COMPLETED, return 200 and no-op).
2. **Optional but recommended:** After webhook updates the order, trigger cache revalidation or notify so the “Track order” and admin views stay correct.
3. Keep client-side verify as a UX enhancement (e.g. show “Payment confirmed” quickly), but treat **webhook as source of truth** for order and inventory state.

### 2.3 Order Tracking Uses Mock Data

**Finding:** `app/api/orders/track/route.ts` returns a **hardcoded** `mockOrders` map; the production path (query by `orderNumber` and `email`) is commented out.

- **Impact:** Customers cannot track real orders; support cannot use the same API for real status.

**Recommendation:**

- Replace mock with Prisma: `prisma.order.findFirst({ where: { orderNumber, ... } })` with proper `email` check (e.g. from `shippingAddress` JSON or a dedicated field). Enforce rate limiting and minimal data exposure.

### 2.4 No Idempotency for Payment and Order Creation

**Finding:** Payment initiate and order creation (once implemented) have no idempotency key. Double-clicks or retries can lead to duplicate payment attempts or duplicate orders.

**Recommendation:**

- For **order creation**: Require an idempotency key (header or body), store it on `Order` or in a small idempotency table; on replay return the same order and 200.
- For **payment**: Use the same order id as reference and ensure webhook and verify are idempotent (e.g. “already completed” → 200, no duplicate deduction).

---

## 3. High‑Impact Risks (Scale & Reliability)

### 3.1 Rate Limiting and In-Memory State in Serverless

**Finding:** Rate limiting uses Redis with an **in-memory fallback**. Login also keeps `failedAttempts` in a **module-level `Map`**.

- On Vercel (or any serverless), each function instance has its own memory. So:
  - Rate limits are **per instance**, not global; an attacker can get more requests by spreading across instances.
  - Failed login count resets per instance; account lockout is not reliable.

**Recommendation:**

- Treat **Redis (or equivalent) as required in production** for rate limit and failed-attempt state; fail closed (e.g. reject or strict limit) if Redis is down, or document that without Redis the system is best-effort only.
- Move failed-attempt tracking to Redis (or DB) keyed by IP or email so it is consistent across instances.

### 3.2 Observability and Operations

**Finding:**

- **Logging:** In production, only `console.error` is always on; other levels require `ENABLE_LOGGING`. So normal request flow and performance are hard to debug in production.
- **Metrics:** No OpenTelemetry, APM, or structured metrics (e.g. request duration, DB latency, payment success/failure). No built-in alerting.
- **Request ID:** Set in middleware and passed in some routes; not consistently propagated to all layers (e.g. logger, external calls).

**Recommendation:**

- Add **structured logging** (JSON) with request ID and correlation ID on every request; sample or log at least errors and slow requests in production.
- Add **metrics**: duration and status for critical paths (login, payment initiate/verify, order create, health). Export to Vercel Analytics, Datadog, or similar.
- **Alerting:** On health 503, payment webhook failure, or order-creation failure; on error rate or latency SLO breach.

### 3.3 MoMo Webhook and Paystack Webhook Security

**Finding:**

- MoMo callback has a TODO: “Implement webhook signature verification.” Unverified webhooks are a security risk.
- Paystack webhook endpoint is not present; verification is only via client polling.

**Recommendation:**

- Implement **signature verification** for MoMo and Paystack webhooks using official docs; reject invalid requests with 401/403.
- Add Paystack webhook as in §2.2 and protect it with signature verification.

---

## 4. Other Notable Points

### 4.1 Supabase Realtime

- `lib/supabase/realtime-hooks.ts` and Supabase client exist, but the app uses **Prisma + PostgreSQL** for data. Realtime is not used in the main product/order flow. Either:
  - Use it for a defined feature (e.g. admin live updates) and document, or
  - Remove to avoid confusion and dependency.

### 4.2 Seed and Dangerous Endpoints

- `app/api/seed/route.ts` can modify data. Ensure it is **disabled or strictly protected** in production (e.g. check `REVALIDATE_SECRET` or admin role and env).

### 4.3 Cache Headers: vercel.json vs next.config

- `vercel.json` sets cache headers (e.g. `s-maxage=10`, `stale-while-revalidate=59`) for `/`, `/collections/*`, `/products/*`. Next.js config sets `no-store` for the same. Confirm **Vercel precedence** so dynamic content is never cached when it shouldn’t be.

### 4.4 Circuit Breakers and External Calls

- Retries exist for DB and Paystack; there is no **circuit breaker** for Paystack (or MoMo). Under sustained provider failure, every request will retry and add load. Optional improvement: open circuit after N failures and fail fast until cooldown.

---

## 5. Prioritized Remediation Roadmap

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P0 | Implement order creation API (transaction: Order + OrderItems + optional reserve) and call it from checkout before payment redirect | Medium | Unblocks revenue and fulfillment |
| P0 | Add Paystack webhook; on success update order and inventory; verify signature; idempotent | Medium | Single source of truth for payment and stock |
| P0 | Replace order track mock with real DB query (orderNumber + email) | Small | Real tracking and support |
| P1 | Require Redis (or equivalent) for production rate limit and failed-login state; document | Small | Reliable protection at scale |
| P1 | Idempotency keys for order creation and payment flows | Small | Prevents duplicates |
| P1 | MoMo webhook signature verification | Small | Security |
| P2 | Structured logging + request ID everywhere; metrics + alerting for health, payment, orders | Medium | Operability and incident response |
| P2 | Circuit breaker for Paystack (and MoMo) optional | Small | Resiliency under provider outages |

---

## 6. Conclusion

The platform is **architected with good discipline** in schema design, auth, RBAC, security headers, retries, and caching. For **mission-critical, high-load operation**, the main blockers are **business logic and data integrity**: orders are not created, payment success is not persisted or tied to inventory, and order tracking is mock-only. Addressing **order creation**, **Paystack (and MoMo) webhooks**, and **real order tracking** will align the system with the intended commerce flow. After that, **rate limiting and observability** (Redis, logging, metrics, alerting) will strengthen scalability and operations under stress.

---

*This evaluation is based on a static and flow-based review of the repository (Prisma schema, API routes, checkout and payment flows, middleware, config, and supporting libs). Runtime behavior (e.g. under load or failover) should be validated with tests and staging runs.*
