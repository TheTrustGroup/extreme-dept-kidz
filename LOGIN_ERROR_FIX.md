# Login Internal Server Error - Diagnostic Guide

## Common Causes

### 1. **Missing Environment Variables** (Most Common)
- `DATABASE_URL` not set or incorrect
- `JWT_SECRET` not set or too short (< 32 characters)

**Check:**
```bash
# In Vercel: Settings → Environment Variables
# Ensure DATABASE_URL and JWT_SECRET are set
```

### 2. **Database Connection Issues**
- Database URL incorrect
- Using wrong port (should use Supabase pooler port 6543, not 5432)
- Database credentials expired

**Fix:**
- Use Supabase Transaction pooler: `postgresql://...@pooler.supabase.com:6543/...`
- Not direct connection: `postgresql://...@db.supabase.com:5432/...`

### 3. **Bot Detection False Positive**
- Bot detection was too aggressive (now fixed)
- Missing headers triggering false positives

**Status:** Fixed - Bot detection threshold increased from 70 to 80

### 4. **Prisma Client Not Initialized**
- Prisma client failed to initialize
- Database connection timeout

**Check:**
- Visit `/api/admin/auth/test-db` to test database connection

## Diagnostic Steps

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Check for any error messages

### Step 2: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Click on the `/api/admin/auth/login` request
5. Check:
   - Status code (should be 200 for success)
   - Response body (shows error message)
   - Request headers

### Step 3: Check Server Logs
- Vercel Dashboard → Functions → View logs
- Look for `[Login]` prefixed messages
- Check for error messages

### Step 4: Test Database Connection
Visit: `https://extremedeptkidz.com/api/admin/auth/test-db`

This will show:
- Database connection status
- Prisma client status
- Environment variables status

### Step 5: Test Login Endpoint (Development Only)
Visit: `https://extremedeptkidz.com/api/admin/auth/diagnose`

This provides detailed diagnostics about:
- Environment variables
- Database connection
- Prisma client
- User lookup

## Quick Fixes

### Fix 1: Verify Environment Variables

**In Vercel:**
1. Go to Project Settings → Environment Variables
2. Verify:
   - `DATABASE_URL` exists and is correct
   - `JWT_SECRET` exists and is at least 32 characters
3. Redeploy if you made changes

### Fix 2: Check Database URL Format

**Correct Format (Supabase Pooler):**
```
postgresql://user:password@pooler.supabase.com:6543/database?pgbouncer=true
```

**Wrong Format (Direct Connection):**
```
postgresql://user:password@db.supabase.com:5432/database
```

### Fix 3: Verify Admin User Exists

Run in Supabase SQL Editor:
```sql
SELECT id, email, "isActive", "passwordHash" IS NOT NULL as has_password
FROM "AdminUser"
WHERE email = 'your-email@example.com';
```

### Fix 4: Reset Admin Password

If password hash is missing or incorrect:
```sql
-- Update password hash (replace with actual hash)
UPDATE "AdminUser"
SET "passwordHash" = '$2a$10$...' -- Use bcrypt hash
WHERE email = 'your-email@example.com';
```

## Error Messages Reference

| Error Message | Cause | Fix |
|--------------|-------|-----|
| "DATABASE_URL is not set" | Missing env var | Set DATABASE_URL in Vercel |
| "JWT_SECRET is not set" | Missing env var | Set JWT_SECRET in Vercel |
| "JWT_SECRET must be at least 32 characters" | Secret too short | Use longer secret (32+ chars) |
| "Database connection unavailable" | Prisma not initialized | Check DATABASE_URL format |
| "Unable to connect to database" | Connection failed | Use Supabase pooler (port 6543) |
| "Suspicious activity detected" | Bot detection | Should be fixed now (threshold increased) |
| "Invalid email or password" | Wrong credentials | Check email/password |
| "Account is inactive" | User inactive | Set isActive=true in database |

## Testing

After fixes, test login:
1. Clear browser cookies
2. Try logging in
3. Check browser console for errors
4. Check network tab for response

## Still Not Working?

1. Check Vercel function logs for detailed error
2. Verify environment variables are set correctly
3. Test database connection: `/api/admin/auth/test-db`
4. Check if admin user exists and is active
5. Verify JWT_SECRET is set and long enough
