# ✅ Verify Database Connection After Vercel Update

## Quick Verification Steps

### Step 1: Wait for Deployment

After updating environment variables in Vercel:
1. **Redeploy** your project (if you haven't already)
2. **Wait 2-3 minutes** for deployment to complete
3. Make sure the deployment status shows **"Ready"**

### Step 2: Test Diagnostic Endpoint

Visit this URL on your Vercel deployment:
```
https://your-domain.vercel.app/api/admin/auth/diagnose
```

**What to look for:**

✅ **SUCCESS - Connection Working:**
```json
{
  "status": "success",
  "allChecksPass": true,
  "diagnostics": {
    "database": {
      "connected": true,
      "adminUserCount": 1,
      "adminUsers": [...]
    }
  }
}
```

❌ **FAILED - Still Not Connected:**
```json
{
  "database": {
    "connected": false,
    "error": "Can't reach database server..."
  }
}
```

### Step 3: Test Simple Connection Endpoint

Visit this URL:
```
https://your-domain.vercel.app/api/admin/auth/test
```

**Expected response if working:**
```json
{
  "success": true,
  "prismaConnected": true,
  "adminUserCount": 1,
  "adminUsers": [
    {
      "id": "...",
      "email": "admin@extremedeptkidz.com",
      "name": "Super Admin",
      "role": "super_admin",
      "isActive": true
    }
  ],
  "databaseUrl": "Set"
}
```

### Step 4: Check Vercel Deployment Logs

1. Go to **Vercel Dashboard** → Your Project
2. Click on the **latest deployment**
3. Check the **Logs** tab
4. Look for:
   - ✅ "Build successful"
   - ✅ No database connection errors
   - ❌ Any Prisma errors
   - ❌ Any "Can't reach database" errors

## What the Diagnostic Endpoint Checks

The `/api/admin/auth/diagnose` endpoint verifies:

1. ✅ **Database Connection** - Can Prisma connect to Supabase?
2. ✅ **Environment Variables** - Are DATABASE_URL and JWT_SECRET set?
3. ✅ **Admin User Exists** - Is the admin user in the database?
4. ✅ **Password Verification** - Does the password hash match?
5. ✅ **JWT Generation** - Can we create authentication tokens?

## If Connection Still Fails

### Check 1: Verify Environment Variable Format

1. Go to **Vercel Dashboard** → Settings → Environment Variables
2. Click on `DATABASE_URL`
3. Click the **eye icon** to reveal the value
4. Verify it:
   - Uses `pooler.supabase.com` (NOT `db.supabase.co`)
   - Has correct port (`6543` for pooler)
   - Password is URL encoded (`%21` for `!`)
   - Ends with `?sslmode=require`

### Check 2: Verify It's Enabled for Production

1. In Environment Variables, check `DATABASE_URL`
2. Make sure **Production** is checked ✅
3. Also check **Preview** and **Development** if needed

### Check 3: Check Supabase Project Status

1. Go to **Supabase Dashboard**
2. Check if project shows:
   - 🟢 **Active** = Good
   - 🟠 **Paused** = Click "Restore"
   - 🔴 **Error** = Contact support

### Check 4: Verify Connection Pooler is Active

1. Supabase Dashboard → Settings → Database
2. Scroll to **Connection Pooling**
3. Make sure it shows as **Active** or **Enabled**

## Expected Results After Fix

Once the connection works, you should see:

1. **Diagnostic endpoint** shows `database.connected: true`
2. **Test endpoint** returns admin users list
3. **No errors** in Vercel deployment logs
4. **Login works** at `/admin/login`

## Next Steps After Connection Works

Once `database.connected: true`:

1. **Create admin user** (if not exists):
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
       "isActive" = true;
   ```

2. **Test login:**
   - Go to `/admin/login`
   - Email: `admin@extremedeptkidz.com`
   - Password: `Admin123!`

## Quick Test URLs

Replace `your-domain` with your actual Vercel domain:

- Diagnostic: `https://your-domain.vercel.app/api/admin/auth/diagnose`
- Simple Test: `https://your-domain.vercel.app/api/admin/auth/test`
- Login Page: `https://your-domain.vercel.app/admin/login`
