-- Fix Admin User Password Hash - FINAL VERSION
-- This will work regardless of existing data

-- First, check what exists
SELECT id, email, name, role, "isActive" 
FROM "AdminUser" 
WHERE email ILIKE '%admin%extremedeptkidz%';

-- Delete ALL admin users to start fresh
DELETE FROM "AdminUser" WHERE email ILIKE '%admin%extremedeptkidz%';

-- Create admin user with correct password hash
-- Password: Admin@2024!
-- Hash: $2b$12$WTChcCkrs0xi3JAZPCAx2euM/zi2zGzjm0/AQ3thCV3eCZGpu7lCy
INSERT INTO "AdminUser" (
  id,
  email,
  name,
  "displayName",
  "passwordHash",
  role,
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@extremedeptkidz.com',
  'Super Admin',
  'Super Admin',
  '$2b$12$WTChcCkrs0xi3JAZPCAx2euM/zi2zGzjm0/AQ3thCV3eCZGpu7lCy',
  'super_admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  "name" = EXCLUDED."name",
  "displayName" = EXCLUDED."displayName",
  "role" = EXCLUDED."role",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Verify the user was created/updated
SELECT 
  id,
  email,
  name,
  role,
  "isActive",
  LEFT("passwordHash", 30) || '...' as hash_preview,
  "createdAt",
  "updatedAt"
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';
