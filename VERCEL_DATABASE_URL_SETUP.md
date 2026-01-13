# 🔧 Vercel DATABASE_URL Setup

## ✅ Your Connection String

Your Supabase Connection Pooler URL:
```
postgresql://postgres.puuszplmdbindiesfxlr:UPgee2nzFPgJmoQo@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

## ⚠️ Important: Add SSL Mode

The connection string needs `?sslmode=require` at the end for secure connections.

**Correct format:**
```
postgresql://postgres.puuszplmdbindiesfxlr:UPgee2nzFPgJmoQo@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require
```

---

## 📋 Steps to Set in Vercel

### Step 1: Go to Vercel Dashboard
1. Navigate to your project: **extreme-dept-kidz**
2. Go to **Settings** → **Environment Variables**

### Step 2: Add/Update DATABASE_URL
1. Find `DATABASE_URL` in the list (or click **Add New**)
2. **Key:** `DATABASE_URL`
3. **Value:** 
   ```
   postgresql://postgres.puuszplmdbindiesfxlr:UPgee2nzFPgJmoQo@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
4. **Important:**
   - ✅ Enable for **Production**
   - ✅ Enable for **Preview**
   - ✅ Enable for **Development**
   - ❌ Do NOT add quotes around the value
   - ❌ Do NOT add extra spaces

### Step 3: Save and Redeploy
1. Click **Save**
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment (or it will auto-redeploy)

---

## ✅ Verification

After deployment, test the connection:

**Visit:** `https://your-domain.com/api/admin/auth/test-db`

**Expected response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "diagnostics": {
    "connectionTest": "success",
    "adminUserCount": 1
  }
}
```

---

## 🔍 If Connection Still Fails

### Check 1: Verify Connection String Format
Make sure it's exactly:
```
postgresql://postgres.puuszplmdbindiesfxlr:UPgee2nzFPgJmoQo@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### Check 2: Verify Supabase Project Status
1. Go to Supabase Dashboard
2. Check if project is **active** (not paused)
3. Verify the connection string matches

### Check 3: Test Connection String
You can test the connection string directly:
```bash
# Using psql (if installed)
psql "postgresql://postgres.puuszplmdbindiesfxlr:UPgee2nzFPgJmoQo@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

---

## 📝 Complete Environment Variables Checklist

Make sure these are set in Vercel:

1. **DATABASE_URL** ✅
   ```
   postgresql://postgres.puuszplmdbindiesfxlr:UPgee2nzFPgJmoQo@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```

2. **JWT_SECRET** (if not set)
   - Minimum 32 characters
   - Generate a random string

3. **JWT_EXPIRES_IN** (optional)
   - Default: `7d`

---

## 🚀 After Setting DATABASE_URL

1. **Wait for deployment** (2-3 minutes)
2. **Test connection:** Visit `/api/admin/auth/test-db`
3. **Create admin user** (if needed):
   ```sql
   INSERT INTO "AdminUser" (
     id, email, name, "displayName", "passwordHash", role, "isActive", "createdAt", "updatedAt"
   ) VALUES (
     gen_random_uuid(),
     'admin@extremedeptkidz.com',
     'Super Admin',
     'Super Admin',
     '$2b$12$4lkrd543.oWLDhd/bie1l.Tf0T7.OdjTqPzLhEc60s7JiDG4AHgxS',
     'super_admin',
     true,
     NOW(),
     NOW()
   );
   ```
4. **Login:** Use email `admin@extremedeptkidz.com` and password `Admin@2024!`

---

## ✅ Quick Copy-Paste for Vercel

**Key:** `DATABASE_URL`

**Value:**
```
postgresql://postgres.puuszplmdbindiesfxlr:UPgee2nzFPgJmoQo@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**Environments:** Production, Preview, Development

---

After setting this in Vercel and redeploying, the database connection should work!
