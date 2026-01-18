-- ============================================
-- Migration: Update AdminRole Enum (SAFE VERSION)
-- Date: Phase 1 - RBAC Implementation
-- ============================================
-- This migration safely updates the AdminRole enum to match context requirements:
-- - Adds 'admin' role
-- - Renames 'editor' to 'viewer'
-- - Maps existing 'editor' users to 'viewer'
-- ============================================
-- This version handles cases where the migration might have been partially run
-- ============================================

-- Step 1: Check current state and create new enum if needed
DO $$ 
BEGIN
    -- Check if new enum already exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole_new') THEN
        CREATE TYPE "AdminRole_new" AS ENUM ('super_admin', 'admin', 'manager', 'viewer');
        RAISE NOTICE 'Created AdminRole_new enum';
    ELSE
        RAISE NOTICE 'AdminRole_new enum already exists, skipping creation';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating AdminRole_new: %', SQLERRM;
END $$;

-- Step 2: Remove the default constraint temporarily (if it exists)
DO $$
BEGIN
    ALTER TABLE "AdminUser" ALTER COLUMN role DROP DEFAULT;
    RAISE NOTICE 'Dropped default constraint';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Default constraint may not exist: %', SQLERRM;
END $$;

-- Step 3: Check if column type needs to be changed
DO $$
BEGIN
    -- Check if column is already using AdminRole_new
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'AdminUser' 
        AND column_name = 'role' 
        AND udt_name != 'AdminRole_new'
    ) THEN
        -- Alter the column to use new enum
        ALTER TABLE "AdminUser" 
          ALTER COLUMN role TYPE "AdminRole_new" 
          USING CASE 
            WHEN role::text = 'editor' THEN 'viewer'::"AdminRole_new"
            WHEN role::text = 'super_admin' THEN 'super_admin'::"AdminRole_new"
            WHEN role::text = 'manager' THEN 'manager'::"AdminRole_new"
            WHEN role::text = 'admin' THEN 'admin'::"AdminRole_new"
            ELSE 'viewer'::"AdminRole_new"
          END;
        RAISE NOTICE 'Column type changed to AdminRole_new';
    ELSE
        RAISE NOTICE 'Column already uses AdminRole_new, skipping type change';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error changing column type: %', SQLERRM;
END $$;

-- Step 4: Set the new default value
DO $$
BEGIN
    ALTER TABLE "AdminUser" 
      ALTER COLUMN role SET DEFAULT 'viewer'::"AdminRole_new";
    RAISE NOTICE 'Set default value to viewer';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error setting default: %', SQLERRM;
END $$;

-- Step 5: Drop old enum if it exists and is different
DO $$ 
DECLARE
    old_enum_oid oid;
    new_enum_oid oid;
BEGIN
    -- Get OIDs of both enums
    SELECT oid INTO old_enum_oid FROM pg_type WHERE typname = 'AdminRole' LIMIT 1;
    SELECT oid INTO new_enum_oid FROM pg_type WHERE typname = 'AdminRole_new' LIMIT 1;
    
    -- Only drop if they're different and both exist
    IF old_enum_oid IS NOT NULL AND new_enum_oid IS NOT NULL AND old_enum_oid != new_enum_oid THEN
        -- Check if any columns are still using the old enum
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE udt_name = 'AdminRole' 
            AND table_name = 'AdminUser'
        ) THEN
            DROP TYPE "AdminRole";
            RAISE NOTICE 'Dropped old AdminRole enum';
        ELSE
            RAISE NOTICE 'Cannot drop AdminRole: still in use';
        END IF;
    ELSIF old_enum_oid IS NULL THEN
        RAISE NOTICE 'Old AdminRole enum does not exist';
    ELSIF old_enum_oid = new_enum_oid THEN
        RAISE NOTICE 'AdminRole and AdminRole_new are the same, nothing to drop';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping old enum: %', SQLERRM;
END $$;

-- Step 6: Rename new enum to original name (if needed)
DO $$
BEGIN
    -- Only rename if AdminRole_new exists and AdminRole doesn't exist
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole_new') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole') THEN
            ALTER TYPE "AdminRole_new" RENAME TO "AdminRole";
            RAISE NOTICE 'Renamed AdminRole_new to AdminRole';
        ELSE
            -- AdminRole already exists, check if we should drop AdminRole_new
            -- This means the migration was partially run
            DROP TYPE "AdminRole_new";
            RAISE NOTICE 'AdminRole already exists, dropped AdminRole_new';
        END IF;
    ELSE
        RAISE NOTICE 'AdminRole_new does not exist, nothing to rename';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error renaming enum: %', SQLERRM;
END $$;

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
