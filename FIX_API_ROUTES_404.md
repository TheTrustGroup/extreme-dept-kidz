# 🔧 Fix: API Routes Returning 404 on Custom Domain

## Problem
API routes (like `/api/admin/auth/test`) return 404 "Page Not Found" on custom domain but work on Vercel domain.

## Root Cause
This typically happens when:
1. **API routes weren't included in the deployment**
2. **Custom domain needs redeployment after code changes**
3. **Vercel routing configuration issue**
4. **Build cache issue**

## ✅ Solution Steps

### Step 1: Verify API Route Files Exist

Check that these files exist in your codebase:
- ✅ `app/api/admin/auth/test/route.ts`
- ✅ `app/api/admin/auth/login/route.ts`
- ✅ `app/api/admin/auth/domain-test/route.ts`
- ✅ `app/api/admin/auth/diagnose/route.ts`

### Step 2: Force Redeploy on Vercel

**Option A: Push Empty Commit (Recommended)**
```bash
git commit --allow-empty -m "Force redeploy to fix API routes on custom domain"
git push origin main
```

**Option B: Redeploy in Vercel Dashboard**
1. Go to **Vercel Dashboard** → Your Project
2. **Deployments** tab
3. Click **⋯** on latest deployment
4. Click **Redeploy**
5. Wait 2-3 minutes for completion

### Step 3: Verify Build Includes API Routes

1. **Vercel Dashboard** → **Deployments**
2. Click on latest deployment
3. Check **Build Logs**
4. Look for:
   - ✅ `Route (app)` entries showing API routes
   - ✅ No errors about missing API route files
   - ✅ Build completed successfully

**Expected in build logs:**
```
Route (app)                              ... /api/admin/auth/test
Route (app)                              ... /api/admin/auth/login
```

### Step 4: Test API Routes

After redeploy, test these URLs on your custom domain:

1. **Domain Test:**
   ```
   https://extremedeptkidz.com/api/admin/auth/domain-test
   ```
   Should return JSON with domain info

2. **Database Test:**
   ```
   https://extremedeptkidz.com/api/admin/auth/test
   ```
   Should return database connection status

3. **Full Diagnostics:**
   ```
   https://extremedeptkidz.com/api/admin/auth/diagnose
   ```
   Should return full diagnostic information

### Step 5: Check Vercel Domain Configuration

1. **Vercel Dashboard** → **Settings** → **Domains**
2. Verify `extremedeptkidz.com`:
   - ✅ Status: **Valid Configuration**
   - ✅ DNS: **Configured Correctly**
   - ✅ SSL: **Valid Certificate**
   - ✅ Points to correct project

### Step 6: Clear Browser Cache

Sometimes browser cache can cause issues:
1. Open browser in **Incognito/Private mode**
2. Test API routes again
3. Or clear cache: `Ctrl+Shift+Delete` (Windows) / `Cmd+Shift+Delete` (Mac)

## 🔍 Alternative: Test on Vercel Domain First

Before testing on custom domain, verify it works on Vercel domain:

```
https://your-project.vercel.app/api/admin/auth/domain-test
```

If it works on Vercel domain but not custom domain:
- ✅ Code is correct
- ❌ Custom domain routing issue
- **Solution:** Redeploy or check domain configuration

## 🆘 If Still 404 After Redeploy

### Check 1: Verify File Structure

Ensure API routes are in the correct location:
```
app/
  api/
    admin/
      auth/
        test/
          route.ts        ← Must exist
        login/
          route.ts           ← Must exist
        domain-test/
          route.ts          ← Must exist
```

### Check 2: Check Vercel Build Logs

Look for errors like:
- ❌ "Route not found"
- ❌ "File not found"
- ❌ Build errors

### Check 3: Verify Next.js Version

Check `package.json` for Next.js version:
```json
{
  "dependencies": {
    "next": "^14.0.0"  // Should be 13+ for App Router
  }
}
```

### Check 4: Check vercel.json

Ensure `vercel.json` doesn't override routing:
```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## 📋 Quick Checklist

- [ ] API route files exist in `app/api/` directory
- [ ] Redeployed after adding new API routes
- [ ] Build logs show API routes being built
- [ ] Tested on Vercel domain first (works there)
- [ ] Custom domain shows "Valid Configuration"
- [ ] Cleared browser cache / tested in incognito
- [ ] Waited 2-3 minutes after redeploy

## 🎯 Most Likely Fix

**99% of the time, this is fixed by:**
1. **Redeploying** the project on Vercel
2. **Waiting** 2-3 minutes for deployment to complete
3. **Testing** API routes again

The API routes exist in your code, they just need to be included in the deployment.

---

**After redeploying, test:**
```
https://extremedeptkidz.com/api/admin/auth/domain-test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "API route is accessible",
  "domain": "extremedeptkidz.com",
  ...
}
```
