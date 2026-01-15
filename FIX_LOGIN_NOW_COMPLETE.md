# 🔧 Fix Login Issues - Complete Guide

## 🚨 Current Issue: "Loading failed, unauthorized"

This guide will help you fix the login issue step by step.

---

## ✅ STEP 1: Verify JWT_SECRET in Vercel

**CRITICAL:** This is the most common cause of login failures.

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project
   - **Settings** → **Environment Variables**

2. **Check JWT_SECRET:**
   - Variable name: `JWT_SECRET` (exact, case-sensitive)
   - Value: `adc14e33b24b4c2ec4114621159df09044b4915e47b745f65f30461a9a02ca09`
   - Length: Must be 64 characters ✅

3. **If missing:**
   - Click **Add New**
   - Name: `JWT_SECRET`
   - Value: `adc14e33b24b4c2ec4114621159df09044b4915e47b745f65f30461a9a02ca09`
   - Environment: ✅ Production ✅ Preview ✅ Development
   - Click **Save**

4. **Redeploy:**
   - Go to **Deployments** tab
   - Click **Redeploy** on latest deployment
   - Wait for deployment to complete

---

## ✅ STEP 2: Verify Admin User in Database

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

4. **If user doesn't exist or hash is wrong:**
   - Run the SQL from `SET_ADMIN_CREDENTIALS_FINAL.sql`
   - This will delete old users and create the new one

---

## ✅ STEP 3: Test Diagnostic Endpoint

**After redeploying**, visit:
```
https://extremedeptkidz.com/api/admin/auth/diagnose
```

**Check the response:**
- `jwtSecret.set` should be `true`
- `jwtSecret.valid` should be `true`
- `jwtSecret.length` should be `64`
- `database.connected` should be `true`
- `database.adminUserCount` should be `1`

**If JWT_SECRET shows `false`:**
- It's not set in Vercel
- Go back to Step 1

---

## ✅ STEP 4: Clear Cookies

**Mac Safari:**
1. Develop → Show Web Inspector (Cmd + Option + I)
2. Storage → Cookies → `extremedeptkidz.com`
3. Delete `admin-token`
4. Refresh

**Or use Private Window** (Cmd + Shift + N)

**iPad Safari:**
1. Settings → Safari → Advanced → Website Data
2. Search: `extremedeptkidz.com`
3. Swipe left → Delete

---

## ✅ STEP 5: Test Login

1. **Go to:**
   ```
   https://extremedeptkidz.com/admin/login
   ```

2. **Open Browser Console:**
   - Press F12 (or Cmd + Option + I on Mac)
   - Go to **Console** tab

3. **Enter credentials:**
   - Email: `Admin@extremedeptkidz.com`
   - Password: `VisionaryIntro`

4. **Click SIGN IN**

5. **Watch console for:**
   - `[Auth] Starting login for: Admin@extremedeptkidz.com`
   - `[Auth] Login response status: 200 OK`
   - `[Auth] ✅ Setting auth state...`
   - `[Auth] ✅ Cookie synced after login`
   - `[Auth] ✅ Login successful!`

6. **Check Network tab:**
   - Click on `/api/admin/auth/login` request
   - Status should be `200`
   - Response should have `{ success: true, token: "...", user: {...} }`
   - Headers should have `Set-Cookie: admin-token=...`

---

## 🔍 Troubleshooting

### Error: "JWT_SECRET must be at least 32 characters"

**Fix:**
- JWT_SECRET not set in Vercel
- Add it (see Step 1)
- Redeploy

---

### Error: "Invalid email or password"

**Possible causes:**
1. User doesn't exist → Run SQL from `SET_ADMIN_CREDENTIALS_FINAL.sql`
2. Password hash wrong → Run SQL to update password
3. Email case mismatch → Try exact case: `Admin@extremedeptkidz.com`

---

### Error: "Unauthorized" or "Invalid or expired token"

**Possible causes:**
1. JWT_SECRET mismatch → Ensure it's set correctly in Vercel
2. Old cookie → Clear cookies (Step 4)
3. Token expired → Clear cookies and login again

---

### Error: "Loading failed" or Network Error

**Check:**
1. Browser console for CORS errors
2. Network connectivity
3. Vercel deployment status
4. Application logs in Vercel

---

## ✅ Success Indicators

**Login successful when:**
- ✅ Console shows `[Auth] ✅ Login successful!`
- ✅ Network response is `200 OK`
- ✅ Response has `token` and `user`
- ✅ Cookie is set (check DevTools → Application → Cookies)
- ✅ Redirects to `/admin` dashboard
- ✅ No error messages

---

## 🚨 Emergency Reset

If nothing works, reset everything:

1. **Set JWT_SECRET in Vercel:**
   ```
   adc14e33b24b4c2ec4114621159df09044b4915e47b745f65f30461a9a02ca09
   ```

2. **Reset admin user:**
   - Run SQL from `SET_ADMIN_CREDENTIALS_FINAL.sql` in Supabase

3. **Redeploy:**
   - Vercel → Deployments → Redeploy

4. **Clear cookies:**
   - Use private/incognito mode

5. **Test login:**
   - Email: `Admin@extremedeptkidz.com`
   - Password: `VisionaryIntro`

---

## 📝 Checklist

- [ ] JWT_SECRET set in Vercel (64 characters)
- [ ] Application redeployed after setting JWT_SECRET
- [ ] Admin user exists in database
- [ ] Admin user is active
- [ ] Password hash is correct
- [ ] Cookies cleared
- [ ] Diagnostic endpoint shows JWT_SECRET is set
- [ ] Login request returns 200 OK
- [ ] Token is in response
- [ ] Cookie is set
- [ ] Redirects to /admin
- [ ] No console errors

---

**Status:** Follow these steps in order. Most issues are JWT_SECRET not set in Vercel! 🔐
