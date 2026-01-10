-- Verify admin user was created
-- Run this in Supabase SQL Editor to check

SELECT 
    id,
    email,
    name,
    role,
    "isActive",
    "createdAt"
FROM "AdminUser" 
WHERE email = 'admin@extremedeptkidz.com';

-- Should return 1 row with your admin user details
