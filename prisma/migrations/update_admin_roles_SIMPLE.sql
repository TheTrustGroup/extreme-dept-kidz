-- ============================================
-- Migration: Update AdminRole Enum (SIMPLE VERSION)
-- Date: Phase 1 - RBAC Implementation
-- ============================================
-- This is a simpler, step-by-step migration that you can run
-- one section at a time if needed.
-- ============================================

-- ============================================
-- STEP 1: Check current state (run this first!)
-- ============================================
-- Uncomment to see current state:
/*
SELECT typname, oid FROM pg_type WHERE typname IN ('AdminRole', 'AdminRole_new');
SELECT column_name, udt_name FROM information_schema.columns WHERE table_name = 'AdminUser' AND column_name = 'role';
*/

-- ============================================
-- STEP 2: Create new enum (run this)
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole_new') THEN
        CREATE TYPE "AdminRole_new" AS ENUM ('super_admin', 'admin', 'manager', 'viewer');
        RAISE NOTICE '✅ Created AdminRole_new enum';
    ELSE
        RAISE NOTICE '⚠️ AdminRole_new already exists';
    END IF;
END $$;

-- ============================================
-- STEP 3: Drop default constraint (run this)
-- ============================================
ALTER TABLE "AdminUser" ALTER COLUMN role DROP DEFAULT;

-- ============================================
-- STEP 4: Change column type (run this)
-- ============================================
-- This maps 'editor' to 'viewer' during conversion
ALTER TABLE "AdminUser" 
  ALTER COLUMN role TYPE "AdminRole_new" 
  USING CASE 
    WHEN role::text = 'editor' THEN 'viewer'::"AdminRole_new"
    WHEN role::text = 'super_admin' THEN 'super_admin'::"AdminRole_new"
    WHEN role::text = 'manager' THEN 'manager'::"AdminRole_new"
    WHEN role::text = 'admin' THEN 'admin'::"AdminRole_new"
    ELSE 'viewer'::"AdminRole_new"
  END;

-- ============================================
-- STEP 5: Set new default (run this)
-- ============================================
ALTER TABLE "AdminUser" 
  ALTER COLUMN role SET DEFAULT 'viewer'::"AdminRole_new";

-- ============================================
-- STEP 6: Drop old enum ONLY if column is not using it (run this)
-- ============================================
-- First, verify the column is using AdminRole_new:
-- SELECT udt_name FROM information_schema.columns WHERE table_name = 'AdminUser' AND column_name = 'role';
-- If it shows 'AdminRole_new', then you can safely drop the old one:

DO $$
BEGIN
    -- Check if column is using AdminRole_new
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'AdminUser' 
        AND column_name = 'role' 
        AND udt_name = 'AdminRole_new'
    ) THEN
        -- Column is using new enum, safe to drop old one
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole') THEN
            DROP TYPE "AdminRole";
            RAISE NOTICE '✅ Dropped old AdminRole enum';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ Column is not using AdminRole_new yet! Do not drop AdminRole!';
    END IF;
END $$;

-- ============================================
-- STEP 7: Rename new enum (run this)
-- ============================================
ALTER TYPE "AdminRole_new" RENAME TO "AdminRole";

-- ============================================
-- STEP 8: Verify (run this to check)
-- ============================================
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
