# Fix Database Connection Error in Vercel

## Error Message
"Unable to connect to database. Use the Supabase connection pooler (port 6543) in Vercel DATABASE_URL"

## Quick Fix

### Step 1: Get Correct Connection String from Supabase

1. Go to **Supabase Dashboard** → Your Project (`puuszplmdbindiesfxlr`)
2. Navigate to **Settings** → **Database**
3. Scroll to **Connection string** section
4. Select **Transaction** mode (NOT Session)
5. Copy the connection string - it should look like:
   ```
   postgresql://postgres.puuszplmdbindiesfxlr:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
6. **Important:** Make sure it has `:6543` (NOT `:5432`)

### Step 2: Update Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project
2. Navigate to **Settings** → **Environment Variables**
3. Find `DATABASE_URL` (or create it if it doesn't exist)
4. **Update the value** with the connection string from Step 1
5. Make sure it includes:
   - ✅ Port `6543` (Transaction mode)
   - ✅ `pooler.supabase.com` (NOT `db.supabase.com`)
   - ✅ `?pgbouncer=true` parameter
6. Set for: **Production**, **Preview**, and **Development**
7. Click **Save**

### Step 3: Add Supabase Realtime Variables (Optional but Recommended)

Also add these for Realtime features:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: `https://puuszplmdbindiesfxlr.supabase.co`
   - Get from: Supabase Dashboard → Settings → API → Project URL

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: Your anon/public key
   - Get from: Supabase Dashboard → Settings → API → Project API keys → `anon public`

### Step 4: Redeploy

After updating environment variables:

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger automatic redeploy

### Step 5: Verify

After redeploy:

1. Try logging in again
2. If still failing, check: `https://extremedeptkidz.com/api/admin/auth/test-db`
3. This will show detailed connection diagnostics

## Common Issues

### Issue: Still Getting Connection Error After Update

**Check:**
- Did you redeploy after updating environment variables?
- Is the port `6543` (not `5432`)?
- Does the connection string include `?pgbouncer=true`?
- Is your Supabase project active (not paused)?

### Issue: "MaxClientsInSessionMode" Error

**Cause:** Using port `5432` (Session mode) instead of `6543` (Transaction mode)

**Fix:** Update `DATABASE_URL` to use port `6543`

### Issue: Connection Works Locally But Not in Vercel

**Cause:** Environment variables not set in Vercel

**Fix:** Add `DATABASE_URL` to Vercel → Settings → Environment Variables

## Current Configuration (from .env.local)

Your local `.env.local` has:
```
DATABASE_URL=postgresql://postgres.puuszplmdbindiesfxlr:z7Uooww7O96G2Sdd@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Make sure Vercel has the EXACT same value** (with your actual password, not the example one).

## Need Help?

1. Check Vercel logs: Dashboard → Your Project → Logs
2. Test connection: `https://extremedeptkidz.com/api/admin/auth/test-db`
3. Check Supabase: Dashboard → Settings → Database → Connection string
