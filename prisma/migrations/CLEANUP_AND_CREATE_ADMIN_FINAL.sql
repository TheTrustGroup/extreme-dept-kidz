-- ============================================
-- Cleanup and Create Fresh Admin User
-- ============================================
-- Run this ENTIRE script in Supabase SQL Editor
-- This will delete all admin users and create a fresh one
-- ============================================

-- Step 1: Delete all existing admin users
DELETE FROM "AdminUser";

-- Step 2: Create fresh admin user
-- Email: info@extremedeptkidz.com
-- Password: Admin123!@#
-- Role: super_admin
INSERT INTO "AdminUser" (
  "id",
  "email",
  "name",
  "displayName",
  "passwordHash",
  "role",
  "isActive"
) VALUES (
  gen_random_uuid()::text, -- Generate a unique ID
  'info@extremedeptkidz.com',
  'Admin User',
  'Admin User', -- displayName (required by database)
  '$2b$12$omWjYMjHDJQjXXUmdLbaJurfV/bpCSpG/E4xNhgp1Q2mONgXLGoTa',
  'super_admin'::"AdminRole_new", -- Cast to the enum type in your database
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

-- Expected result: 1 row with info@extremedeptkidz.com

-- ============================================
-- Login Credentials:
-- Email: info@extremedeptkidz.com
-- Password: Admin123!@#
-- 
-- ⚠️ CHANGE THIS PASSWORD IMMEDIATELY after first login!
-- ============================================
