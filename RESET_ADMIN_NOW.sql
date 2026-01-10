-- ============================================
-- COMPLETE ADMIN RESET - Run This in Supabase
-- ============================================
-- This script will:
-- 1. Delete ALL existing admin users
-- 2. Create a fresh admin user with new password
-- 3. Verify the new user was created
--
-- New Password: Admin@2024!
-- Email: admin@extremedeptkidz.com
-- ============================================

-- Step 1: Delete ALL existing admin users
DELETE FROM "AdminUser";

-- Step 2: Create fresh admin user
INSERT INTO "AdminUser" (
    "id",
    "email",
    "name",
    "passwordHash",
    "role",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'admin@extremedeptkidz.com',
    'Super Admin',
    '$2b$12$4lkrd543.oWLDhd/bie1l.Tf0T7.OdjTqPzLhEc60s7JiDG4AHgxS',
    'super_admin',
    true,
    NOW(),
    NOW()
);

-- Step 3: Verify the new admin user
SELECT 
    id,
    email,
    name,
    role,
    "isActive",
    "createdAt",
    CASE 
        WHEN "passwordHash" IS NOT NULL THEN 'Hash is set ✅'
        ELSE 'ERROR: No hash! ❌'
    END as hash_status
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';

-- Step 4: Show total admin users (should be 1)
SELECT COUNT(*) as total_admin_users FROM "AdminUser";
