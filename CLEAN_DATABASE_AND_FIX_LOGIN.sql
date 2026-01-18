-- ============================================
-- COMPREHENSIVE DATABASE CLEANUP AND ADMIN USER RESET
-- This script cleans errors, cache, and resets admin user
-- ============================================

-- Step 1: Clean up any duplicate or invalid admin users
-- Delete ALL existing admin users to start fresh
DELETE FROM "AdminUser";

-- Step 2: Clear any stale session data (if you have a sessions table)
-- Note: Adjust this if your session table has a different name
-- DELETE FROM "Session" WHERE "expiresAt" < NOW();

-- Step 3: Create a single, clean admin user with verified credentials
-- Email: Admin@extremedeptkidz.com
-- Password: VisionaryIntro
-- Hash: $2b$12$N46VhRKYCI/xyxFIB6tPhOH2U.yNv2AXGwm0UlTh/gC00v4FHOvTG
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
    'Admin@extremedeptkidz.com',
    'Super Admin',
    '$2b$12$N46VhRKYCI/xyxFIB6tPhOH2U.yNv2AXGwm0UlTh/gC00v4FHOvTG',
    'super_admin',
    true,
    NOW(),
    NOW()
);

-- Step 4: Verify the admin user was created correctly
SELECT 
    id,
    email,
    name,
    role,
    "isActive",
    "createdAt",
    CASE 
        WHEN "passwordHash" IS NOT NULL AND LENGTH("passwordHash") > 20 THEN '✅ Hash is set'
        ELSE '❌ ERROR: Hash missing!'
    END as hash_status,
    CASE 
        WHEN "isActive" = true THEN '✅ Active'
        ELSE '❌ Inactive'
    END as status
FROM "AdminUser" 
WHERE email = 'Admin@extremedeptkidz.com';

-- Step 5: Check for any other admin users (should be none)
SELECT 
    COUNT(*) as total_admin_users,
    COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_users
FROM "AdminUser";

-- ============================================
-- VERIFICATION CHECKLIST
-- ============================================
-- After running this script, verify:
-- 1. Only ONE admin user exists
-- 2. Email is exactly: Admin@extremedeptkidz.com
-- 3. Role is: super_admin
-- 4. isActive is: true
-- 5. passwordHash is set (length > 20)
-- ============================================
