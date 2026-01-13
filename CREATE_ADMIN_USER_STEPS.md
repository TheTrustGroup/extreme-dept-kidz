# 👤 Create Admin User - Quick Guide

## ✅ Database Connection: SUCCESS!

Your database connection is working. Now you need to create an admin user.

---

## 🚀 Quick Steps

### Step 1: Go to Supabase SQL Editor

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run This SQL

Copy and paste this SQL into the editor:

```sql
-- Delete existing admin user if it exists
DELETE FROM "AdminUser" WHERE email = 'admin@extremedeptkidz.com';

-- Create new admin user
INSERT INTO "AdminUser" (
  id,
  email,
  name,
  "displayName",
  "passwordHash",
  role,
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@extremedeptkidz.com',
  'Super Admin',
  'Super Admin',
  '$2b$12$4lkrd543.oWLDhd/bie1l.Tf0T7.OdjTqPzLhEc60s7JiDG4AHgxS',
  'super_admin',
  true,
  NOW(),
  NOW()
);
```

### Step 3: Run the Query

1. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
2. You should see: **Success. No rows returned** (this is normal for INSERT)

### Step 4: Verify User Was Created

Run this query to verify:

```sql
SELECT id, email, name, role, "isActive", "createdAt" 
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';
```

You should see one row with your admin user details.

---

## 🔐 Login Credentials

After creating the admin user, use these credentials:

- **Email:** `admin@extremedeptkidz.com`
- **Password:** `Admin@2024!`

---

## ✅ Test Login

1. Go to: `https://your-domain.com/admin/login`
2. Enter the email and password above
3. Click **SIGN IN**
4. You should be redirected to the admin dashboard

---

## 🧪 Alternative: Test Login Endpoint

You can also test the credentials using the test endpoint:

**URL:** `https://your-domain.com/api/admin/auth/test-login`

**POST Request:**
```json
{
  "email": "admin@extremedeptkidz.com",
  "password": "Admin@2024!"
}
```

This will show you:
- ✅ If user exists
- ✅ If password is correct
- ✅ If account is active
- ✅ Detailed diagnostics

---

## 🔧 If You Want a Different Password

If you want to use a different password:

1. **Generate password hash locally:**
   ```bash
   npm run generate-hash "YourNewPassword"
   ```

2. **Copy the hash from the output**

3. **Update the SQL:**
   ```sql
   INSERT INTO "AdminUser" (
     ...
     "passwordHash",
     ...
   ) VALUES (
     ...
     'YOUR_NEW_HASH_HERE',
     ...
   );
   ```

---

## ✅ Verification Checklist

After creating the admin user:

- [ ] SQL query executed successfully
- [ ] User exists in database (verify with SELECT query)
- [ ] User is active (`isActive = true`)
- [ ] Can login at `/admin/login`
- [ ] Stays logged in after navigation

---

## 🎉 You're All Set!

Once the admin user is created, you can:
- ✅ Login to admin dashboard
- ✅ Manage products
- ✅ Upload images
- ✅ Manage orders
- ✅ Access all admin features

The database connection is working, so once you create the admin user, everything should work perfectly!
