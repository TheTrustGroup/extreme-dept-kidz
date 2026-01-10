# Fix Admin Login "Invalid" Error

## 🔍 Issue
Admin login shows "Invalid email or password" even with correct credentials.

## 🎯 Most Likely Causes

### 1. Admin User Doesn't Exist in Database
The admin user needs to be created in your Supabase database.

### 2. Database Connection Failing in Production
The `DATABASE_URL` environment variable may not be set correctly in Vercel.

### 3. Password Hash Mismatch
The password hash in the database doesn't match the expected password.

## ✅ SOLUTION STEPS

### Step 1: Verify Admin User Exists

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your project: `puuszplmdbindiesfxlr`

2. **Check AdminUser Table:**
   - Go to **Table Editor** → **AdminUser**
   - Look for `admin@extremedeptkidz.com`
   - If it doesn't exist, proceed to Step 2

### Step 2: Create Admin User (If Missing)

1. **Go to SQL Editor** in Supabase
2. **Run this SQL:**

```sql
-- Create admin user with password: Admin123!
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
    'admin-1',
    'admin@extremedeptkidz.com',
    'Super Admin',
    '$2b$12$gncCYWjmDMlxySOcf.bvvuLZbMwlCY02ogKo7CVu6AOKaRNghgsdO',
    'super_admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT ("email") DO UPDATE SET
    "name" = EXCLUDED."name",
    "passwordHash" = EXCLUDED."passwordHash",
    "role" = EXCLUDED."role",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = NOW();
```

3. **Verify it was created:**
```sql
SELECT id, email, name, role, "isActive" FROM "AdminUser" WHERE email = 'admin@extremedeptkidz.com';
```

### Step 3: Verify Vercel Environment Variables

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: `extreme-dept-kidz`

2. **Go to Settings → Environment Variables**
3. **Verify these are set:**
   - `DATABASE_URL` - Your Supabase connection string
   - `JWT_SECRET` - A secure 32+ character string
   - `JWT_EXPIRES_IN` - (optional, defaults to "7d")

4. **If missing, add them:**
   - `DATABASE_URL`: Get from Supabase Dashboard → Settings → Database → Connection string (URI)
   - `JWT_SECRET`: Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

5. **Redeploy after adding variables:**
   - Go to Deployments → Click "..." → Redeploy

### Step 4: Test Database Connection

1. **Visit the test endpoint:**
   - Go to: `https://extremedeptkidz.com/api/admin/auth/test`
   - Or: `https://your-vercel-url.vercel.app/api/admin/auth/test`

2. **Check the response:**
   - Should show `prismaConnected: true`
   - Should list admin users
   - If it shows errors, the database connection is the issue

### Step 5: Test Login

**Credentials:**
- Email: `admin@extremedeptkidz.com`
- Password: `Admin123!`

**If still not working:**
- Check browser console (F12) for errors
- Check Vercel function logs for errors
- Verify the password hash matches (see Step 6)

### Step 6: Reset Admin Password (If Needed)

If the password doesn't work, generate a new hash and update:

1. **Generate new password hash:**
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourNewPassword123!', 12).then(hash => console.log('Hash:', hash));"
   ```

2. **Update in Supabase SQL Editor:**
   ```sql
   UPDATE "AdminUser"
   SET "passwordHash" = 'YOUR_NEW_HASH_HERE',
       "updatedAt" = NOW()
   WHERE email = 'admin@extremedeptkidz.com';
   ```

## 🔧 Quick Fix Commands

### Check if user exists:
```sql
SELECT * FROM "AdminUser" WHERE email = 'admin@extremedeptkidz.com';
```

### Create/Update user:
```sql
INSERT INTO "AdminUser" (
    "id", "email", "name", "passwordHash", "role", "isActive", "createdAt", "updatedAt"
) VALUES (
    'admin-1',
    'admin@extremedeptkidz.com',
    'Super Admin',
    '$2b$12$gncCYWjmDMlxySOcf.bvvuLZbMwlCY02ogKo7CVu6AOKaRNghgsdO',
    'super_admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT ("email") DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    "updatedAt" = NOW();
```

## 📝 Expected Behavior

After fixing:
1. Visit `/admin/login`
2. Enter: `admin@extremedeptkidz.com` / `Admin123!`
3. Should redirect to `/admin` dashboard
4. Should see "Dashboard" page with stats

## 🆘 Still Having Issues?

1. **Check Vercel Logs:**
   - Vercel Dashboard → Your Project → Logs
   - Look for errors in `/api/admin/auth/login`

2. **Check Browser Console:**
   - F12 → Console tab
   - Look for network errors or API errors

3. **Verify Database:**
   - Supabase Dashboard → Table Editor → AdminUser
   - Ensure user exists and `isActive = true`

4. **Test API Directly:**
   ```bash
   curl -X POST https://extremedeptkidz.com/api/admin/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@extremedeptkidz.com","password":"Admin123!"}'
   ```

---

**Most Common Fix:** The admin user doesn't exist. Run the SQL in Step 2 to create it.
