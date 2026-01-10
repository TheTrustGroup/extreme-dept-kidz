# 🔧 Fix: "Invalid email or password" - Complete Guide

## Problem
Login shows "Invalid email or password" even after running SQL reset.

## Root Causes
1. **Password hash mismatch** - The hash in database doesn't match the password
2. **User doesn't exist** - Admin user wasn't created properly
3. **Database connection issue** - Can't verify password against database
4. **Case sensitivity** - Email case mismatch

## ✅ Step-by-Step Fix

### Step 1: Test Password Verification

After deployment, test if password verification works:

**Option A: Use the verification endpoint (after deployment)**
```bash
curl -X POST https://extremedeptkidz.com/api/admin/auth/verify-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@extremedeptkidz.com","password":"Admin@2024!"}'
```

**Option B: Check database directly**
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query:
```sql
SELECT 
    email,
    name,
    role,
    "isActive",
    LEFT("passwordHash", 20) || '...' as hash_preview
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';
```

### Step 2: Run Complete Reset SQL

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste the **ENTIRE** SQL from `RESET_ADMIN_COMPLETE_FINAL.sql`:

```sql
-- Delete ALL existing admin users
DELETE FROM "AdminUser";

-- Create fresh admin user
INSERT INTO "AdminUser" (
    "id", "email", "name", "displayName", "passwordHash", "role", "isActive", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'admin@extremedeptkidz.com',
    'Super Admin',
    'Super Admin',
    '$2b$12$psol9eO04Mc5wY045yoEr.iMBY.Dmljx.BHPvsyyIX7QgFsYPu45S',
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

4. Click **Run**
5. You should see:
   - "Success. 1 row inserted"
   - Verification query showing your admin user

### Step 3: Verify Password Hash Matches

The password hash must **exactly match** what's in the database. 

**Current Password:** `Admin@2024!`
**Current Hash:** `$2b$12$psol9eO04Mc5wY045yoEr.iMBY.Dmljx.BHPvsyyIX7QgFsYPu45S`

After running the SQL, verify the hash matches:
```sql
SELECT 
    email,
    CASE 
        WHEN "passwordHash" = '$2b$12$psol9eO04Mc5wY045yoEr.iMBY.Dmljx.BHPvsyyIX7QgFsYPu45S' 
        THEN '✅ Hash matches' 
        ELSE '❌ Hash mismatch!' 
    END as hash_status
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';
```

### Step 4: Test Login

1. Wait 1-2 minutes after running SQL
2. Go to: **https://extremedeptkidz.com/admin/login**
3. Enter:
   - **Email:** `admin@extremedeptkidz.com`
   - **Password:** `Admin@2024!`
4. Click **SIGN IN**

### Step 5: If Still Not Working

#### Check Database Connection

Test if database is accessible:
```
https://extremedeptkidz.com/api/admin/auth/test
```

Should return:
```json
{
  "status": "success",
  "prismaConnected": true,
  "adminUserCount": 1
}
```

#### Check Password Verification

After deployment, test password verification:
```bash
curl -X POST https://extremedeptkidz.com/api/admin/auth/verify-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@extremedeptkidz.com","password":"Admin@2024!"}'
```

**Expected Response:**
```json
{
  "exists": true,
  "email": "admin@extremedeptkidz.com",
  "passwordValid": true,
  "message": "✅ Password is valid!"
}
```

If `passwordValid: false`, the hash in database doesn't match. Run the reset SQL again.

#### Check Environment Variables

Ensure these are set in **Vercel**:
- ✅ `DATABASE_URL` - Supabase connection string
- ✅ `JWT_SECRET` - At least 32 characters
- ✅ `JWT_EXPIRES_IN` - Optional (default: 7d)

## 🔐 Admin Credentials

- **Email:** `admin@extremedeptkidz.com`
- **Password:** `Admin@2024!`
- **Role:** `super_admin`

## 🆘 Common Issues

### Issue 1: "User not found"
- **Fix:** Run the reset SQL to create the user
- **Verify:** Check user exists with `SELECT * FROM "AdminUser"`

### Issue 2: "Password does not match"
- **Fix:** Run the reset SQL with the correct hash
- **Verify:** Use the verify-password endpoint to test

### Issue 3: "Database connection unavailable"
- **Fix:** Check `DATABASE_URL` in Vercel environment variables
- **Fix:** Ensure Supabase project is active

### Issue 4: Works on Vercel but not custom domain
- **Fix:** Ensure environment variables enabled for **Production** in Vercel
- **Fix:** Redeploy after updating environment variables

## 📋 Quick Checklist

- [ ] Ran complete reset SQL in Supabase
- [ ] Verified user exists: `SELECT * FROM "AdminUser"`
- [ ] Verified password hash matches
- [ ] Tested password verification endpoint (after deployment)
- [ ] Checked environment variables in Vercel
- [ ] Waited 1-2 minutes after SQL changes
- [ ] Tested login with exact credentials

---

**After running the SQL, wait 1-2 minutes, then test login again.**
