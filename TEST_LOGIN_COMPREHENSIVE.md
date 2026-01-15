# 🧪 Comprehensive Login Test & Fix Guide

## 🔍 Step-by-Step Testing

### Step 1: Check JWT_SECRET in Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project
   - **Settings** → **Environment Variables**

2. **Verify JWT_SECRET:**
   - Variable name: `JWT_SECRET` (exact, case-sensitive)
   - Value: `adc14e33b24b4c2ec4114621159df09044b4915e47b745f65f30461a9a02ca09`
   - Length: 64 characters ✅
   - Enabled for: ✅ Production ✅ Preview ✅ Development

3. **If missing or wrong:**
   - Add/Update the variable
   - **Redeploy** the application

---

### Step 2: Check Admin User in Database

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your project
   - **SQL Editor** → **New Query**

2. **Run this SQL:**
   ```sql
   SELECT 
       id,
       email,
       name,
       role,
       "isActive",
       CASE 
           WHEN "passwordHash" IS NOT NULL AND LENGTH("passwordHash") > 20 THEN '✅ Hash set'
           ELSE '❌ No hash'
       END as hash_status
   FROM "AdminUser"
   WHERE email = 'Admin@extremedeptkidz.com';
   ```

3. **Expected result:**
   - Should return 1 row
   - Email: `Admin@extremedeptkidz.com`
   - Role: `super_admin`
   - isActive: `true`
   - hash_status: `✅ Hash set`

4. **If user doesn't exist:**
   - Run the SQL from `SET_ADMIN_CREDENTIALS_FINAL.sql`

---

### Step 3: Test Diagnostic Endpoint

1. **Visit (after redeploy):**
   ```
   https://extremedeptkidz.com/api/admin/auth/diagnose
   ```

2. **Check the response:**
   ```json
   {
     "environment": {
       "jwtSecret": {
         "set": true,
         "valid": true,
         "length": 64
       }
     },
     "database": {
       "connected": true,
       "adminUserCount": 1
     }
   }
   ```

3. **If JWT_SECRET shows `"set": false`:**
   - JWT_SECRET is not set in Vercel
   - Add it and redeploy

---

### Step 4: Clear Cookies

**Mac Safari:**
1. Develop → Show Web Inspector (Cmd + Option + I)
2. Storage → Cookies → `extremedeptkidz.com`
3. Delete `admin-token`
4. Refresh

**iPad Safari:**
1. Settings → Safari → Advanced → Website Data
2. Search: `extremedeptkidz.com`
3. Swipe left → Delete

**Or use Private/Incognito mode** (easiest)

---

### Step 5: Test Login

1. **Go to:**
   ```
   https://extremedeptkidz.com/admin/login
   ```

2. **Enter credentials:**
   - Email: `Admin@extremedeptkidz.com`
   - Password: `VisionaryIntro`

3. **Open Browser Console:**
   - Press F12 (or Cmd + Option + I on Mac)
   - Go to **Console** tab

4. **Watch for errors:**
   - Look for `[Auth]` log messages
   - Check for any red error messages
   - Note the exact error message

5. **Check Network Tab:**
   - Go to **Network** tab
   - Try login again
   - Click on the `/api/admin/auth/login` request
   - Check:
     - Status code (should be `200`)
     - Response body (should have `token` and `user`)
     - Response headers (check for `Set-Cookie` header)

---

## 🔧 Common Issues & Fixes

### Issue 1: "JWT_SECRET must be at least 32 characters"

**Fix:**
- JWT_SECRET is not set in Vercel
- Add it: `adc14e33b24b4c2ec4114621159df09044b4915e47b745f65f30461a9a02ca09`
- Redeploy

---

### Issue 2: "Invalid email or password"

**Possible causes:**
1. **User doesn't exist:**
   - Run SQL from `SET_ADMIN_CREDENTIALS_FINAL.sql`

2. **Password hash mismatch:**
   - Password in database doesn't match `VisionaryIntro`
   - Run SQL to update password hash

3. **Email case mismatch:**
   - Try: `Admin@extremedeptkidz.com` (exact case)
   - Or: `admin@extremedeptkidz.com` (lowercase)

---

### Issue 3: "Unauthorized" or "Invalid or expired token"

**Possible causes:**
1. **JWT_SECRET mismatch:**
   - Token generated with one secret, verified with another
   - Ensure JWT_SECRET is same everywhere
   - Clear cookies and try again

2. **Cookie not set:**
   - Check Network tab → Response headers
   - Should see `Set-Cookie: admin-token=...`
   - If missing, check cookie settings

3. **Token expired:**
   - Clear cookies and login again
   - Tokens expire after 7 days

---

### Issue 4: "Loading failed" or Network Error

**Possible causes:**
1. **CORS issue:**
   - Check browser console for CORS errors
   - Should not happen with same-origin requests

2. **Network connectivity:**
   - Check internet connection
   - Try different network

3. **Server error:**
   - Check Vercel deployment logs
   - Check if application is deployed

---

## ✅ Success Indicators

**Login successful when you see:**

1. **Console logs:**
   ```
   [Auth] ✅ Setting auth state...
   [Auth] ✅ Cookie synced after login
   [Auth] ✅ Login successful!
   ```

2. **Network response:**
   - Status: `200 OK`
   - Response: `{ success: true, token: "...", user: {...} }`
   - Headers: `Set-Cookie: admin-token=...`

3. **Redirect:**
   - Automatically redirects to `/admin` dashboard
   - No error messages

4. **Cookie set:**
   - DevTools → Application → Cookies
   - `admin-token` cookie exists
   - Expiration: 7 days from now

---

## 🚨 Emergency Fix: Reset Everything

If nothing works, reset completely:

1. **Set JWT_SECRET in Vercel:**
   - Value: `adc14e33b24b4c2ec4114621159df09044b4915e47b745f65f30461a9a02ca09`

2. **Reset admin user in database:**
   - Run SQL from `SET_ADMIN_CREDENTIALS_FINAL.sql`

3. **Redeploy application:**
   - Vercel → Deployments → Redeploy

4. **Clear all cookies:**
   - Use private/incognito mode

5. **Test login:**
   - Email: `Admin@extremedeptkidz.com`
   - Password: `VisionaryIntro`

---

## 📝 Testing Checklist

- [ ] JWT_SECRET set in Vercel (64 characters)
- [ ] Application redeployed after setting JWT_SECRET
- [ ] Admin user exists in database
- [ ] Admin user is active
- [ ] Password hash is set
- [ ] Cookies cleared
- [ ] Diagnostic endpoint shows JWT_SECRET is set
- [ ] Login request returns 200 OK
- [ ] Token is in response
- [ ] Cookie is set
- [ ] Redirects to /admin
- [ ] No console errors

---

**Status:** Follow these steps systematically to identify and fix the issue! 🔍
