# 🔧 Database Connection Error - Fix Guide

## 🚨 Issue: "Database connection error"

This error occurs when the application cannot connect to your Supabase PostgreSQL database.

---

## ✅ Quick Fix Steps

### Step 1: Check Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Verify `DATABASE_URL` is set:
   - ✅ Should be enabled for **Production**, **Preview**, and **Development**
   - ✅ Should NOT have quotes around it
   - ✅ Should use the **Connection Pooler** URL (port 6543)

### Step 2: Get Correct Connection String from Supabase

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Settings** → **Database**
3. Scroll to **Connection string** section
4. Select **URI** format
5. Select **Connection Pooling** mode (Transaction mode)
6. Copy the connection string

**Format should be:**
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
```

### Step 3: Update Vercel Environment Variable

1. In Vercel, go to **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click **Edit**
4. Paste the connection string from Step 2
5. **Important**: 
   - Remove any quotes if present
   - Ensure password is URL-encoded (special characters like `!` become `%21`)
   - Make sure it ends with `?sslmode=require`
6. Save and redeploy

### Step 4: Verify Connection

After deployment, test the connection:

**Visit:** `https://your-domain.com/api/admin/auth/test-db`

This will show:
- ✅ Connection status
- ✅ Database URL configuration
- ✅ Admin user count
- ✅ Detailed diagnostics

---

## 🔍 Diagnostic Endpoints

### 1. Test Database Connection
**URL:** `/api/admin/auth/test-db`

**What it checks:**
- DATABASE_URL environment variable
- Prisma client availability
- Database connectivity
- Admin user count

### 2. Test Login Credentials
**URL:** `/api/admin/auth/test-login`

**POST Request:**
```json
{
  "email": "admin@extremedeptkidz.com",
  "password": "Admin@2024!"
}
```

**What it checks:**
- User exists in database
- Password is correct
- Account is active
- Detailed diagnostics

---

## 🛠️ Common Issues & Solutions

### Issue 1: "DATABASE_URL is not set"

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Add `DATABASE_URL` with your Supabase connection string
3. Enable for all environments (Production, Preview, Development)
4. Redeploy

### Issue 2: "Can't reach database server"

**Possible causes:**
- Wrong host/port in connection string
- Supabase project is paused
- Network restrictions

**Solutions:**
1. **Use Connection Pooler** (port 6543):
   ```
   postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
   ```

2. **Check Supabase Project Status:**
   - Go to Supabase Dashboard
   - Verify project is **active** (not paused)
   - Check for any warnings

3. **Verify Connection String:**
   - Get the exact string from Supabase Dashboard
   - Copy it exactly (don't modify)

### Issue 3: "Authentication failed"

**Possible causes:**
- Wrong password
- Password not URL-encoded
- Connection string format incorrect

**Solutions:**
1. **Get password from Supabase:**
   - Settings → Database → Database password
   - Reset if needed

2. **URL-encode special characters:**
   - `!` → `%21`
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - etc.

3. **Use Connection Pooler URL:**
   - More reliable for serverless
   - Better connection management

### Issue 4: Connection works locally but not on Vercel

**Solution:**
1. **Check Vercel Environment Variables:**
   - Make sure `DATABASE_URL` is set
   - Verify it's enabled for Production
   - Check for typos or extra spaces

2. **Use Connection Pooler:**
   - Direct connection (port 5432) may not work on Vercel
   - Always use pooler (port 6543) for serverless

3. **Redeploy after changes:**
   - Environment variable changes require redeployment

---

## 📋 Connection String Format

### ✅ Correct Format (Connection Pooler):
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
```

### ❌ Wrong Format (Direct Connection):
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```
*This may not work on Vercel serverless functions*

---

## 🔐 Password URL Encoding

If your password contains special characters, encode them:

| Character | Encoded |
|-----------|---------|
| `!` | `%21` |
| `@` | `%40` |
| `#` | `%23` |
| `$` | `%24` |
| `%` | `%25` |
| `&` | `%26` |
| `*` | `%2A` |
| `(` | `%28` |
| `)` | `%29` |
| `+` | `%2B` |
| `=` | `%3D` |
| `?` | `%3F` |

**Example:**
- Password: `MyP@ssw0rd!`
- Encoded: `MyP%40ssw0rd%21`

---

## ✅ Verification Checklist

After fixing, verify:

- [ ] `DATABASE_URL` is set in Vercel
- [ ] Connection string uses port 6543 (pooler)
- [ ] Password is URL-encoded
- [ ] Connection string ends with `?sslmode=require`
- [ ] Supabase project is active
- [ ] Test endpoint `/api/admin/auth/test-db` returns success
- [ ] Admin user exists in database
- [ ] Login works at `/admin/login`

---

## 🚀 Quick Test

After updating environment variables:

1. **Test Database Connection:**
   ```
   https://your-domain.com/api/admin/auth/test-db
   ```

2. **If successful, test login:**
   ```
   https://your-domain.com/api/admin/auth/test-login
   POST: {"email":"admin@extremedeptkidz.com","password":"Admin@2024!"}
   ```

3. **Try logging in:**
   ```
   https://your-domain.com/admin/login
   ```

---

## 📞 Still Having Issues?

1. **Check the test-db endpoint** for detailed diagnostics
2. **Verify Supabase project** is active and running
3. **Double-check connection string** from Supabase Dashboard
4. **Ensure password is URL-encoded** correctly
5. **Use Connection Pooler** (port 6543) not direct connection

The diagnostic endpoints will show you exactly what's wrong with the connection.
