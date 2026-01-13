# Quick Login Fix Guide

## 🚨 Login Not Working? Follow These Steps

### Step 1: Run Debug Endpoint

**Option A: Using the test script (easiest)**
```bash
./scripts/test-login-debug.sh extremedeptkidz.com admin@extremedeptkidz.com "YourPassword"
```

**Option B: Using curl directly**
```bash
curl -X POST https://extremedeptkidz.com/api/admin/auth/debug-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@extremedeptkidz.com","password":"YourPassword"}'
```

**Option C: Using browser/Postman**
- URL: `https://extremedeptkidz.com/api/admin/auth/debug-login`
- Method: `POST`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "email": "admin@extremedeptkidz.com",
  "password": "YourPassword"
}
```

---

### Step 2: Check the Debug Output

The debug endpoint will tell you exactly what's wrong:

#### ✅ If User Not Found:
```
"error": "User not found"
"allUsersInDatabase": [...]
```
**Fix:** Create admin user or use correct email from the list

#### ✅ If Account Inactive:
```
"error": "Account is inactive"
```
**Fix:** Run this SQL in Supabase:
```sql
UPDATE "AdminUser" 
SET "isActive" = true 
WHERE email = 'admin@extremedeptkidz.com';
```

#### ✅ If Password Verification Failed:
```
"passwordVerification": {
  "status": "❌ Failed"
}
```
**Fix:** Reset the password (see Step 3)

---

### Step 3: Reset Password (If Needed)

#### Option A: Using Script (Recommended)
```bash
npx tsx scripts/reset-admin-password.ts admin@extremedeptkidz.com "NewPassword123!"
```

#### Option B: Using SQL Directly

1. **Generate password hash:**
```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('YourNewPassword', 12).then(h=>console.log(h))"
```

2. **Update in Supabase SQL Editor:**
```sql
UPDATE "AdminUser" 
SET "passwordHash" = '$2b$12$YOUR_HASH_HERE',
    "updatedAt" = NOW()
WHERE email = 'admin@extremedeptkidz.com';
```

---

### Step 4: Verify It Works

After fixing, test again:
```bash
./scripts/test-login-debug.sh extremedeptkidz.com admin@extremedeptkidz.com "YourNewPassword"
```

Should show:
```json
{
  "success": true,
  "message": "✅ All checks passed - login should work!"
}
```

---

## 🔧 Common Issues & Quick Fixes

### Issue: "User not found"
**Quick Fix:**
```sql
-- Check existing users
SELECT email, name, role, "isActive" FROM "AdminUser";

-- Create new admin if needed
INSERT INTO "AdminUser" (id, email, name, "passwordHash", role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@extremedeptkidz.com',
  'Admin User',
  '$2b$12$YOUR_HASH_HERE', -- Generate with script above
  'super_admin',
  true,
  NOW(),
  NOW()
);
```

### Issue: "Password verification failed"
**Quick Fix:**
```bash
# Reset password
npx tsx scripts/reset-admin-password.ts admin@extremedeptkidz.com "NewSecurePassword123!"
```

### Issue: "Account is inactive"
**Quick Fix:**
```sql
UPDATE "AdminUser" 
SET "isActive" = true 
WHERE email = 'admin@extremedeptkidz.com';
```

---

## 📋 Complete Admin User Setup (From Scratch)

If you need to create a completely new admin user:

1. **Generate password hash:**
```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('YourSecurePassword123!', 12).then(h=>console.log('Hash:', h))"
```

2. **Create user in Supabase SQL Editor:**
```sql
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
)
VALUES (
  gen_random_uuid(),
  'admin@extremedeptkidz.com',
  'Admin User',
  'Admin User',
  '$2b$12$YOUR_HASH_HERE', -- Paste hash from step 1
  'super_admin',
  true,
  NOW(),
  NOW()
);
```

3. **Verify:**
```bash
./scripts/test-login-debug.sh extremedeptkidz.com admin@extremedeptkidz.com "YourSecurePassword123!"
```

---

## 🎯 One-Command Fix (If You Know the Issue)

**Reset password:**
```bash
npx tsx scripts/reset-admin-password.ts admin@extremedeptkidz.com "NewPassword123!"
```

**Activate account:**
```sql
UPDATE "AdminUser" SET "isActive" = true WHERE email = 'admin@extremedeptkidz.com';
```

---

## 📞 Still Not Working?

1. Run debug endpoint and share the full output
2. Check Vercel logs for detailed error messages
3. Verify DATABASE_URL and JWT_SECRET are set in Vercel
4. Check Supabase project is active (not paused)

The debug endpoint will tell you exactly what's wrong and how to fix it!
