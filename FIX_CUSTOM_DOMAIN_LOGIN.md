# 🔧 Fix: Admin Login Not Working on Custom Domain

## Problem
Admin login works on Vercel domain (`*.vercel.app`) but fails on custom domain (`extremedeptkidz.com`).

## Common Causes

### 1. Environment Variables Not Set for Custom Domain
Vercel requires environment variables to be explicitly enabled for custom domains.

### 2. API Routes Not Accessible
Custom domain might not be properly configured to route API requests.

### 3. CORS or Domain Restrictions
Some configurations might restrict API access to specific domains.

## ✅ Solution Steps

### Step 1: Verify Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. For each variable (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`):
   - Click **Edit**
   - Ensure **Production** is checked ✅
   - Ensure **Preview** is checked ✅
   - Ensure **Development** is checked ✅
   - Click **Save**

### Step 2: Verify Custom Domain Configuration

1. Go to **Vercel Dashboard** → Your Project
2. **Settings** → **Domains**
3. Verify `extremedeptkidz.com` is listed and shows:
   - ✅ Status: **Valid Configuration**
   - ✅ DNS: **Configured Correctly**
   - ✅ SSL: **Valid Certificate**

### Step 3: Check API Route Accessibility

Test if API routes work on custom domain:

```bash
# Test login endpoint
curl -X POST https://extremedeptkidz.com/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@extremedeptkidz.com","password":"Admin@2024!"}'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "...",
  "user": { ... }
}
```

**If you get 404:**
- The custom domain might not be routing API requests correctly
- Check Vercel domain configuration

**If you get 500:**
- Environment variables might not be available
- Check Vercel environment variables

### Step 4: Check Browser Console Errors

1. Open `https://extremedeptkidz.com/admin/login`
2. Open **Developer Tools** (F12)
3. Go to **Console** tab
4. Try to login
5. Check for errors:
   - Network errors (CORS, 404, 500)
   - JavaScript errors
   - API call failures

### Step 5: Verify Database Connection

The login API needs `DATABASE_URL` to work. Test if it's accessible:

```bash
# Test database connection endpoint
curl https://extremedeptkidz.com/api/admin/auth/test
```

**Expected Response:**
```json
{
  "status": "success",
  "prismaConnected": true,
  "adminUserCount": 1,
  ...
}
```

### Step 6: Force Redeploy

Sometimes a redeploy is needed to pick up environment variable changes:

1. **Vercel Dashboard** → **Deployments**
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete
5. Test login again

### Step 7: Check Vercel Build Logs

1. **Vercel Dashboard** → **Deployments**
2. Click on latest deployment
3. Check **Build Logs** for errors:
   - Missing environment variables
   - Database connection errors
   - Build failures

## 🔍 Diagnostic Endpoint

Visit this URL on your custom domain to get detailed diagnostics:

```
https://extremedeptkidz.com/api/admin/auth/diagnose
```

This will show:
- ✅ Database connection status
- ✅ Environment variables status
- ✅ Admin user existence
- ✅ Specific recommendations

## 🆘 If Still Not Working

### Option A: Check Vercel Project Settings

1. **Vercel Dashboard** → **Settings** → **General**
2. Verify **Framework Preset**: Next.js
3. Verify **Build Command**: `npm run build` or `next build`
4. Verify **Output Directory**: `.next` (default)

### Option B: Check Domain DNS

1. Verify DNS records point to Vercel:
   - A record or CNAME pointing to Vercel
   - Check in your domain registrar

2. Verify SSL certificate:
   - Should be automatically provisioned by Vercel
   - Check in **Settings** → **Domains**

### Option C: Temporary Workaround

If custom domain continues to fail, you can:
1. Use Vercel domain for admin: `https://your-project.vercel.app/admin/login`
2. Keep custom domain for public site: `https://extremedeptkidz.com`

## 📋 Quick Checklist

- [ ] Environment variables enabled for Production in Vercel
- [ ] Custom domain shows "Valid Configuration" in Vercel
- [ ] API routes accessible on custom domain (`/api/admin/auth/test`)
- [ ] Database connection works (`/api/admin/auth/test` returns success)
- [ ] No CORS errors in browser console
- [ ] Redeployed after environment variable changes
- [ ] Checked Vercel build logs for errors

## 🎯 Most Likely Fix

**99% of the time, this is caused by environment variables not being enabled for Production in Vercel.**

1. Go to Vercel → Settings → Environment Variables
2. Edit each variable
3. Ensure **Production** checkbox is checked ✅
4. Save
5. Redeploy

---

**After fixing, test login at:**
```
https://extremedeptkidz.com/admin/login
```

**Credentials:**
- Email: `admin@extremedeptkidz.com`
- Password: `Admin@2024!`
