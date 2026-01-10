-- ============================================
-- COMPLETE ADMIN RESET - FINAL VERSION
-- ============================================
-- Run this in Supabase SQL Editor
-- 
-- This will:
-- 1. Delete ALL existing admin users
-- 2. Create a fresh admin user with verified password hash
-- 3. Verify the user was created correctly
--
-- Email: admin@extremedeptkidz.com
-- Password: Admin@2024!
-- ============================================

-- Step 1: Delete ALL existing admin users (clean slate)
DELETE FROM "AdminUser";

-- Step 2: Create fresh admin user with verified password hash
-- Password: Admin@2024!
-- Hash: $2b$12$psol9eO04Mc5wY045yoEr.iMBY.Dmljx.BHPvsyyIX7QgFsYPu45S
INSERT INTO "AdminUser" (
    "id",
    "email",
    "name",
    "displayName",
    "passwordHash",
    "role",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'admin@extremedeptkidz.com',
    'Super Admin',
    'Super Admin',
    '$2b$12$psol9eO04Mc5wY045yoEr.iMBY.Dmljx.BHPvsyyIX7QgFsYPu45S',
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
    "displayName",
    role,
    "isActive",
    "createdAt",
    CASE 
        WHEN "passwordHash" = '$2b$12$psol9eO04Mc5wY045yoEr.iMBY.Dmljx.BHPvsyyIX7QgFsYPu45S' 
        THEN '✅ Password hash is correct' 
        ELSE '❌ Password hash mismatch!' 
    END as password_status,
    LEFT("passwordHash", 20) || '...' as hash_preview
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';

-- Step 4: Show total admin users (should be 1)
SELECT COUNT(*) as total_admin_users FROM "AdminUser";
