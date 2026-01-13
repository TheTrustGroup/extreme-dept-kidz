# Fix: Prepared Statement Error (42P05)

## The Error

```
ERROR: prepared statement "s0" already exists
Code: 42P05
```

This error occurs when using Prisma with connection poolers (like Supabase's PgBouncer) because:
- Prisma uses prepared statements for queries
- Connection poolers reuse connections
- When Prisma tries to create a prepared statement that already exists on a reused connection, PostgreSQL throws this error

## ✅ Solution

### Option 1: Add `?pgbouncer=true` to Connection String (RECOMMENDED)

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. **Find `DATABASE_URL`** and click to edit
3. **Add `?pgbouncer=true`** to the end of the connection string

**Before:**
```
postgresql://postgres.puuszplmdbindiesfxlr:password@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**After:**
```
postgresql://postgres.puuszplmdbindiesfxlr:password@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

**Important:**
- If the connection string already has `?sslmode=require`, use `&pgbouncer=true` (with `&`)
- If it doesn't have any parameters, use `?pgbouncer=true` (with `?`)

4. **Redeploy** your application in Vercel

### Option 2: Use Direct Connection (Not Recommended for Serverless)

If the pooler continues to cause issues, you can use the direct connection (port 5432):

1. Go to **Supabase Dashboard** → **Settings** → **Database**
2. Copy the **Connection String** (not Connection Pooling)
3. Update `DATABASE_URL` in Vercel with this value
4. **Note:** Direct connections may timeout in serverless environments

## What We Fixed

1. ✅ Changed connection testing from `$queryRaw` to `$connect()` (avoids prepared statements)
2. ✅ Added better error detection for 42P05 errors
3. ✅ Improved error messages with specific recommendations
4. ✅ All connection tests now use `$connect()` instead of `$queryRaw`

## Verification

After updating the connection string:

1. Visit: `https://your-domain.vercel.app/api/admin/auth/test-db`
2. Should show: `"connectionTest": "success"`
3. No more "prepared statement already exists" errors

## Technical Details

- **Error Code:** `42P05` = PostgreSQL "duplicate prepared statement"
- **Cause:** Connection pooler reusing connections with existing prepared statements
- **Fix:** Add `?pgbouncer=true` parameter to tell Prisma to work with PgBouncer
- **Alternative:** Use `$connect()` instead of `$queryRaw` for connection tests (already implemented)

## Still Having Issues?

1. Verify connection string format is correct
2. Check Supabase project is active (not paused)
3. Ensure password is URL-encoded
4. Try regenerating connection string from Supabase Dashboard
5. Check Supabase network restrictions/allowlist
