# Quick Cleanup Instructions

## Easiest Way: Run SQL Directly

Since we're having Prisma enum issues, the easiest way is to run SQL directly in Supabase:

### Step 1: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the SQL Script

1. Open the file: `prisma/migrations/CLEANUP_AND_CREATE_ADMIN_FINAL.sql`
2. Copy the **entire contents**
3. Paste into Supabase SQL Editor
4. Click **Run**

### Step 3: Verify

After running, you should see:
- 1 row returned
- Email: `info@extremedeptkidz.com`
- Role: `super_admin`

### Step 4: Login

1. Go to `/admin/login`
2. Email: `info@extremedeptkidz.com`
3. Password: `Admin123!@#`
4. **CHANGE PASSWORD IMMEDIATELY!**

---

## What the Script Does

1. ✅ Deletes ALL existing admin users
2. ✅ Creates fresh admin with `info@extremedeptkidz.com`
3. ✅ Sets password to `Admin123!@#`
4. ✅ Sets role to `super_admin`

---

## After Login

1. Change your password immediately
2. Test password reset flow
3. Everything is now fresh and clean!

---

**File to use:** `prisma/migrations/CLEANUP_AND_CREATE_ADMIN_FINAL.sql`
