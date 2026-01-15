-- ============================================
-- UPDATE ADMIN USER - RUN THIS NOW
-- Email: Admin@extremedeptkidz.com
-- Password: VisionaryIntro
-- Hash: VERIFIED and tested
-- ============================================

-- Delete ALL existing admin users
DELETE FROM "AdminUser";

-- Create new admin user with CORRECT credentials
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
    'Admin@extremedeptkidz.com',
    'Super Admin',
    'Super Admin',
    '$2b$12$N46VhRKYCI/xyxFIB6tPhOH2U.yNv2AXGwm0UlTh/gC00v4FHOvTG',
    'super_admin',
    true,
    NOW(),
    NOW()
);

-- Verify the user was created
SELECT 
    id,
    email,
    name,
    role,
    "isActive",
    CASE 
        WHEN "passwordHash" IS NOT NULL AND LENGTH("passwordHash") > 20 THEN '✅ Hash is set'
        ELSE '❌ ERROR: Hash missing!'
    END as hash_status
FROM "AdminUser" 
WHERE email = 'Admin@extremedeptkidz.com';
