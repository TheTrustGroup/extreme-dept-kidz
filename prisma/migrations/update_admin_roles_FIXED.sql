-- ============================================
-- Migration: Update AdminRole Enum (FIXED)
-- Date: Phase 1 - RBAC Implementation
-- ============================================
-- This migration updates the AdminRole enum to match context requirements:
-- - Adds 'admin' role
-- - Renames 'editor' to 'viewer'
-- - Maps existing 'editor' users to 'viewer'
-- ============================================
-- IMPORTANT: This migration must be run in order:
-- 1. Create new enum with all values
-- 2. Migrate data (map 'editor' to 'viewer' during conversion)
-- 3. Drop old enum
-- ============================================

-- Step 1: Create new enum type with all required values
DO $$ BEGIN
    CREATE TYPE "AdminRole_new" AS ENUM ('super_admin', 'admin', 'manager', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Remove the default constraint temporarily (if it exists)
-- This allows us to change the column type without default value conflicts
ALTER TABLE "AdminUser" 
  ALTER COLUMN role DROP DEFAULT;

-- Step 3: Alter the column to use new enum
-- This step maps 'editor' to 'viewer' during the conversion
ALTER TABLE "AdminUser" 
  ALTER COLUMN role TYPE "AdminRole_new" 
  USING CASE 
    WHEN role::text = 'editor' THEN 'viewer'::"AdminRole_new"
    WHEN role::text = 'super_admin' THEN 'super_admin'::"AdminRole_new"
    WHEN role::text = 'manager' THEN 'manager'::"AdminRole_new"
    WHEN role::text = 'admin' THEN 'admin'::"AdminRole_new"
    ELSE 'viewer'::"AdminRole_new"  -- Default fallback
  END;

-- Step 4: Set the new default value
ALTER TABLE "AdminUser" 
  ALTER COLUMN role SET DEFAULT 'viewer'::"AdminRole_new";

-- Step 5: Drop old enum (only if it exists and is different)
DO $$ 
BEGIN
    -- Check if old enum exists and drop it
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole' AND typname != 'AdminRole_new') THEN
        DROP TYPE "AdminRole";
    END IF;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- Step 6: Rename new enum to original name
ALTER TYPE "AdminRole_new" RENAME TO "AdminRole";

-- Step 7: Verify the migration
SELECT 
  role,
  COUNT(*) as user_count
FROM "AdminUser"
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'super_admin' THEN 4
    WHEN 'admin' THEN 3
    WHEN 'manager' THEN 2
    WHEN 'viewer' THEN 1
  END DESC;

-- Expected output:
-- - All 'editor' users should now be 'viewer'
-- - Enum should have: super_admin, admin, manager, viewer
