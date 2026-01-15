# ✅ JWT_SECRET Setup Complete

## 🔐 Your JWT_SECRET

```
adc14e33b24b4c2ec4114621159df09044b4915e47b745f65f30461a9a02ca09
```

**Status:** ✅ Valid (64 characters - perfect!)

---

## 📋 Verification Checklist

### ✅ Step 1: Verify JWT_SECRET in Vercel

1. Go to: **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Verify:
   - Variable name: `JWT_SECRET` (exact, case-sensitive)
   - Value: `adc14e33b24b4c2ec4114621159df09044b4915e47b745f65f30461a9a02ca09`
   - Enabled for: ✅ Production ✅ Preview ✅ Development
3. If not set correctly, add/update it now

### ✅ Step 2: Redeploy Application

**IMPORTANT:** After setting JWT_SECRET, you MUST redeploy for it to take effect.

**Option A: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

**Option B: Via Git Push**
```bash
git commit --allow-empty -m "trigger: Redeploy after JWT_SECRET update"
git push
```

### ✅ Step 3: Clear admin-token Cookie

**Method 1: Browser DevTools (Recommended)**
1. Open your site: `https://extremedeptkidz.com/admin/login`
2. Press **F12** (or right-click → Inspect)
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. In left sidebar, expand **Cookies**
5. Click on your domain (`extremedeptkidz.com`)
6. Find `admin-token` cookie
7. Right-click → **Delete** (or click the cookie and press Delete)
8. Refresh the page

**Method 2: Clear All Cookies for Site**
1. Open DevTools (F12)
2. **Application** tab → **Cookies** → Your domain
3. Right-click on domain → **Clear**
4. Refresh page

**Method 3: Browser Settings**
1. Chrome: Settings → Privacy → Clear browsing data → Cookies
2. Firefox: Settings → Privacy → Cookies and Site Data → Clear Data
3. Select only cookies for `extremedeptkidz.com`
4. Clear

### ✅ Step 4: Test Login

1. Go to: `https://extremedeptkidz.com/admin/login`
2. Enter credentials:
   - **Email:** `Admin@extremedeptkidz.com`
   - **Password:** `VisionaryIntro`
3. Click **SIGN IN**
4. Should redirect to `/admin` dashboard

---

## 🔍 Troubleshooting

### Issue: Still getting "Invalid or expired token"

**Check 1: Verify JWT_SECRET is set**
- Visit: `https://extremedeptkidz.com/api/admin/auth/diagnose`
- Look for `jwtSecret: { set: true, valid: true }`

**Check 2: Verify deployment completed**
- Go to Vercel → Deployments
- Latest deployment should show ✅ Success
- Check deployment logs for any errors

**Check 3: Clear cookies again**
- Make sure `admin-token` cookie is deleted
- Try incognito/private window

**Check 4: Check browser console**
- Open DevTools (F12) → Console
- Look for errors like:
  - `[JWT] ⚠️ CRITICAL: JWT_SECRET is not set`
  - `[JWT] ❌ JWT_SECRET is missing or too short`

### Issue: Login works but redirects back

**Solution:**
1. Check browser console for errors
2. Verify cookie is being set (DevTools → Application → Cookies)
3. Check Network tab - login request should return `200 OK` with token

---

## ✅ Success Indicators

After setup, you should see:

1. **Login successful:**
   - Redirects to `/admin` dashboard
   - No "Invalid or expired token" errors

2. **Cookie set:**
   - DevTools → Application → Cookies
   - `admin-token` cookie exists
   - Expiration: 7 days from now

3. **API calls work:**
   - Admin pages load without errors
   - Network tab shows `200 OK` responses
   - No `401 Unauthorized` errors

---

## 📝 Quick Reference

**JWT_SECRET:**
```
adc14e33b24b4c2ec4114621159df09044b4915e47b745f65f30461a9a02ca09
```

**Set in Vercel:**
- Variable: `JWT_SECRET`
- Value: (above)
- Environments: All

**After setting:**
1. ✅ Redeploy application
2. ✅ Clear `admin-token` cookie
3. ✅ Test login

---

**Status:** Ready to test! 🚀
