# 🔄 Reset Admin Login - Complete Guide

## Overview
This guide will help you completely reset the admin login system and create a fresh admin user with new credentials.

## ✅ Step-by-Step Reset

### Step 1: Generate New Password Hash

Run this command to generate a hash for your new password:

```bash
npm run generate-hash "Admin@2024!"
```

**Copy the hash** that's displayed - you'll need it in Step 2.

### Step 2: Reset Admin Users in Supabase

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** → **New Query**
3. Copy and paste this SQL:

```sql
-- Delete ALL existing admin users
DELETE FROM "AdminUser";

-- Create fresh admin user
-- Replace REPLACE_WITH_NEW_HASH with the hash from Step 1
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
    'admin@extremedeptkidz.com',
    'Super Admin',
    'REPLACE_WITH_NEW_HASH',  -- Paste the hash from Step 1 here
    'super_admin',
    true,
    NOW(),
    NOW()
);
```

4. **Replace `REPLACE_WITH_NEW_HASH`** with the hash from Step 1
5. Click **Run**

### Step 3: Verify Admin User Was Created

Run this query to verify:

```sql
SELECT 
    id,
    email,
    name,
    role,
    "isActive",
    "createdAt"
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';
```

You should see your new admin user.

### Step 4: Test Login

1. Go to: `https://your-domain.vercel.app/admin/login`
2. Enter:
   - **Email:** `admin@extremedeptkidz.com`
   - **Password:** `Admin@2024!`
3. Click **SIGN IN**

## 🔐 New Admin Credentials

After reset:

- **Email:** `admin@extremedeptkidz.com`
- **Password:** `Admin@2024!`
- **Role:** `super_admin`

## 🔄 Alternative: Use Different Password

If you want to use a different password:

1. **Generate hash for your password:**
   ```bash
   npm run generate-hash "YourNewPassword123!"
   ```

2. **Use the hash in the SQL script above**

3. **Login with your new password**

## 📋 Quick Reset Script

If you want to do it all at once, here's a complete script (replace the hash):

```sql
-- Complete reset and create new admin
DELETE FROM "AdminUser";

INSERT INTO "AdminUser" (
    "id", "email", "name", "passwordHash", "role", "isActive", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'admin@extremedeptkidz.com',
    'Super Admin',
    'YOUR_PASSWORD_HASH_HERE',  -- Replace with hash from npm run generate-hash
    'super_admin',
    true,
    NOW(),
    NOW()
);

-- Verify
SELECT * FROM "AdminUser";
```

## ✅ Verification Checklist

- [ ] Generated new password hash
- [ ] Deleted all old admin users in Supabase
- [ ] Created new admin user with new hash
- [ ] Verified user exists with SELECT query
- [ ] Tested login with new credentials
- [ ] Login successful and redirects to dashboard

## 🆘 Troubleshooting

### "Invalid email or password" after reset

1. **Verify the hash matches:**
   - Check you used the correct hash from `npm run generate-hash`
   - Make sure you replaced `REPLACE_WITH_NEW_HASH` in the SQL

2. **Check user exists:**
   ```sql
   SELECT * FROM "AdminUser" WHERE email = 'admin@extremedeptkidz.com';
   ```

3. **Verify user is active:**
   ```sql
   SELECT email, "isActive" FROM "AdminUser" WHERE email = 'admin@extremedeptkidz.com';
   ```
   Should show `isActive: true`

### Database connection still failing

- Make sure `DATABASE_URL` in Vercel uses connection pooler
- Verify connection works: `/api/admin/auth/diagnose`
- Should show `"database": { "connected": true }`

## 📝 Notes

- The old admin users are **permanently deleted**
- You can create multiple admin users if needed
- Each admin user needs a unique email address
- Password hash must match the password you use to login

## 🎉 After Reset

Once login works:

1. ✅ Admin dashboard is accessible
2. ✅ You can manage products, orders, inventory
3. ✅ You can create additional admin users if needed
4. ✅ All admin features are available

---

**Remember:** Keep your new password secure! You can always reset again if needed.
