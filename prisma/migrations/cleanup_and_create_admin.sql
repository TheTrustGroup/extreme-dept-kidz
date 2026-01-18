-- ============================================
-- Cleanup and Create Fresh Admin User
-- ============================================
-- This script:
-- 1. Deletes ALL existing admin users
-- 2. Creates a fresh admin user with info@extremedeptkidz.com
-- 3. Sets up with super_admin role
-- ============================================
-- IMPORTANT: Change the password after first login!
-- ============================================

-- Step 1: Delete all existing admin users
DELETE FROM "AdminUser";

-- Step 2: Create fresh admin user
-- Password: Admin123!@# (CHANGE THIS AFTER FIRST LOGIN!)
-- Password hash is for: Admin123!@#
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
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJ5q5q5qO', -- This is a placeholder - you need to generate a real hash
  'super_admin',
  true,
  NOW(),
  NOW()
);

-- Step 3: Verify
SELECT 
  id,
  email,
  name,
  role,
  "isActive",
  "createdAt"
FROM "AdminUser";

-- Expected: 1 row with info@extremedeptkidz.com

-- ============================================
-- NOTE: The password hash above is a PLACEHOLDER
-- You need to generate a real bcrypt hash for "Admin123!@#"
-- Use the TypeScript script instead: npx tsx scripts/cleanup-and-create-admin.ts
-- ============================================
