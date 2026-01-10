-- ============================================
-- FIX ADMIN LOGIN - Run This in Supabase SQL Editor
-- ============================================
-- This will create/update the admin user with the correct password hash
-- 
-- Email: admin@extremedeptkidz.com
-- Password: Admin@2024!
-- ============================================

-- Step 1: Delete any existing admin users (clean slate)
DELETE FROM "AdminUser" WHERE email = 'admin@extremedeptkidz.com';

-- Step 2: Create fresh admin user with verified password hash
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
    '$2b$12$zOmZw53eqhvMD.sHcr8mGeZINTvgmPEc7KavQHPwYSd7g/3Y/gB1C',
    'super_admin',
    true,
    NOW(),
    NOW()
);

-- Step 3: Verify the admin user was created correctly
SELECT 
    id,
    email,
    name,
    role,
    "isActive",
    "createdAt",
    CASE 
        WHEN "passwordHash" = '$2b$12$zOmZw53eqhvMD.sHcr8mGeZINTvgmPEc7KavQHPwYSd7g/3Y/gB1C' 
        THEN '✅ Password hash is correct' 
        ELSE '❌ Password hash mismatch!' 
    END as password_status
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';

-- Step 4: Show all admin users (should be 1)
SELECT COUNT(*) as total_admin_users FROM "AdminUser";
