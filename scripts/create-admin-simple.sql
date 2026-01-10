-- Simple SQL script to create/update admin user
-- Run this in Supabase SQL Editor
-- Password: Admin123!

-- First, delete if exists (to start fresh)
DELETE FROM "AdminUser" WHERE email = 'admin@extremedeptkidz.com';

-- Create the admin user
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
    'admin@extremedeptkidz.com',
    'Super Admin',
    '$2b$12$wtqK18BM0YmSltWIL6cJ2.X7TfTc90q9w4Cu29FFBiGfLI0lRDg9G',
    'super_admin',
    true,
    NOW(),
    NOW()
);

-- Verify it was created
SELECT 
    id,
    email,
    name,
    role,
    "isActive",
    "createdAt",
    CASE 
        WHEN "passwordHash" IS NOT NULL THEN 'Hash is set'
        ELSE 'ERROR: No hash!'
    END as hash_status
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';
