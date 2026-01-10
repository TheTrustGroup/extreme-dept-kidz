# 🚀 Quick Vercel Environment Variables Setup

## Step-by-Step Instructions

### 1️⃣ Generate Password Hash

Run this command to generate a hash for your password:

```bash
npm run generate-hash "YourPassword123!"
```

**Copy the hash** that's displayed - you'll need it in the next step.

---

### 2️⃣ Create Admin User in Supabase

1. Go to **Supabase Dashboard** → Your Project → **SQL Editor**
2. Run this SQL (replace `YOUR_PASSWORD_HASH` with the hash from step 1):

```sql
INSERT INTO "AdminUser" (
    "id", "email", "name", "passwordHash", "role", "isActive", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'admin@extremedeptkidz.com',
    'Super Admin',
    'YOUR_PASSWORD_HASH',
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

3. Click **Run** - Should see "Success. 1 row inserted/updated"

---

### 3️⃣ Set Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. **Add these 3 variables:**

   #### Variable 1: `DATABASE_URL`
   - **Value:** Your Supabase connection string
   - **Format:** `postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require`
   - **Environments:** ✅ Production ✅ Preview ✅ Development

   #### Variable 2: `JWT_SECRET`
   - **Value:** `9b704c662d0eb6c4cafdb5824711204ac71efe311b06e2739c76fa377e4281da`
   - **Or generate your own:** `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - **Environments:** ✅ Production ✅ Preview ✅ Development

   #### Variable 3: `JWT_EXPIRES_IN` (Optional)
   - **Value:** `7d`
   - **Environments:** ✅ Production ✅ Preview ✅ Development

3. **Click Save** for each variable

---

### 4️⃣ Redeploy on Vercel

1. Go to **Deployments** tab
2. Click **⋯** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

---

### 5️⃣ Test Login

1. Go to: `https://your-domain.vercel.app/admin/login`
2. Enter:
   - **Email:** `admin@extremedeptkidz.com`
   - **Password:** (the password you used in step 1)
3. Click **SIGN IN**

---

## ✅ Quick Checklist

- [ ] Password hash generated
- [ ] Admin user created in Supabase SQL Editor
- [ ] `DATABASE_URL` added to Vercel
- [ ] `JWT_SECRET` added to Vercel
- [ ] Vercel deployment redeployed
- [ ] Login tested successfully

---

## 🔍 Troubleshooting

### Still getting "Invalid email or password"?

1. **Verify admin exists:**
   ```sql
   SELECT * FROM "AdminUser" WHERE email = 'admin@extremedeptkidz.com';
   ```

2. **Check Vercel env vars:**
   - Settings → Environment Variables
   - Make sure `DATABASE_URL` and `JWT_SECRET` are set
   - Make sure they're enabled for **Production** environment

3. **Test database connection:**
   - Visit: `https://your-domain.vercel.app/api/admin/auth/test`
   - Should return success with admin users

4. **Redeploy after adding env vars:**
   - New env vars only apply to new deployments

---

**Need more details?** See `CREATE_ADMIN_AND_VERCEL_SETUP.md` for comprehensive guide.
