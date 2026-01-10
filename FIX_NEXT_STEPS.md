# Fix Next Steps - Authentication Setup

## 🔍 Current Issues

1. **Database Connection**: Authentication failing (credentials or SSL issue)
2. **JWT_SECRET**: Not set in environment variables

## ✅ Quick Fix Guide

### Step 1: Add JWT_SECRET to .env.local

Add these lines to your `.env.local` file:

```env
# JWT Authentication
JWT_SECRET=790a5d8a66b3c8cb8d731945c0966fc506b82790a62128f8d326931cbe37917b
JWT_EXPIRES_IN=7d
```

**Or run the setup script:**
```bash
./scripts/setup-auth.sh
```

### Step 2: Fix Database Connection

The database connection is failing. Try these solutions:

#### Option A: Add SSL Mode to Connection String

Update your `.env.local` DATABASE_URL to include SSL:

```env
DATABASE_URL="postgresql://postgres:Zillion0031%21@db.puuszplmdbindiesfxlr.supabase.co:5432/postgres?sslmode=require"
```

#### Option B: Use Connection Pooler (Port 6543)

```env
DATABASE_URL="postgresql://postgres:Zillion0031%21@db.puuszplmdbindiesfxlr.supabase.co:6543/postgres?pgbouncer=true&sslmode=require"
```

#### Option C: Check Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Check:
   - Project is **active** (not paused)
   - Connection string matches your `.env.local`
   - IP restrictions are disabled or your IP is allowed
5. Copy the **exact** connection string from Supabase

#### Option D: Verify Credentials

1. In Supabase Dashboard → **Settings** → **Database**
2. Check if the password is correct
3. Reset password if needed
4. Update `.env.local` with new password (URL-encode special characters)

### Step 3: Test Database Connection

```bash
# Test connection
npx prisma db pull --force
```

If successful, proceed to Step 4.

### Step 4: Run Migration

Once database connection works:

```bash
npx prisma migrate dev --name add_admin_user_model
```

This will:
- Create the `AdminUser` table
- Create the `AdminRole` enum
- Set up indexes

### Step 5: Create Admin User

```bash
npm run create-admin admin@extremedeptkidz.com "YourSecurePassword123!" "Admin Name"
```

Or use defaults:
```bash
npm run create-admin
# Creates: admin@extremedeptkidz.com / Admin123!
```

### Step 6: Test Login

1. Go to `/admin/login`
2. Use the credentials you created
3. You should be logged in with JWT authentication

## 🚨 If Database Still Won't Connect

### Option 1: Deploy to Vercel First

The connection might work in production:

1. **Commit your changes:**
   ```bash
   git add -A
   git commit -m "Add secure authentication system"
   git push origin main
   ```

2. **Add environment variables in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `DATABASE_URL` (from Supabase)
   - Add `JWT_SECRET` (the one generated above)
   - Add `JWT_EXPIRES_IN=7d`

3. **Run migration in Vercel:**
   - Use Vercel CLI: `vercel env pull`
   - Or run migration via Vercel's deployment logs
   - Or use Supabase SQL Editor to run migration manually

### Option 2: Use Supabase SQL Editor

If Prisma migrations don't work, create the table manually:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this SQL:

```sql
-- Create AdminRole enum
CREATE TYPE "AdminRole" AS ENUM ('super_admin', 'manager', 'editor');

-- Create AdminUser table
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'editor',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX "AdminUser_email_idx" ON "AdminUser"("email");
CREATE INDEX "AdminUser_role_idx" ON "AdminUser"("role");
```

3. Then run:
   ```bash
   npx prisma generate
   ```

### Option 3: Check Network/Firewall

- Try from a different network (mobile hotspot)
- Check if your firewall is blocking port 5432
- Some corporate networks block database connections

## ✅ Verification Checklist

- [ ] JWT_SECRET added to `.env.local`
- [ ] DATABASE_URL includes `?sslmode=require`
- [ ] Database connection test passes
- [ ] Migration completed successfully
- [ ] Admin user created
- [ ] Login works at `/admin/login`

## 📝 Manual .env.local Update

If you need to manually update `.env.local`, add:

```env
# Database (update if needed)
DATABASE_URL="postgresql://postgres:Zillion0031%21@db.puuszplmdbindiesfxlr.supabase.co:5432/postgres?sslmode=require"

# JWT Authentication
JWT_SECRET=790a5d8a66b3c8cb8d731945c0966fc506b82790a62128f8d326931cbe37917b
JWT_EXPIRES_IN=7d
```

## 🆘 Still Having Issues?

1. **Check Supabase Status**: Ensure project is not paused
2. **Verify Password**: Reset database password in Supabase if needed
3. **Try Connection Pooler**: Use port 6543 instead of 5432
4. **Check Prisma Logs**: Look for more detailed error messages
5. **Deploy to Vercel**: Connection often works better in production

---

**Next**: Once database connects, run the migration and create your admin user!
