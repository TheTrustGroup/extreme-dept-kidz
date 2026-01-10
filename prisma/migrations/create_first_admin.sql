-- Create first admin user
-- Run this in Supabase SQL Editor

-- Password: Admin123!
-- Hash: $2b$12$gncCYWjmDMlxySOcf.bvvuLZbMwlCY02ogKo7CVu6AOKaRNghgsdO

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
    'admin-1',
    'admin@extremedeptkidz.com',
    'Super Admin',
    '$2b$12$gncCYWjmDMlxySOcf.bvvuLZbMwlCY02ogKo7CVu6AOKaRNghgsdO',
    'super_admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT ("email") DO UPDATE SET
    "name" = EXCLUDED."name",
    "passwordHash" = EXCLUDED."passwordHash",
    "role" = EXCLUDED."role",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = NOW();

-- Verify the user was created
SELECT id, email, name, role, "isActive" FROM "AdminUser" WHERE email = 'admin@extremedeptkidz.com';
