# 🚨 RUN THIS SQL IN SUPABASE NOW

## ⚠️ URGENT: Database Has Wrong Password Hash

The diagnostic endpoint shows the password hash doesn't match "VisionaryIntro".

---

## ✅ STEP 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project
3. **SQL Editor** → **New Query**

---

## ✅ STEP 2: Copy & Paste This SQL

```sql
-- Delete ALL existing admin users
DELETE FROM "AdminUser";

-- Create new admin user with CORRECT credentials
INSERT INTO "AdminUser" (
    "id",
    "email",
    "name",
    "displayName",
    "passwordHash",
    "role",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'Admin@extremedeptkidz.com',
    'Super Admin',
    'Super Admin',
    '$2b$12$N46VhRKYCI/xyxFIB6tPhOH2U.yNv2AXGwm0UlTh/gC00v4FHOvTG',
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

---

## ✅ STEP 3: Click "Run"

**Expected:**
- "Success. 1 row inserted"
- Verification shows: `✅ Hash is set`

---

## ✅ STEP 4: Test Diagnostic Endpoint

**Wait 10 seconds**, then visit:
```
https://extremedeptkidz.com/api/admin/auth/diagnose
```

**Should now show:**
```json
{
  "testLogin": {
    "passwordValid": true,
    "jwtGenerated": true
  },
  "allChecksPass": true
}
```

---

## ✅ STEP 5: Test Login

1. **Private window**
2. **Go to:** `https://extremedeptkidz.com/admin/login`
3. **Enter:**
   - Email: `Admin@extremedeptkidz.com`
   - Password: `VisionaryIntro`
4. **Click SIGN IN**
5. **Should work!** ✅

---

## 🔑 Final Credentials

- **Email:** `Admin@extremedeptkidz.com`
- **Password:** `VisionaryIntro`
- **Hash:** `$2b$12$N46VhRKYCI/xyxFIB6tPhOH2U.yNv2AXGwm0UlTh/gC00v4FHOvTG` ✅

---

**Status:** Run the SQL above in Supabase NOW! 🚀
