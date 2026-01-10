# ✅ Update DATABASE_URL to Use Connection Pooler

## Good News! 
`"databaseUrl":"Set (hidden)"` means the environment variable IS loading! ✅

## The Problem
It's still trying to connect to `db.puuszplmdbindiesfxlr.supabase.co:5432` (direct connection) which doesn't work from Vercel.

## ✅ Solution: Switch to Connection Pooler

### Step 1: Get Connection Pooler URL from Supabase

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: `puuszplmdbindiesfxlr`
3. Click **Settings** (gear icon) → **Database**
4. Scroll down to **Connection Pooling** section
5. You'll see **Connection string** with two options:
   - **Transaction mode** (recommended)
   - **Session mode**

6. **Copy the Connection string** from **Transaction mode**
   - It will look like:
     ```
     postgresql://postgres.puuszplmdbindiesfxlr:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
     ```
   - **OR** it might be:
     ```
     postgresql://postgres.puuszplmdbindiesfxlr:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true
     ```

### Step 2: Build the Correct Connection String

**Important differences from direct connection:**
- Uses `postgres.puuszplmdbindiesfxlr` (with **dot**, not colon)
- Uses `pooler.supabase.com` (NOT `db.supabase.co`)
- Uses port `6543` (pooler port) OR `5432` with `?pgbouncer=true`

**Replace `[YOUR-PASSWORD]` with your password:**
- Password: `Zillion0031!`
- URL encoded: `Zillion0031%21`

**Final format (port 6543):**
```
postgresql://postgres.puuszplmdbindiesfxlr:Zillion0031%21@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**OR (port 5432 with pgbouncer):**
```
postgresql://postgres.puuszplmdbindiesfxlr:Zillion0031%21@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require
```

**Note:** Replace `us-east-1` with your actual region if different.

### Step 3: Update DATABASE_URL in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. Click on `DATABASE_URL` to edit
4. **DELETE** the entire old value
5. **PASTE** the new pooler URL from Step 2
6. **Verify:**
   - ✅ Uses `pooler.supabase.com` (not `db.supabase.co`)
   - ✅ Uses `postgres.puuszplmdbindiesfxlr` (with dot)
   - ✅ Password is `Zillion0031%21` (URL encoded)
   - ✅ Has `?sslmode=require` at the end
7. Click **Save**

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click **⋯** on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes for completion

### Step 5: Test

Visit: `https://your-domain.vercel.app/api/admin/auth/diagnose`

**Expected result:**
```json
{
  "database": {
    "connected": true
  }
}
```

## 🔍 How to Find Your Region

If you're not sure what region to use in the pooler URL:

1. Supabase Dashboard → Settings → Database
2. Look at the **Connection Pooling** section
3. The region is in the hostname: `aws-0-[REGION].pooler.supabase.com`
4. Common regions:
   - `us-east-1` (US East)
   - `us-west-1` (US West)
   - `eu-west-1` (Europe)
   - `ap-southeast-1` (Asia)

## 📋 Quick Checklist

- [ ] Got Connection Pooler URL from Supabase (Transaction mode)
- [ ] URL uses `pooler.supabase.com` (NOT `db.supabase.co`)
- [ ] URL uses `postgres.puuszplmdbindiesfxlr` (with dot)
- [ ] Password is URL encoded: `Zillion0031%21`
- [ ] Port is `6543` OR `5432` with `?pgbouncer=true`
- [ ] Has `?sslmode=require` at the end
- [ ] Updated `DATABASE_URL` in Vercel
- [ ] Redeployed on Vercel
- [ ] Test shows `"connected": true`

## 🆘 If Connection Pooling is Not Available

If you don't see "Connection Pooling" in Supabase:

1. **Check project status:**
   - Make sure project is **Active** (not paused)
   - Free tier projects should have pooling

2. **Try direct connection with timeout:**
   ```
   postgresql://postgres:Zillion0031%21@db.puuszplmdbindiesfxlr.supabase.co:5432/postgres?sslmode=require&connect_timeout=10
   ```

3. **Contact Supabase support** if pooling isn't available

## ✅ After Connection Works

Once `"connected": true`:

1. **Create admin user** in Supabase (if not exists)
2. **Test login** at `/admin/login`
3. **You're done!** 🎉
