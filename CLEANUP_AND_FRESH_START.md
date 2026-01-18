# 🧹 Cleanup and Fresh Start

## Overview

This will:
1. ✅ Delete ALL existing admin users
2. ✅ Create a fresh admin user with `info@extremedeptkidz.com`
3. ✅ Set up with `super_admin` role
4. ✅ Update email service to use your business email

---

## Quick Start

### Option 1: Run TypeScript Script (Recommended)

```bash
npm run cleanup-and-create-admin
```

This will:
- Delete all old admin users
- Create new admin with `info@extremedeptkidz.com`
- Set default password: `Admin123!@#`
- Show you the credentials

### Option 2: Run SQL Script

1. Open Supabase SQL Editor
2. Copy contents of `prisma/migrations/cleanup_and_create_admin.sql`
3. **IMPORTANT:** Generate a real password hash first (use the TypeScript script instead)

---

## Default Credentials

After running the script:

- **Email:** `info@extremedeptkidz.com`
- **Password:** `Admin123!@#`
- **Role:** `super_admin`

⚠️ **CHANGE THE PASSWORD IMMEDIATELY after first login!**

---

## What Gets Cleaned

- ✅ All existing admin users deleted
- ✅ All password reset tokens cleared
- ✅ Fresh start with one admin user

---

## After Running

1. **Go to:** `/admin/login`
2. **Login with:**
   - Email: `info@extremedeptkidz.com`
   - Password: `Admin123!@#`
3. **Change password** immediately in settings
4. **Test password reset** with your new email

---

## Email Service Updated

The email service now defaults to:
- **FROM_EMAIL:** `info@extremedeptkidz.com`

You can override this with `FROM_EMAIL` environment variable if needed.

---

## Verification

After running, verify:

```sql
SELECT email, name, role, "isActive" FROM "AdminUser";
```

Should show:
- 1 row
- Email: `info@extremedeptkidz.com`
- Role: `super_admin`
- Active: `true`

---

## Security Note

The default password `Admin123!@#` is temporary. Make sure to:
1. Change it immediately after first login
2. Use a strong password
3. Never share credentials

---

## Need Help?

If the script fails:
1. Check `DATABASE_URL is set
2. Check Prisma connection
3. Verify database migrations are run
4. Check console for error messages
