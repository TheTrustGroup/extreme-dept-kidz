-- ============================================
-- Migration: Update AdminRole Enum (FINAL - RUN ALL AT ONCE)
-- Date: Phase 1 - RBAC Implementation
-- ============================================
-- This migration updates AdminRole enum: adds 'admin', maps 'editor' to 'viewer'
-- Safe to run all at once - includes error handling
-- ============================================

-- Step 1: Create new enum (skip if already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole_new') THEN
        CREATE TYPE "AdminRole_new" AS ENUM ('super_admin', 'admin', 'manager', 'viewer');
    END IF;
END $$;

-- Step 2: Drop default constraint (ignore error if doesn't exist)
DO $$
BEGIN
    ALTER TABLE "AdminUser" ALTER COLUMN role DROP DEFAULT;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Step 3: Change column type (maps 'editor' to 'viewer')
ALTER TABLE "AdminUser" 
  ALTER COLUMN role TYPE "AdminRole_new" 
  USING CASE 
    WHEN role::text = 'editor' THEN 'viewer'::"AdminRole_new"
    WHEN role::text = 'super_admin' THEN 'super_admin'::"AdminRole_new"
    WHEN role::text = 'manager' THEN 'manager'::"AdminRole_new"
    WHEN role::text = 'admin' THEN 'admin'::"AdminRole_new"
    ELSE 'viewer'::"AdminRole_new"
  END;

-- Step 4: Set new default
ALTER TABLE "AdminUser" 
  ALTER COLUMN role SET DEFAULT 'viewer'::"AdminRole_new";

-- Step 5: Drop old enum (only if column is using new one)
DO $$
BEGIN
    -- Only drop if column is using AdminRole_new
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'AdminUser' 
        AND column_name = 'role' 
        AND udt_name = 'AdminRole_new'
    ) THEN
        -- Check if old enum exists and drop it
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole') THEN
            DROP TYPE "AdminRole";
        END IF;
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Step 6: Rename new enum to original name
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole_new') THEN
        ALTER TYPE "AdminRole_new" RENAME TO "AdminRole";
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Step 7: Verify migration
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
