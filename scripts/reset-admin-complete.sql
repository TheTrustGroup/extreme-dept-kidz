-- Complete Admin Reset Script
-- Run this in Supabase SQL Editor to reset all admin users and create a fresh one
-- New Password: Admin@2024!

-- Step 1: Delete ALL existing admin users
DELETE FROM "AdminUser";

-- Step 2: Create fresh admin user with new password
-- Password: Admin@2024!
-- Hash will be generated below - replace with the hash from npm run generate-hash
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
    'REPLACE_WITH_NEW_HASH',  -- Replace this with the hash from npm run generate-hash
    'super_admin',
    true,
    NOW(),
    NOW()
);

-- Step 3: Verify the new admin user was created
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

-- Step 4: Show all admin users (should only be one)
SELECT COUNT(*) as total_admin_users FROM "AdminUser";
