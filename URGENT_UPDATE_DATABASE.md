# 🚨 URGENT: Update Database Admin User

## ⚠️ Current Problem

The diagnostic endpoint shows:
- ✅ Database connected
- ✅ JWT_SECRET is set
- ✅ Admin user exists
- ❌ **Password hash is WRONG** - doesn't match "VisionaryIntro"

**The database has the OLD password hash!**

---

## ✅ IMMEDIATE FIX

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** → **New Query**

### Step 2: Copy & Paste This SQL

```sql
-- Delete ALL existing admin users
DELETE FROM "AdminUser";

-- Create new admin user with CORRECT credentials
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
    '$2b$12$QuDkXzpHpwqgV7bs8V76iu0cKLcF089PuKXw27dqwkIVb4c.0gC7O',
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

**Expected:**
- "Success. 1 row inserted"
- Verification shows: `✅ Hash is set`

---

## ✅ Step 4: Test Again

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

## ✅ Step 5: Test Login

1. **Private window**
2. **Go to:** `https://extremedeptkidz.com/admin/login`
3. **Enter:**
   - Email: `Admin@extremedeptkidz.com`
   - Password: `VisionaryIntro`
4. **Click SIGN IN**
5. **Should work!** ✅

---

## 🔑 Credentials

- **Email:** `Admin@extremedeptkidz.com` (exact case)
- **Password:** `VisionaryIntro`
- **Password Hash:** `$2b$12$QuDkXzpHpwqgV7bs8V76iu0cKLcF089PuKXw27dqwkIVb4c.0gC7O` ✅ VERIFIED

---

**Status:** Run the SQL NOW to fix the password hash! 🚀
