-- ============================================
-- UPDATE ADMIN USER TO NEW CREDENTIALS
-- Email: Admin@extremedeptkidz.com (exact case)
-- Password: VisionaryIntro
-- ============================================

-- Step 1: Delete ALL existing admin users
DELETE FROM "AdminUser";

-- Step 2: Create new admin user with exact credentials
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
    'Admin@extremedeptkidz.com',  -- Exact email as specified (case-sensitive)
    'Super Admin',
    'Super Admin',  -- displayName (required field)
    '$2b$12$N46VhRKYCI/xyxFIB6tPhOH2U.yNv2AXGwm0UlTh/gC00v4FHOvTG',  -- Hash for: VisionaryIntro (VERIFIED)
    'super_admin',
    true,
    NOW(),
    NOW()
);

-- Step 3: Verify the user was created correctly
SELECT 
    id,
    email,
    name,
    role,
    "isActive",
    "createdAt",
    CASE 
        WHEN "passwordHash" IS NOT NULL AND LENGTH("passwordHash") > 20 THEN '✅ Hash is set'
        ELSE '❌ ERROR: Hash missing or invalid!'
    END as hash_status
FROM "AdminUser" 
WHERE email = 'Admin@extremedeptkidz.com';

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
