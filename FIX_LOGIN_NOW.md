# 🔧 Fix Admin Login - Step by Step

## The Problem
You're getting "Invalid email or password" because either:
1. The admin user doesn't exist in the database
2. The password hash doesn't match

## ✅ Solution: Run This SQL in Supabase

### Step 1: Go to Supabase SQL Editor

1. Open https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run This SQL

Copy and paste this **EXACT** SQL (this uses the hash we just generated):

```sql
-- Create/Update admin user with password: Admin123!
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
    '$2b$12$wtqK18BM0YmSltWIL6cJ2.X7TfTc90q9w4Cu29FFBiGfLI0lRDg9G',
    'super_admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT ("email") DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    "name" = EXCLUDED."name",
    "role" = EXCLUDED."role",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = NOW();
```

### Step 3: Verify It Worked

Run this query to check:

```sql
SELECT id, email, name, role, "isActive", "createdAt" 
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';
```

You should see your admin user.

### Step 4: Set Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. **Add/Update these variables:**

   **`DATABASE_URL`**
   - Value: `postgresql://postgres:Zillion0031%21@db.puuszplmdbindiesfxlr.supabase.co:5432/postgres?sslmode=require`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **`JWT_SECRET`**
   - Value: `9b704c662d0eb6c4cafdb5824711204ac71efe311b06e2739c76fa377e4281da`
   - Environments: ✅ Production ✅ Preview ✅ Development

   **`JWT_EXPIRES_IN`** (Optional)
   - Value: `7d`
   - Environments: ✅ Production ✅ Preview ✅ Development

3. **Click Save** for each variable

### Step 5: Redeploy on Vercel

1. Go to **Deployments** tab
2. Click **⋯** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 6: Test Login

1. Go to: `https://your-domain.vercel.app/admin/login`
2. Enter:
   - **Email:** `admin@extremedeptkidz.com`
   - **Password:** `Admin123!`
3. Click **SIGN IN**

---

## 🔍 Still Not Working?

### Check Database Connection on Vercel

Visit this URL on your Vercel deployment:
```
https://your-domain.vercel.app/api/admin/auth/test
```

**Expected response:**
```json
{
  "success": true,
  "prismaConnected": true,
  "adminUserCount": 1,
  "adminUsers": [
    {
      "id": "...",
      "email": "admin@extremedeptkidz.com",
      "name": "Super Admin",
      "role": "super_admin",
      "isActive": true
    }
  ],
  "databaseUrl": "Set"
}
```

**If you see an error:**
- Check that `DATABASE_URL` is set correctly in Vercel
- Make sure you redeployed after adding environment variables
- Check Vercel deployment logs for errors

### Verify Admin User Exists

Run this in Supabase SQL Editor:

```sql
SELECT * FROM "AdminUser";
```

You should see at least one user with email `admin@extremedeptkidz.com`.

### Check Password Hash

If you want to use a different password, generate a new hash:

```bash
npm run generate-hash "YourNewPassword123!"
```

Then update the user in Supabase:

```sql
UPDATE "AdminUser"
SET "passwordHash" = 'YOUR_NEW_HASH_HERE',
    "updatedAt" = NOW()
WHERE email = 'admin@extremedeptkidz.com';
```

---

## 📋 Quick Checklist

- [ ] SQL INSERT statement run in Supabase
- [ ] Admin user verified with SELECT query
- [ ] `DATABASE_URL` set in Vercel
- [ ] `JWT_SECRET` set in Vercel
- [ ] Vercel deployment redeployed
- [ ] `/api/admin/auth/test` returns success
- [ ] Login tested with correct credentials

---

## 🎯 Current Credentials

- **Email:** `admin@extremedeptkidz.com`
- **Password:** `Admin123!`
- **Password Hash:** `$2b$12$wtqK18BM0YmSltWIL6cJ2.X7TfTc90q9w4Cu29FFBiGfLI0lRDg9G`
