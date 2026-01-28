-- ============================================
-- SETUP ADMIN USER - FINAL
-- Email: info@extremedeptkidz.com
-- Password: Admin123!@#
-- Hash: $2b$12$s/.wkxMnWYjiSwRLNs8Eg.mEvmAo9KJZCng51gIYoXLQ.XA9t0.Iu
-- ============================================

-- Step 1: Delete ALL existing admin users (clean slate)
DELETE FROM "AdminUser";

-- Step 2: Create new admin user with correct credentials
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
    'info@extremedeptkidz.com',
    'Admin User',
    '$2b$12$s/.wkxMnWYjiSwRLNs8Eg.mEvmAo9KJZCng51gIYoXLQ.XA9t0.Iu',
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
        WHEN "passwordHash" IS NOT NULL AND LENGTH("passwordHash") > 20 THEN '✅ Hash is set'
        ELSE '❌ ERROR: Hash missing!'
    END as hash_status
FROM "AdminUser" 
WHERE email = 'info@extremedeptkidz.com';

-- Step 4: Show all admin users (should be only one)
SELECT 
    id,
    email,
    name,
    role,
    "isActive",
    "createdAt"
FROM "AdminUser"
ORDER BY "createdAt" DESC;
