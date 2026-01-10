# 🔧 Fix: displayName Column Error

## The Problem

The error shows:
```
null value in column "displayName" of relation "AdminUser" violates not-null constraint
```

This means your `AdminUser` table has a `displayName` column that is **NOT NULL**, but our SQL wasn't including it.

## ✅ Fixed SQL Script

Use this updated SQL that includes the `displayName` column:

```sql
-- Delete ALL existing admin users
DELETE FROM "AdminUser";

-- Create fresh admin user (with displayName)
INSERT INTO "AdminUser" (
    "id",
    "email",
    "name",
    "displayName",  -- Added this field
    "passwordHash",
    "role",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'admin@extremedeptkidz.com',
    'Super Admin',
    'Super Admin',  -- displayName value (same as name)
    '$2b$12$4lkrd543.oWLDhd/bie1l.Tf0T7.OdjTqPzLhEc60s7JiDG4AHgxS',
    'super_admin',
    true,
    NOW(),
    NOW()
);

-- Verify it was created
SELECT id, email, name, "displayName", role, "isActive" 
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';
```

## 🔍 Check Your Table Structure

To see all columns in your AdminUser table, run:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'AdminUser'
ORDER BY ordinal_position;
```

This will show you all columns and whether they're nullable.

## 📋 New Admin Credentials

After running the fixed SQL:

- **Email:** `admin@extremedeptkidz.com`
- **Password:** `Admin@2024!`
- **Role:** `super_admin`

## ✅ Quick Fix Steps

1. **Go to Supabase SQL Editor**
2. **Copy the fixed SQL above**
3. **Run it**
4. **Verify** the user was created
5. **Test login** with new password

## 🆘 If You Have Other Required Columns

If you get errors about other missing columns:

1. **Check table structure** (SQL above)
2. **Add those columns** to the INSERT statement
3. **Provide default values** for required fields

The fixed SQL script is in `RESET_ADMIN_FIXED.sql` - use that one!
