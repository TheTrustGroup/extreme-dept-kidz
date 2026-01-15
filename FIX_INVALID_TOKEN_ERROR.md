# 🔧 Fix: "Invalid or expired token" Error

## 🔍 Root Causes

The "Invalid or expired token" error typically occurs due to:

1. **JWT_SECRET not set in Vercel** - Most common cause
2. **JWT_SECRET mismatch** - Different values used for generation vs verification
3. **Token expired** - Token lifetime exceeded
4. **Cookie issues** - Cookie not being sent/received properly

---

## ✅ QUICK FIX

### Step 1: Check JWT_SECRET in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Look for `JWT_SECRET`
3. **If missing or incorrect:**
   - Generate a new secure secret:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Add it to Vercel:
     - Variable name: `JWT_SECRET`
     - Value: (paste the generated secret)
     - Enable for: ✅ Production ✅ Preview ✅ Development
   - **Redeploy** your application

### Step 2: Verify JWT_SECRET Length

The JWT_SECRET must be **at least 32 characters long**.

Check in Vercel:
- Variable name: `JWT_SECRET`
- Value length: Should be 32+ characters (64 is recommended)

### Step 3: Clear Browser Cookies

1. Open browser DevTools (F12)
2. Go to **Application** tab → **Cookies**
3. Delete the `admin-token` cookie
4. Try logging in again

---

## 🔍 DIAGNOSTIC STEPS

### Option 1: Use Diagnostic Endpoint

Visit (replace with your domain):
```
https://extremedeptkidz.com/api/admin/auth/diagnose
```

This will show:
- ✅ JWT_SECRET status
- ✅ Token generation test
- ✅ Specific recommendations

### Option 2: Check Browser Console

1. Open DevTools (F12) → **Console** tab
2. Try to log in
3. Look for errors like:
   - `[JWT] ❌ JWT_SECRET is missing or too short`
   - `[JWT] ❌ Token verification failed`
   - `[JWT] ⚠️ CRITICAL: JWT_SECRET is not set`

### Option 3: Check Network Tab

1. Open DevTools (F12) → **Network** tab
2. Try to log in
3. Check the login request:
   - Status should be `200`
   - Response should include `token` and `user`
4. Check subsequent requests:
   - Look for `401 Unauthorized` errors
   - Check if `admin-token` cookie is being sent

---

## 🛠️ DETAILED FIX

### Fix 1: Set JWT_SECRET in Vercel

**If JWT_SECRET is missing:**

1. **Generate a secure secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   This will output something like: `9b704c662d0eb6c4cafdb5824711204ac71efe311b06e2739c76fa377e4281da`

2. **Add to Vercel:**
   - Go to: Vercel Dashboard → Project → Settings → Environment Variables
   - Click **Add New**
   - Name: `JWT_SECRET`
   - Value: (paste the generated secret)
   - Environment: Select all (Production, Preview, Development)
   - Click **Save**

3. **Redeploy:**
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - Or push a new commit to trigger deployment

### Fix 2: Verify JWT_SECRET Consistency

**Important:** The JWT_SECRET used to **generate** tokens must be the **same** as the one used to **verify** tokens.

- ✅ Same value in all environments (Production, Preview, Development)
- ✅ Same value across all deployments
- ✅ No typos or extra spaces

### Fix 3: Check Token Expiration

Tokens expire after **7 days** by default. If you're getting "expired token" errors:

1. **Clear cookies** and log in again
2. **Or** increase expiration time in `.env`:
   ```
   JWT_EXPIRES_IN=30d
   ```

### Fix 4: Cookie Issues

**If cookies aren't being set:**

1. Check cookie settings in login route:
   - `httpOnly: true` ✅
   - `secure: true` (in production) ✅
   - `sameSite: 'lax'` ✅
   - `path: '/'` ✅

2. Check browser settings:
   - Cookies enabled
   - No strict privacy settings blocking cookies
   - Not in incognito mode (if cookies are blocked)

---

## ✅ VERIFICATION

After fixing, verify:

1. **Login works:**
   - Go to `/admin/login`
   - Enter credentials
   - Should redirect to `/admin` dashboard

2. **Token persists:**
   - Check DevTools → Application → Cookies
   - Should see `admin-token` cookie
   - Should have expiration date 7 days in future

3. **API calls work:**
   - Try accessing admin pages
   - Should not see "Invalid or expired token" errors
   - Check Network tab - requests should be `200 OK`

---

## 🚨 COMMON MISTAKES

1. **❌ JWT_SECRET not set in Vercel**
   - ✅ **Fix:** Add JWT_SECRET to Vercel environment variables

2. **❌ JWT_SECRET too short (< 32 characters)**
   - ✅ **Fix:** Generate a new 64-character secret

3. **❌ Different JWT_SECRET values**
   - ✅ **Fix:** Use the same JWT_SECRET everywhere

4. **❌ Forgot to redeploy after setting JWT_SECRET**
   - ✅ **Fix:** Redeploy application after adding environment variable

5. **❌ Cookies blocked by browser**
   - ✅ **Fix:** Enable cookies, check privacy settings

---

## 📝 CHECKLIST

- [ ] JWT_SECRET is set in Vercel
- [ ] JWT_SECRET is at least 32 characters
- [ ] JWT_SECRET is the same in all environments
- [ ] Application has been redeployed after setting JWT_SECRET
- [ ] Browser cookies are enabled
- [ ] Cleared old cookies
- [ ] Tested login after fixes

---

## 🎯 QUICK REFERENCE

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Check JWT_SECRET in code:**
- File: `lib/auth/jwt.ts`
- Look for: `process.env.JWT_SECRET`

**Set in Vercel:**
- Dashboard → Project → Settings → Environment Variables
- Add: `JWT_SECRET` = (generated value)
- Redeploy

---

**Status:** Error handling improved. Check JWT_SECRET in Vercel first! 🔐
