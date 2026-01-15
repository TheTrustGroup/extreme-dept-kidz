# 🔧 Fix Database Admin User - URGENT

## 🚨 Current Issue

The diagnostic endpoint shows:
- ✅ Database connected
- ✅ JWT_SECRET is set (64 characters)
- ✅ Admin user exists
- ❌ **Password hash doesn't match "VisionaryIntro"**

**The database still has the OLD admin user with OLD password hash!**

---

## ✅ FIX: Update Database Now

### Step 1: Go to Supabase

1. **Open:** https://supabase.com/dashboard
2. **Select your project**
3. **SQL Editor** → **New Query**

### Step 2: Run This SQL

**Copy and paste the ENTIRE SQL from `UPDATE_ADMIN_USER_NOW.sql`:**

```sql
-- Delete ALL existing admin users
DELETE FROM "AdminUser";

-- Create new admin user with exact credentials
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
    'Admin@extremedeptkidz.com',  -- Exact email (case-sensitive)
    'Super Admin',
    '$2b$12$YicRzPsg/PmcXaEmCPHCP.65fntxG.MGLfVXdv5Vi.RvkWNK6syiG',  -- Hash for: VisionaryIntro
    'super_admin',
    true,
    NOW(),
    NOW()
);

-- Verify
SELECT 
    id,
    email,
    name,
    role,
    "isActive",
    CASE 
        WHEN "passwordHash" IS NOT NULL AND LENGTH("passwordHash") > 20 THEN '✅ Hash is set'
        ELSE '❌ ERROR: Hash missing!'
    END as hash_status
FROM "AdminUser" 
WHERE email = 'Admin@extremedeptkidz.com';
```

### Step 3: Click "Run"

**Expected result:**
- "Success. 1 row inserted"
- Verification query shows your admin user with ✅ Hash is set

---

## ✅ Step 4: Test Diagnostic Endpoint Again

**After updating database**, visit:
```
https://extremedeptkidz.com/api/admin/auth/diagnose
```

**Should now show:**
```json
{
  "status": "success",
  "allChecksPass": true,
  "testLogin": {
    "userExists": true,
    "userActive": true,
    "passwordValid": true,
    "jwtGenerated": true
  }
}
```

---

## ✅ Step 5: Test Login

1. **Clear cookies** (use private window)
2. **Go to:** `https://extremedeptkidz.com/admin/login`
3. **Enter:**
   - Email: `Admin@extremedeptkidz.com`
   - Password: `VisionaryIntro`
4. **Click SIGN IN**
5. **Should work!** ✅

---

## 🔍 Verification

**After running SQL, verify:**

1. **User exists:**
   ```sql
   SELECT email, name, role, "isActive" 
   FROM "AdminUser" 
   WHERE email = 'Admin@extremedeptkidz.com';
   ```
   - Should return 1 row
   - Email: `Admin@extremedeptkidz.com` (exact case)

2. **Password hash is set:**
   ```sql
   SELECT 
       email,
       CASE 
           WHEN "passwordHash" IS NOT NULL AND LENGTH("passwordHash") > 20 THEN '✅ Hash set'
           ELSE '❌ No hash'
       END as hash_status
   FROM "AdminUser" 
   WHERE email = 'Admin@extremedeptkidz.com';
   ```
   - Should show: `✅ Hash set`

---

## ⚠️ Important Notes

1. **Email case matters:**
   - Database stores: `Admin@extremedeptkidz.com` (exact case)
   - Login handles both cases, but database should have exact case

2. **Password hash:**
   - Hash: `$2b$12$YicRzPsg/PmcXaEmCPHCP.65fntxG.MGLfVXdv5Vi.RvkWNK6syiG`
   - Password: `VisionaryIntro`
   - These MUST match

3. **After SQL update:**
   - Wait 10-20 seconds for database to update
   - Test diagnostic endpoint again
   - Should show `passwordValid: true`

---

**Status:** Run the SQL NOW to update the admin user! 🚀
