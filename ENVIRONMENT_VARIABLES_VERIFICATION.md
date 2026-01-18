# 🔐 Environment Variables Verification Guide

## Required Environment Variables

### 1. DATABASE_URL (Required)

**Purpose:** PostgreSQL connection string for Supabase database

**Format:**
```
postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

**Important Notes:**
- Must include `?sslmode=require` at the end
- Password special characters must be URL-encoded (e.g., `!` becomes `%21`)
- Must be set in **Vercel Dashboard** → Settings → Environment Variables
- Enable for: ✅ Production ✅ Preview ✅ Development

**Verification:**
- Check Vercel Dashboard → Settings → Environment Variables
- Ensure variable name is exactly `DATABASE_URL` (case-sensitive)
- Test connection: Visit `/api/admin/auth/test-db` endpoint

---

### 2. JWT_SECRET (Required)

**Purpose:** Secret key for signing and verifying JWT tokens

**Requirements:**
- Minimum 32 characters long
- Should be a random, secure string
- Must be the same value in all environments (Production, Preview, Development)

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example:**
```
9b704c662d0eb6c4cafdb5824711204ac71efe311b06e2739c76fa377e4281da
```

**Important Notes:**
- Must be set in **Vercel Dashboard** → Settings → Environment Variables
- Variable name must be exactly `JWT_SECRET` (case-sensitive)
- Enable for: ✅ Production ✅ Preview ✅ Development
- **CRITICAL:** If JWT_SECRET changes, all existing tokens become invalid

**Verification:**
- Check Vercel Dashboard → Settings → Environment Variables
- Ensure length is at least 32 characters
- Test token generation: Visit `/api/admin/auth/diagnose` endpoint

---

### 3. JWT_EXPIRES_IN (Optional)

**Purpose:** Token expiration time

**Default:** `7d` (7 days)

**Format:**
- `7d` = 7 days
- `24h` = 24 hours
- `1h` = 1 hour
- `30m` = 30 minutes

**Important Notes:**
- Optional - defaults to `7d` if not set
- Must be set in **Vercel Dashboard** → Settings → Environment Variables
- Variable name must be exactly `JWT_EXPIRES_IN` (case-sensitive)
- Enable for: ✅ Production ✅ Preview ✅ Development

---

## Vercel Environment Variables Setup

### Step 1: Access Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project: `extreme-dept-kidz` (or your project name)
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Add/Update Variables

For each variable:

1. **Click "Add New"** (or edit existing)
2. **Enter variable name** (exactly as shown, case-sensitive)
3. **Enter variable value** (no quotes, no spaces)
4. **Select environments:** ✅ Production ✅ Preview ✅ Development
5. **Click "Save"**

### Step 3: Verify Variables

After adding variables, verify:

- [ ] `DATABASE_URL` is set and starts with `postgresql://`
- [ ] `JWT_SECRET` is set and is at least 32 characters
- [ ] `JWT_EXPIRES_IN` is set (optional, defaults to `7d`)
- [ ] All variables are enabled for Production, Preview, and Development

### Step 4: Redeploy

**IMPORTANT:** Environment variables only apply to **new deployments**

1. Go to **Deployments** tab
2. Click **⋯** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (2-3 minutes)

---

## Verification Checklist

### ✅ Database Connection

Visit: `https://your-domain.com/api/admin/auth/test-db`

**Expected Response:**
```json
{
  "status": "success",
  "connected": true,
  "message": "Database connection successful"
}
```

### ✅ JWT Configuration

Visit: `https://your-domain.com/api/admin/auth/diagnose`

**Expected Response:**
```json
{
  "status": "success",
  "allChecksPass": true,
  "diagnostics": {
    "environment": {
      "databaseUrl": { "set": true, "valid": true },
      "jwtSecret": { "set": true, "valid": true, "length": 64 }
    }
  }
}
```

### ✅ Admin User Exists

Run in Supabase SQL Editor:
```sql
SELECT id, email, name, role, "isActive" 
FROM "AdminUser" 
WHERE email = 'Admin@extremedeptkidz.com';
```

**Expected:** Should return 1 row with active admin user

---

## Common Issues

### Issue 1: "JWT_SECRET is not set or invalid"

**Solution:**
1. Check Vercel Dashboard → Environment Variables
2. Ensure `JWT_SECRET` is set and at least 32 characters
3. Redeploy after adding/updating

### Issue 2: "Database connection unavailable"

**Solution:**
1. Check Vercel Dashboard → Environment Variables
2. Ensure `DATABASE_URL` is set correctly
3. Verify connection string includes `?sslmode=require`
4. Check Supabase dashboard for connection string
5. Redeploy after adding/updating

### Issue 3: "Invalid or expired token"

**Solution:**
1. Check if `JWT_SECRET` was changed (invalidates all tokens)
2. Ensure `JWT_SECRET` is the same in all environments
3. Clear browser cookies and try logging in again

### Issue 4: Environment variables not loading

**Solution:**
1. Verify variable names are exactly correct (case-sensitive)
2. Ensure variables are enabled for the correct environments
3. **Redeploy** - environment variables only apply to new deployments
4. Wait 2-3 minutes after redeploy for changes to take effect

---

## Security Best Practices

1. **Never commit environment variables to Git**
   - Use `.env.local` for local development
   - Use Vercel Dashboard for production

2. **Use different secrets for different environments** (optional)
   - Production should have a unique `JWT_SECRET`
   - Preview/Development can share a secret

3. **Rotate secrets periodically**
   - Change `JWT_SECRET` every 6-12 months
   - Note: This will invalidate all existing tokens

4. **Keep secrets secure**
   - Don't share secrets in chat/email
   - Use Vercel's secure environment variable storage

---

## Quick Reference

| Variable | Required | Default | Min Length | Format |
|----------|----------|---------|------------|--------|
| `DATABASE_URL` | ✅ Yes | - | - | `postgresql://...` |
| `JWT_SECRET` | ✅ Yes | - | 32 chars | Random hex string |
| `JWT_EXPIRES_IN` | ❌ No | `7d` | - | `7d`, `24h`, etc. |

---

**Last Updated:** After comprehensive login fix
**Status:** ✅ All environment variables documented and verified
