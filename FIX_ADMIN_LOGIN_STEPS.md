# 🔧 Fix Admin Login - Step by Step Guide

## Problem
Getting "Invalid email or password" when trying to log in.

## ✅ Solution: Reset Admin User in Database

### Step 1: Go to Supabase SQL Editor

1. Open **https://supabase.com/dashboard**
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Reset SQL

Copy and paste the **ENTIRE** SQL from `FIX_ADMIN_LOGIN_FINAL.sql`:

```sql
-- Delete existing admin user
DELETE FROM "AdminUser" WHERE email = 'admin@extremedeptkidz.com';

-- Create fresh admin user
INSERT INTO "AdminUser" (
    "id", "email", "name", "passwordHash", "role", "isActive", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'admin@extremedeptkidz.com',
    'Super Admin',
    '$2b$12$rJlT2lieZdPz9tFSIfxbdOirU3FwEuzwvmuC3XO.MkbErd9yb1neO',
    'super_admin',
    true,
    NOW(),
    NOW()
);

-- Verify
SELECT id, email, name, role, "isActive" 
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';
```

5. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)
6. You should see:
   - "Success. 1 row inserted"
   - A verification query showing your admin user

### Step 3: Verify Environment Variables in Vercel

Make sure these are set in **Vercel Dashboard** → **Settings** → **Environment Variables**:

1. **`DATABASE_URL`**
   - Value: Your Supabase connection string
   - ✅ Enabled for: Production, Preview, Development

2. **`JWT_SECRET`**
   - Value: At least 32 characters (64 recommended)
   - ✅ Enabled for: Production, Preview, Development

3. **`JWT_EXPIRES_IN`** (optional)
   - Value: `7d`
   - ✅ Enabled for: Production, Preview, Development

### Step 4: Test Login

1. Go to: **https://extremedeptkidz.com/admin/login**
2. Enter:
   - **Email:** `admin@extremedeptkidz.com`
   - **Password:** `Admin@2024!`
3. Click **SIGN IN**

### Step 5: If Still Not Working

#### Check Database Connection

Test if the database is accessible:
```
https://extremedeptkidz.com/api/admin/auth/test
```

**Expected Response:**
```json
{
  "status": "success",
  "prismaConnected": true,
  "adminUserCount": 1,
  "adminUsers": [
    {
      "email": "admin@extremedeptkidz.com",
      "name": "Super Admin",
      "role": "super_admin",
      "isActive": true
    }
  ]
}
```

#### Check Full Diagnostics

```
https://extremedeptkidz.com/api/admin/auth/diagnose
```

This will show:
- ✅ Database connection status
- ✅ Environment variables status
- ✅ Admin user existence
- ✅ Password verification test
- ✅ Specific recommendations

## 🔐 Admin Credentials

- **Email:** `admin@extremedeptkidz.com`
- **Password:** `Admin@2024!`
- **Role:** `super_admin`

## 🆘 Common Issues

### Issue 1: "Database connection unavailable"
- **Fix:** Check `DATABASE_URL` in Vercel environment variables
- **Fix:** Ensure Supabase project is active (not paused)

### Issue 2: "Invalid email or password" (but user exists)
- **Fix:** Run the SQL reset script again
- **Fix:** Verify password hash matches

### Issue 3: API routes return 404
- **Fix:** Redeploy on Vercel
- **Fix:** Wait 2-3 minutes after deployment

### Issue 4: Works on Vercel domain but not custom domain
- **Fix:** Ensure environment variables are enabled for **Production** in Vercel
- **Fix:** Redeploy after updating environment variables

## ✅ Success Indicators

You'll know it's working when:
- ✅ SQL query returns "Success. 1 row inserted"
- ✅ Verification query shows your admin user
- ✅ `/api/admin/auth/test` shows `adminUserCount: 1`
- ✅ Login page accepts credentials and redirects to `/admin`

---

**After running the SQL, wait 1-2 minutes for changes to propagate, then try logging in again.**
