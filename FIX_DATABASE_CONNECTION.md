# 🔧 Fix Database Connection Issue

## Problem
The diagnostic shows:
```
Can't reach database server at `db.puuszplmdbindiesfxlr.supabase.co:5432`
```

This means Vercel can't connect to your Supabase database.

## ✅ Solution: Use Supabase Connection Pooler

Vercel serverless functions work better with Supabase's **connection pooler** instead of direct connections.

### Step 1: Get Connection Pooler URL from Supabase

1. Go to **Supabase Dashboard** → Your Project
2. Click **Settings** (gear icon) → **Database**
3. Scroll down to **Connection Pooling**
4. Find **Connection String** under **Transaction Mode** or **Session Mode**
5. It should look like:
   ```
   postgresql://postgres.puuszplmdbindiesfxlr:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
   OR
   ```
   postgresql://postgres.puuszplmdbindiesfxlr:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres?pgbouncer=true
   ```

### Step 2: Update DATABASE_URL in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click **Edit**
4. Replace the value with the **Connection Pooler URL** from Step 1
5. Make sure to:
   - Replace `[YOUR-PASSWORD]` with your actual password: `Zillion0031!`
   - URL encode the password: `Zillion0031%21`
   - Keep `?pgbouncer=true` if it's in the pooler URL
   - OR add `?sslmode=require` if not present
6. Click **Save**

**Example Connection Pooler URL:**
```
postgresql://postgres.puuszplmdbindiesfxlr:Zillion0031%21@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### Step 3: Alternative - Check Supabase Project Status

If connection pooler doesn't work, check:

1. **Is your Supabase project active?**
   - Go to Supabase Dashboard
   - Check if project shows as "Active" (not "Paused")
   - Free tier projects pause after inactivity

2. **Restore paused project:**
   - If paused, click "Restore" to reactivate it
   - Wait a few minutes for it to fully start

3. **Get fresh connection string:**
   - Go to Settings → Database
   - Copy the **Connection String** (not pooler)
   - Make sure it's the latest one

### Step 4: Try Direct Connection with Port 5432

If pooler doesn't work, try the direct connection:

1. Go to Supabase Dashboard → Settings → Database
2. Find **Connection String** (not Connection Pooling)
3. Copy the connection string
4. It should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.puuszplmdbindiesfxlr.supabase.co:5432/postgres
   ```
5. Update `DATABASE_URL` in Vercel with this value
6. Make sure password is URL encoded: `Zillion0031%21`
7. Add `?sslmode=require` at the end

**Example:**
```
postgresql://postgres:Zillion0031%21@db.puuszplmdbindiesfxlr.supabase.co:5432/postgres?sslmode=require
```

### Step 5: Redeploy on Vercel

**Important:** After updating `DATABASE_URL`:

1. Go to **Deployments** tab
2. Click **⋯** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 6: Test Again

Visit the diagnostic endpoint:
```
https://your-domain.vercel.app/api/admin/auth/diagnose
```

Should now show:
```json
{
  "database": {
    "connected": true
  }
}
```

---

## Common Issues

### Issue: "Project is paused"

**Fix:**
- Go to Supabase Dashboard
- Click "Restore" if project is paused
- Wait 2-3 minutes for it to fully start
- Try connecting again

### Issue: "Connection timeout"

**Fix:**
- Use Connection Pooler instead of direct connection
- Pooler is optimized for serverless (Vercel)
- Direct connection may timeout in serverless environments

### Issue: "Authentication failed"

**Fix:**
- Check password is correct
- Make sure password is URL encoded (`!` becomes `%21`)
- Verify connection string format

### Issue: "SSL required"

**Fix:**
- Add `?sslmode=require` to connection string
- Or use pooler which handles SSL automatically

---

## Quick Checklist

- [ ] Supabase project is **Active** (not paused)
- [ ] Got Connection Pooler URL from Supabase
- [ ] Updated `DATABASE_URL` in Vercel with pooler URL
- [ ] Password is URL encoded (`Zillion0031%21`)
- [ ] Added `?sslmode=require` or `?pgbouncer=true`
- [ ] Redeployed on Vercel
- [ ] Diagnostic endpoint shows `database.connected: true`

---

## Connection String Formats

### Direct Connection (may timeout in serverless):
```
postgresql://postgres:Zillion0031%21@db.puuszplmdbindiesfxlr.supabase.co:5432/postgres?sslmode=require
```

### Connection Pooler (Recommended for Vercel):
```
postgresql://postgres.puuszplmdbindiesfxlr:Zillion0031%21@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
```

OR

```
postgresql://postgres.puuszplmdbindiesfxlr:Zillion0031%21@aws-0-[region].pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require
```

**Note:** Replace `[region]` with your actual region (e.g., `us-east-1`, `eu-west-1`)

---

## Next Steps After Database Connects

Once the database connection works:

1. **Create admin user** (if not exists):
   - Run SQL in Supabase (see FIX_LOGIN_NOW.md)
   
2. **Test login:**
   - Go to `/admin/login`
   - Use: `admin@extremedeptkidz.com` / `Admin123!`
