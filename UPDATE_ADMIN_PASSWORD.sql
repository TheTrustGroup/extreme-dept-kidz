-- Update Admin User Password
-- Password: Admin@2024!
-- Run this in Supabase SQL Editor

UPDATE "AdminUser"
SET 
    "passwordHash" = '$2b$12$rJlT2lieZdPz9tFSIfxbdOirU3FwEuzwvmuC3XO.MkbErd9yb1neO',
    "updatedAt" = NOW()
WHERE email = 'admin@extremedeptkidz.com';

-- Verify the update
SELECT 
    id,
    email,
    name,
    role,
    "isActive",
    "updatedAt",
    CASE 
        WHEN "passwordHash" = '$2b$12$rJlT2lieZdPz9tFSIfxbdOirU3FwEuzwvmuC3XO.MkbErd9yb1neO' 
        THEN 'Password updated ✅' 
        ELSE 'Password NOT updated ❌' 
    END as update_status
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';
