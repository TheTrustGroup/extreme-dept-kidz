# 🚨 CRITICAL FIX: MaxClientsInSessionMode Error

## The Problem

You're seeing this error in Vercel logs:
```
FATAL: MaxClientsInSessionMode: max clients reached - in Session mode max clients are limited to pool_size
```

**Root Cause:** Your `DATABASE_URL` is using **port 5432 (Session mode)** instead of **port 6543 (Transaction mode)**.

## Why This Happens

- **Port 5432 (Session mode):** Only allows 1-2 connections per serverless function
- **Port 6543 (Transaction mode):** Allows many more connections (designed for serverless)

When multiple requests hit Vercel simultaneously (login + collection pages), Session mode runs out of connections and throws this error.

## The Fix

### Step 1: Update Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Change the port from `:5432` to `:6543`

**Before (WRONG):**
```
postgresql://postgres.puuszplmdbindiesfxlr:z7Uooww7O96G2Sdd@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

**After (CORRECT):**
```
postgresql://postgres.puuszplmdbindiesfxlr:z7Uooww7O96G2Sdd@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 2: Redeploy

After updating the environment variable:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger redeploy

### Step 3: Verify

After redeploy, test:
- ✅ Login to admin panel
- ✅ Visit `/collections/boys` - should show products
- ✅ Check Vercel logs - no more "MaxClientsInSessionMode" errors

## How to Get the Correct Connection String

In Supabase Dashboard:
1. Go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Select **Transaction** mode (NOT Session)
4. Copy the connection string
5. It should have `:6543` in it

## Summary

- ❌ **Port 5432** = Session mode = Limited connections = "MaxClientsInSessionMode" error
- ✅ **Port 6543** = Transaction mode = Many connections = Works for serverless

**Update Vercel `DATABASE_URL` to use port 6543, then redeploy.**
