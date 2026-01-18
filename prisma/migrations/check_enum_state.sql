-- ============================================
-- Diagnostic: Check Current Enum State
-- ============================================
-- Run this first to see what state your database is in
-- ============================================

-- Check what enum types exist
SELECT 
    typname as enum_name,
    oid,
    typtype
FROM pg_type 
WHERE typname IN ('AdminRole', 'AdminRole_new')
ORDER BY typname;

-- Check what values are in AdminRole enum (if it exists)
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'AdminRole'
ORDER BY e.enumsortorder;

-- Check what the AdminUser.role column is using
SELECT 
    column_name,
    udt_name as current_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'AdminUser' 
AND column_name = 'role';

-- Check current user roles
SELECT 
    role,
    COUNT(*) as user_count
FROM "AdminUser"
GROUP BY role
ORDER BY role;
