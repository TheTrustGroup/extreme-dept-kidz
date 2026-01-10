# 🔍 Check Vercel Environment Variables & Diagnose Admin Login

## Quick Diagnostic

### Step 1: Run the Diagnostic Endpoint

Visit this URL on your **Vercel deployment** (replace with your actual domain):

```
https://your-domain.vercel.app/api/admin/auth/diagnose
```

This will show you:
- ✅ Database connection status
- ✅ Environment variables status (DATABASE_URL, JWT_SECRET)
- ✅ Admin user existence
- ✅ Password verification test
- ✅ Specific recommendations to fix issues

**Example response if everything is working:**
```json
{
  "status": "success",
  "allChecksPass": true,
  "diagnostics": {
    "database": {
      "connected": true,
      "adminUserCount": 1
    },
    "environment": {
      "databaseUrl": { "set": true, "valid": true },
      "jwtSecret": { "set": true, "valid": true, "length": 64 }
    },
    "testLogin": {
      "userExists": true,
      "userActive": true,
      "passwordValid": true,
      "jwtGenerated": true
    }
  }
}
```

---

## Required Vercel Environment Variables

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

### ✅ Variable 1: `DATABASE_URL`

**Value:**
```
postgresql://postgres:Zillion0031%21@db.puuszplmdbindiesfxlr.supabase.co:5432/postgres?sslmode=require
```

**Check:**
- [ ] Variable name is exactly `DATABASE_URL` (case-sensitive)
- [ ] Value starts with `postgresql://`
- [ ] Value includes `?sslmode=require` at the end
- [ ] Enabled for: ✅ Production ✅ Preview ✅ Development

**Common Issues:**
- ❌ Missing `?sslmode=require` → Add it
- ❌ Wrong password → Check Supabase connection string
- ❌ URL encoded incorrectly → Use `%21` for `!` in password

---

### ✅ Variable 2: `JWT_SECRET`

**Value:**
```
9b704c662d0eb6c4cafdb5824711204ac71efe311b06e2739c76fa377e4281da
```

**Check:**
- [ ] Variable name is exactly `JWT_SECRET` (case-sensitive)
- [ ] Value is at least 32 characters long (this one is 64)
- [ ] No spaces or quotes around the value
- [ ] Enabled for: ✅ Production ✅ Preview ✅ Development

**Generate a new one if needed:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### ✅ Variable 3: `JWT_EXPIRES_IN` (Optional)

**Value:**
```
7d
```

**Check:**
- [ ] Variable name is exactly `JWT_EXPIRES_IN` (case-sensitive)
- [ ] Value is a valid duration (e.g., `7d`, `24h`, `1h`)
- [ ] Enabled for: ✅ Production ✅ Preview ✅ Development

---

## Step-by-Step Verification

### 1. Check Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project: `extreme-dept-kidz`
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar
5. Verify all 3 variables are listed:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` (optional)

### 2. Verify Variable Values

For each variable:
- Click on the variable name
- Check the value is correct (you can click the eye icon to reveal)
- Verify it's enabled for the correct environments

### 3. Check if Admin User Exists

Run this in **Supabase SQL Editor**:

```sql
SELECT id, email, name, role, "isActive", "createdAt" 
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';
```

**Expected:** Should return 1 row with your admin user

**If no rows returned:** Create the admin user (see Step 4)

### 4. Create Admin User (If Missing)

Run this SQL in **Supabase SQL Editor**:

```sql
INSERT INTO "AdminUser" (
    "id", "email", "name", "passwordHash", "role", "isActive", "createdAt", "updatedAt"
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

**Password:** `Admin123!`

### 5. Redeploy After Changes

**Important:** Environment variables only apply to **new deployments**

1. Go to **Deployments** tab in Vercel
2. Click **⋯** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### 6. Test the Diagnostic Endpoint

Visit: `https://your-domain.vercel.app/api/admin/auth/diagnose`

Check the response:
- If `allChecksPass: true` → Everything is working!
- If `allChecksPass: false` → Follow the `recommendations` in the response

### 7. Test Login

1. Go to: `https://your-domain.vercel.app/admin/login`
2. Enter:
   - **Email:** `admin@extremedeptkidz.com`
   - **Password:** `Admin123!`
3. Click **SIGN IN**

---

## Common Issues & Fixes

### Issue: "Database connection unavailable"

**Fix:**
- Check `DATABASE_URL` is set in Vercel
- Verify the connection string is correct
- Make sure Supabase project is active
- Redeploy after adding the variable

### Issue: "JWT_SECRET not found" or "JWT_SECRET too short"

**Fix:**
- Add `JWT_SECRET` in Vercel environment variables
- Make sure it's at least 32 characters
- Redeploy after adding

### Issue: "Admin user not found"

**Fix:**
- Run the SQL INSERT statement in Supabase (Step 4 above)
- Verify with SELECT query
- Make sure email is exactly `admin@extremedeptkidz.com`

### Issue: "Password verification failed"

**Fix:**
- The password hash in database doesn't match
- Generate a new hash: `npm run generate-hash "Admin123!"`
- Update the user in Supabase with the new hash

### Issue: "User exists but is inactive"

**Fix:**
- Run this SQL in Supabase:
```sql
UPDATE "AdminUser" 
SET "isActive" = true, "updatedAt" = NOW()
WHERE email = 'admin@extremedeptkidz.com';
```

---

## Quick Checklist

- [ ] `DATABASE_URL` set in Vercel
- [ ] `JWT_SECRET` set in Vercel (32+ chars)
- [ ] `JWT_EXPIRES_IN` set in Vercel (optional)
- [ ] All variables enabled for Production/Preview/Development
- [ ] Admin user exists in Supabase
- [ ] Admin user is active (`isActive = true`)
- [ ] Password hash matches `Admin123!`
- [ ] Vercel deployment redeployed after adding env vars
- [ ] Diagnostic endpoint returns `allChecksPass: true`
- [ ] Login works with correct credentials

---

## Still Not Working?

1. **Check Vercel deployment logs:**
   - Go to Deployments → Click on latest deployment → View logs
   - Look for errors related to database or JWT

2. **Check browser console:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Try logging in and check for errors

3. **Check network requests:**
   - Open browser DevTools → Network tab
   - Try logging in
   - Check the `/api/admin/auth/login` request
   - Look at the response for error messages

4. **Run diagnostic endpoint:**
   - Visit `/api/admin/auth/diagnose`
   - Follow the recommendations in the response

---

**Need more help?** The diagnostic endpoint at `/api/admin/auth/diagnose` will tell you exactly what's wrong and how to fix it.
