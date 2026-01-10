# Create Admin User & Configure Vercel Environment Variables

## 🎯 Quick Setup Guide

This guide will help you:
1. Create a new admin user with a custom password
2. Set up all required environment variables in Vercel
3. Verify everything is working

---

## Step 1: Generate Password Hash

### Option A: Using the Script (Recommended)

1. **Open your terminal** in the project directory
2. **Run the password hash generator:**

```bash
# Generate hash for default password (Admin123!)
npm run generate-hash

# OR generate hash for your custom password
tsx scripts/generate-password-hash.ts "YourSecurePassword123!"
```

3. **Copy the generated hash** - you'll need it for Step 2

### Option B: Manual Hash Generation

If you prefer to generate it manually, you can use Node.js:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword123!', 12).then(h => console.log(h))"
```

---

## Step 2: Create Admin User in Supabase

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor:**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run this SQL** (replace `YOUR_PASSWORD_HASH` with the hash from Step 1):

```sql
-- Create or update admin user
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
    'YOUR_PASSWORD_HASH',  -- Replace with hash from Step 1
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

-- Verify the user was created
SELECT id, email, name, role, "isActive", "createdAt" 
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';
```

4. **Click Run** - You should see "Success. 1 row inserted" or "Success. 1 row updated"

---

## Step 3: Set Vercel Environment Variables

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: `extreme-dept-kidz`

2. **Navigate to Settings:**
   - Click **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add/Update These Variables:**

   #### Required Variables:

   **`DATABASE_URL`**
   - **Value:** Your Supabase connection string
   - **Example:** `postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require`
   - **Environments:** Production, Preview, Development (select all)

   **`JWT_SECRET`**
   - **Value:** A secure random string (at least 32 characters)
   - **Generate one:** Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - **Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
   - **Environments:** Production, Preview, Development (select all)

   **`JWT_EXPIRES_IN`** (Optional)
   - **Value:** `7d` (7 days) or your preferred expiration
   - **Environments:** Production, Preview, Development (select all)

4. **Save Each Variable:**
   - Click **Save** after adding each variable
   - Make sure to select the correct environments (Production, Preview, Development)

5. **Redeploy:**
   - After adding variables, go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Click **Redeploy** to apply the new environment variables

### Method 2: Via Vercel CLI

If you have Vercel CLI installed:

```bash
# Set DATABASE_URL
vercel env add DATABASE_URL production preview development

# Set JWT_SECRET
vercel env add JWT_SECRET production preview development

# Set JWT_EXPIRES_IN (optional)
vercel env add JWT_EXPIRES_IN production preview development
```

---

## Step 4: Verify Everything Works

### 1. Check Database Connection

Visit your Vercel deployment and go to:
```
https://your-domain.vercel.app/api/admin/auth/test
```

You should see:
```json
{
  "status": "success",
  "message": "Database connected and admin users fetched.",
  "adminUsers": [...]
}
```

### 2. Test Admin Login

1. Go to: `https://your-domain.vercel.app/admin/login`
2. Enter credentials:
   - **Email:** `admin@extremedeptkidz.com`
   - **Password:** (the password you used in Step 1)
3. Click **SIGN IN**
4. You should be redirected to `/admin` dashboard

---

## 🔐 Default Admin Credentials

If you used the default password hash:
- **Email:** `admin@extremedeptkidz.com`
- **Password:** `Admin123!`
- **Role:** `super_admin`

---

## 🛠️ Troubleshooting

### "Invalid email or password" Error

1. **Check if admin user exists:**
   ```sql
   SELECT * FROM "AdminUser" WHERE email = 'admin@extremedeptkidz.com';
   ```

2. **Verify password hash matches:**
   - Make sure you used the correct hash from Step 1
   - The hash should start with `$2b$12$`

3. **Check Vercel environment variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify `DATABASE_URL` and `JWT_SECRET` are set
   - Make sure they're enabled for the correct environment (Production/Preview/Development)

4. **Check database connection:**
   - Visit `/api/admin/auth/test` on your Vercel deployment
   - Should return success with admin users list

### "Database connection failed" Error

1. **Verify DATABASE_URL in Vercel:**
   - Check it's set correctly
   - Should include `?sslmode=require` at the end
   - Format: `postgresql://user:password@host:port/database?sslmode=require`

2. **Check Supabase project status:**
   - Make sure your Supabase project is active
   - Verify the connection string is correct

3. **Redeploy after setting variables:**
   - Environment variables only apply to new deployments
   - Redeploy after adding/updating variables

### "JWT_SECRET not found" Error

1. **Set JWT_SECRET in Vercel:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add `JWT_SECRET` with a secure random string (32+ characters)
   - Enable for all environments (Production, Preview, Development)
   - Redeploy

---

## 📝 Quick Reference

### Generate Password Hash
```bash
tsx scripts/generate-password-hash.ts "YourPassword123!"
```

### Create Admin User (SQL)
```sql
INSERT INTO "AdminUser" (id, email, name, passwordHash, role, isActive, createdAt, updatedAt)
VALUES (gen_random_uuid()::text, 'admin@extremedeptkidz.com', 'Super Admin', 'HASH_HERE', 'super_admin', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET passwordHash = EXCLUDED.passwordHash;
```

### Required Vercel Environment Variables
- `DATABASE_URL` - Supabase connection string
- `JWT_SECRET` - Secure random string (32+ chars)
- `JWT_EXPIRES_IN` - Token expiration (optional, default: 7d)

---

## ✅ Success Checklist

- [ ] Password hash generated
- [ ] Admin user created in Supabase
- [ ] `DATABASE_URL` set in Vercel
- [ ] `JWT_SECRET` set in Vercel
- [ ] Vercel deployment redeployed
- [ ] Database connection test passes (`/api/admin/auth/test`)
- [ ] Admin login works (`/admin/login`)

---

**Need Help?** Check the troubleshooting section above or verify each step was completed correctly.
