# 🔍 How to Access the Diagnostic Endpoint

## Find Your Vercel Domain

### Method 1: From Vercel Dashboard

1. Go to **https://vercel.com/dashboard**
2. Select your project: `extreme-dept-kidz`
3. Look at the **Deployments** tab
4. Click on the latest deployment
5. You'll see your domain at the top, for example:
   - `extreme-dept-kidz.vercel.app` (default Vercel domain)
   - OR `extremedeptkidz.com` (if you have a custom domain)

### Method 2: From Project Settings

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** tab
3. Click **Domains** in the left sidebar
4. You'll see all your domains listed

### Method 3: Check Your Custom Domain

If you set up a custom domain (like `extremedeptkidz.com`), use that instead.

---

## Access the Diagnostic Endpoint

Once you know your domain, visit:

### If using Vercel default domain:
```
https://extreme-dept-kidz.vercel.app/api/admin/auth/diagnose
```

### If using custom domain:
```
https://extremedeptkidz.com/api/admin/auth/diagnose
```

### Or if you have a different domain:
```
https://YOUR-ACTUAL-DOMAIN/api/admin/auth/diagnose
```

---

## What the Diagnostic Shows

The endpoint will return a JSON response with:

### ✅ If Everything Works:
```json
{
  "status": "success",
  "allChecksPass": true,
  "diagnostics": {
    "database": {
      "connected": true,
      "adminUserCount": 1,
      "adminUsers": [...]
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
  },
  "recommendations": [
    "✅ All checks passed! Login should work correctly."
  ]
}
```

### ❌ If There Are Issues:
```json
{
  "status": "issues_found",
  "allChecksPass": false,
  "diagnostics": {
    "database": { "connected": false, "error": "..." },
    "environment": {
      "databaseUrl": { "set": false, "valid": false },
      "jwtSecret": { "set": false, "valid": false }
    },
    "testLogin": {
      "userExists": false,
      "errors": ["Admin user not found"]
    }
  },
  "recommendations": [
    "❌ DATABASE_URL is not set in Vercel environment variables",
    "❌ JWT_SECRET is not set in Vercel environment variables",
    "❌ No admin users found in database"
  ]
}
```

---

## Quick Steps

1. **Find your domain:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Note the domain shown

2. **Visit the diagnostic endpoint:**
   - Replace `your-domain` with your actual domain
   - Example: `https://extreme-dept-kidz.vercel.app/api/admin/auth/diagnose`

3. **Read the recommendations:**
   - The `recommendations` array tells you exactly what to fix
   - Follow each recommendation step by step

4. **Fix the issues:**
   - Set missing environment variables in Vercel
   - Create admin user in Supabase if missing
   - Redeploy after making changes

5. **Check again:**
   - Visit the diagnostic endpoint again
   - Should show `allChecksPass: true` when fixed

---

## Alternative: Use Browser DevTools

1. Open your Vercel deployment in a browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Type this and press Enter:
   ```javascript
   fetch('/api/admin/auth/diagnose').then(r => r.json()).then(console.log)
   ```
5. The diagnostic results will appear in the console

---

## Still Can't Find Your Domain?

1. **Check Vercel email notifications:**
   - Vercel sends emails with deployment URLs

2. **Check your repository:**
   - If you have a README, it might have the domain listed

3. **Ask Vercel support:**
   - Or check your Vercel project settings for the domain

---

## Example URLs

Based on common Vercel naming:

- `https://extreme-dept-kidz.vercel.app/api/admin/auth/diagnose`
- `https://extreme-dept-kidz-git-main-yourusername.vercel.app/api/admin/auth/diagnose`
- `https://extremedeptkidz.com/api/admin/auth/diagnose` (if custom domain)

**Just replace the domain part with your actual domain!**
