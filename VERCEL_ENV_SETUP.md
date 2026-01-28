# Vercel Environment Variables Setup

## ⚠️ CRITICAL: Environment Variables Must Be Set in Vercel

Your `.env.local` file only works for **local development**. In production (Vercel), you **MUST** set environment variables in the Vercel dashboard.

## Step-by-Step Setup

### 1. Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your project: **EXTREME DEPT KIDZ 1.0**

### 2. Navigate to Environment Variables
1. Click **Settings** tab
2. Click **Environment Variables** in the left sidebar

### 3. Add Required Variables

#### **DATABASE_URL** (Required)
```
postgresql://postgres.puuszplmdbindiesfxlr:z7Uooww7O96G2Sdd@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**⚠️ CRITICAL - Port 6543 (Transaction Mode) Required:**
- **Port 6543** = Transaction mode (for serverless/Vercel) ✅ **USE THIS**
- **Port 5432** = Session mode (limited connections, causes "MaxClientsInSessionMode" errors) ❌ **DON'T USE**
- Use the **pooler** connection (not direct)
- Include `?pgbouncer=true` at the end
- This prevents "prepared statement already exists" errors and connection pool exhaustion

#### **JWT_SECRET** (Required)
```
edbf56ab7567b37d8fcb7a6255a5eb2a39f740dcf0694529f8448e2ff1ae9893
```

**Important:**
- Must be at least 32 characters (yours is 64, which is perfect)
- Keep this secret - never commit it to git

### 4. Set Environment Scope
For each variable:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

### 5. Redeploy
After adding variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger redeploy

## Verify Setup

### Check in Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Verify both variables are listed:
   - `DATABASE_URL`
   - `JWT_SECRET`

### Test Database Connection:
Visit: `https://extremedeptkidz.com/api/admin/auth/test-db`

Should show:
- ✅ Database connected
- ✅ Prisma client initialized
- ✅ Environment variables set

## Common Issues

### Issue: "DATABASE_URL is not set"
**Fix:** Add `DATABASE_URL` in Vercel → Settings → Environment Variables

### Issue: "JWT_SECRET is not set"
**Fix:** Add `JWT_SECRET` in Vercel → Settings → Environment Variables

### Issue: "Database connection failed"
**Possible causes:**
1. Wrong DATABASE_URL format
2. Database credentials expired
3. Missing `?pgbouncer=true` parameter
4. Using wrong port (5432 instead of 6543)

**Fix:** 
- Verify DATABASE_URL includes `?pgbouncer=true`
- **Use port 6543 (Transaction mode), NOT 5432 (Session mode)**
- Check Supabase dashboard for updated credentials

### Issue: "Prepared statement already exists" (42P05)
**Fix:** Add `?pgbouncer=true` to DATABASE_URL

### Issue: "MaxClientsInSessionMode: max clients reached"
**Cause:** Using port 5432 (Session mode) instead of 6543 (Transaction mode)
**Fix:** 
- Change port from `:5432` to `:6543` in DATABASE_URL
- Session mode only allows 1-2 connections per serverless function
- Transaction mode allows many more connections (required for Vercel)

## Your Current Setup

Based on your `.env.local`:

**DATABASE_URL:**
```
postgresql://postgres.puuszplmdbindiesfxlr:z7Uooww7O96G2Sdd@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**JWT_SECRET:**
```
edbf56ab7567b37d8fcb7a6255a5eb2a39f740dcf0694529f8448e2ff1ae9893
```

Copy these **exactly** into Vercel environment variables.

## After Setup

1. ✅ Variables added to Vercel
2. ✅ Redeploy triggered
3. ✅ Test login again
4. ✅ Check `/api/admin/auth/test-db` for diagnostics

## Still Having Issues?

1. Check Vercel function logs:
   - Vercel Dashboard → Your Project → Functions → View logs
   - Look for `[Login]` prefixed messages

2. Test database connection:
   - Visit `/api/admin/auth/test-db`
   - Check response for errors

3. Verify admin user exists:
   - Check Supabase dashboard
   - Verify user email and `isActive` status
