# 🚨 CRITICAL FIXES NEEDED

## Issue Summary

1. **Products show 0 on website** - Database connection failing on Vercel
2. **Scroll flickering** - CSS transitions causing visual glitches
3. **Login failing** - "Database query failed" due to connection pool exhaustion

## ✅ Fixed Locally

- ✅ Product visibility script confirms 1 product in Boys category
- ✅ Scroll flickering CSS fixed (removed universal transitions)
- ✅ ScrollReveal component optimized

## ⚠️ CRITICAL: Vercel Database Connection

**The main issue:** Vercel `DATABASE_URL` is using **port 5432 (Session mode)** instead of **port 6543 (Transaction mode)**.

### Error in Vercel Logs:
```
FATAL: MaxClientsInSessionMode: max clients reached - in Session mode max clients are limited to pool_size
```

### Fix Steps:

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. **Find `DATABASE_URL`** and update it:

   **Current (WRONG):**
   ```
   postgresql://postgres.[project-ref]:[password]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true
   ```

   **Change to (CORRECT):**
   ```
   postgresql://postgres.[project-ref]:[password]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

   **Only change:** `:5432` → `:6543`

3. **Redeploy** in Vercel (or push a new commit)

4. **After redeploy:**
   - Login should work
   - Products will show on `/collections/boys`
   - No more "MaxClientsInSessionMode" errors

## What Was Fixed in Code

### 1. Scroll Flickering (`app/globals.css`)
- Removed universal `* { transition: ... }` selector
- Applied transitions only to interactive elements
- Removed `will-change: scroll-position` from body

### 2. ScrollReveal Component (`components/ui/ScrollReveal.tsx`)
- Optimized `will-change` usage to prevent unnecessary repaints

### 3. Product Visibility Script (`scripts/fix-product-visibility-now.ts`)
- Created comprehensive fix script
- Confirms products are correctly assigned to categories

## Verification

After updating Vercel DATABASE_URL to port 6543 and redeploying:

1. ✅ Login to admin: `https://extremedeptkidz.com/admin/login`
2. ✅ Check products: `https://extremedeptkidz.com/admin/products`
3. ✅ View Boys collection: `https://extremedeptkidz.com/collections/boys`
4. ✅ Scroll the website - no flickering

## Database Status (Local)

```
✅ Boys category: 1 product
✅ Girls category: 0 products
✅ Product visibility: Fixed
```

The database is correct - the issue is **only** the Vercel connection string port.
