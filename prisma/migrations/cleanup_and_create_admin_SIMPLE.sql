-- ============================================
-- Cleanup and Create Fresh Admin User
-- ============================================
-- Run this in Supabase SQL Editor
-- This will delete all admin users and create a fresh one
-- ============================================

-- Step 1: Delete all existing admin users
DELETE FROM "AdminUser";

-- Step 2: Create fresh admin user
-- Password: Admin123!@#
-- Password hash generated with bcrypt (12 rounds)
INSERT INTO "AdminUser" (
  "email",
  "name",
  "passwordHash",
  "role",
  "isActive"
) VALUES (
  'info@extremedeptkidz.com',
  'Admin User',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJ5q5q5qO', -- This is a placeholder - you need a real hash
  'super_admin'::"AdminRole_new", -- Use the enum type that exists in your database
  true
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

-- ============================================
-- NOTE: The password hash above is a PLACEHOLDER
-- You need to generate a real bcrypt hash for "Admin123!@#"
-- 
-- To get the real hash, run this first:
-- npm run generate-hash Admin123!@#
-- 
-- Then replace the passwordHash value above with the output
-- ============================================
