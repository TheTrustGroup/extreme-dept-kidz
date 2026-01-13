-- Fix Admin User Password Hash
-- Run this in Supabase SQL Editor to update the password hash

-- Update the password hash for the existing admin user
-- Password: Admin@2024!
-- Fresh hash generated: $2b$12$WTChcCkrs0xi3JAZPCAx2euM/zi2zGzjm0/AQ3thCV3eCZGpu7lCy

UPDATE "AdminUser"
SET 
  "passwordHash" = '$2b$12$WTChcCkrs0xi3JAZPCAx2euM/zi2zGzjm0/AQ3thCV3eCZGpu7lCy',
  "updatedAt" = NOW()
WHERE email = 'admin@extremedeptkidz.com';

-- Verify the update
SELECT 
  id,
  email,
  name,
  role,
  "isActive",
  LEFT("passwordHash", 30) || '...' as hash_preview,
  "updatedAt"
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';
