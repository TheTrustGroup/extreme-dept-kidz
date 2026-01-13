-- Create Admin User for Extreme Dept Kidz
-- Run this in Supabase SQL Editor

-- Delete existing admin user if it exists
DELETE FROM "AdminUser" WHERE email = 'admin@extremedeptkidz.com';

-- Create new admin user
-- Password: Admin@2024!
-- Password Hash: $2b$12$4lkrd543.oWLDhd/bie1l.Tf0T7.OdjTqPzLhEc60s7JiDG4AHgxS
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
  '$2b$12$4lkrd543.oWLDhd/bie1l.Tf0T7.OdjTqPzLhEc60s7JiDG4AHgxS',
  'super_admin',
  true,
  NOW(),
  NOW()
);

-- Verify the user was created
SELECT id, email, name, role, "isActive", "createdAt" 
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';
