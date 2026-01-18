-- ============================================
-- Cleanup and Create Fresh Admin User (SQL Version)
-- ============================================
-- Run this in Supabase SQL Editor
-- This will delete all admin users and create a fresh one
-- ============================================

-- Step 1: Delete all existing admin users
DELETE FROM "AdminUser";

-- Step 2: Generate password hash for "Admin123!@#"
-- You need to generate this using: npm run generate-hash Admin123!@#
-- Or use the TypeScript script which does it automatically

-- Step 3: Create fresh admin user
-- NOTE: Replace the passwordHash below with a real bcrypt hash
-- The script will generate this automatically, but for SQL you need to provide it
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
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJ5q5q5qO', -- PLACEHOLDER - replace with real hash
  'super_admin'::"AdminRole", -- Cast to enum type
  true,
  NOW(),
  NOW()
);

-- Step 4: Verify
SELECT 
  id,
  email,
  name,
  role,
  "isActive",
  "createdAt"
FROM "AdminUser";

-- ============================================
-- BETTER: Use the TypeScript script instead:
-- npm run cleanup-and-create-admin
-- It generates the password hash automatically
-- ============================================
