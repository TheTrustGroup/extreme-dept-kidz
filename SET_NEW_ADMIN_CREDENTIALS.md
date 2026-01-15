# 🔐 Set New Admin Credentials - Complete Guide

## New Admin Credentials
- **Email:** `Admin@extremedeptkidz.com`
- **Password:** `VisionaryIntro`
- **Role:** Super Admin

---

## 🚀 Method 1: Using TypeScript Script (Recommended)

### Step 1: Run the Setup Script

```bash
cd "/Users/raregem.zillion/Desktop/EXTREME DEPT KIDZ 1.0"
npx tsx scripts/set-new-admin.ts
```

This script will:
- ✅ Delete ALL existing admin users
- ✅ Create the new admin user with exact credentials
- ✅ Verify the user was created correctly
- ✅ Test password verification

---

## 🗄️ Method 2: Using SQL (Direct Database)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** → **New Query**

### Step 2: Run This SQL

```sql
-- Delete ALL existing admin users
DELETE FROM "AdminUser";

-- Create new admin user
INSERT INTO "AdminUser" (
    "id",
    "email",
    "name",
    "passwordHash",
    "role",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'Admin@extremedeptkidz.com',
    'Super Admin',
    '$2b$12$YicRzPsg/PmcXaEmCPHCP.65fntxG.MGLfVXdv5Vi.RvkWNK6syiG',
    'super_admin',
    true,
    NOW(),
    NOW()
);

-- Verify the user was created
SELECT 
    id,
    email,
    name,
    role,
    "isActive",
    "createdAt",
    CASE 
        WHEN "passwordHash" IS NOT NULL AND LENGTH("passwordHash") > 20 THEN '✅ Hash is set'
        ELSE '❌ ERROR: Hash missing!'
    END as hash_status
FROM "AdminUser" 
WHERE email = 'Admin@extremedeptkidz.com';
```

### Step 3: Verify
- You should see "Success. 1 row inserted"
- The verification query should show your admin user with ✅ Hash is set

---

## ✅ Verification Steps

### 1. Test Login
1. Go to: `https://extremedeptkidz.com/admin/login`
2. Enter:
   - **Email:** `Admin@extremedeptkidz.com`
   - **Password:** `VisionaryIntro`
3. Click "SIGN IN"

### 2. Check Browser Console
- Open Developer Tools (F12)
- Check Console tab for any errors
- Should see: `[Auth] ✅ Setting auth state...`

### 3. Verify Authentication
- After login, you should be redirected to `/admin`
- Check that you can access admin pages
- Verify your name appears in the header

---

## 🔧 Troubleshooting

### Issue: "Invalid email or password"
**Solutions:**
1. Verify the email is exactly: `Admin@extremedeptkidz.com` (case-sensitive in database)
2. Check that password hash was set correctly
3. Verify database connection is working
4. Check JWT_SECRET is set in environment variables

### Issue: "Database connection unavailable"
**Solutions:**
1. Check DATABASE_URL in Vercel environment variables
2. Verify database is accessible
3. Test connection: `/api/admin/auth/test-db`

### Issue: Login works but redirects back to login
**Solutions:**
1. Check JWT_SECRET is set correctly
2. Verify cookie is being set (check browser DevTools → Application → Cookies)
3. Check middleware is not blocking requests

---

## 📝 Important Notes

- ✅ Email is case-sensitive in the database: `Admin@extremedeptkidz.com`
- ✅ Password is: `VisionaryIntro` (case-sensitive)
- ✅ All old admin users are removed
- ✅ Only one admin user exists now
- ✅ User is set as `super_admin` role
- ✅ User is active and ready to use

---

## 🎯 Next Steps After Setup

1. ✅ Test login with new credentials
2. ✅ Verify you can access all admin pages
3. ✅ Test image upload functionality
4. ✅ Test inventory management
5. ✅ Test offline sync functionality
6. ✅ Verify all admin features work smoothly

---

**Status:** Ready to execute! Follow Method 1 (TypeScript script) for automated setup, or Method 2 (SQL) for manual database update.
