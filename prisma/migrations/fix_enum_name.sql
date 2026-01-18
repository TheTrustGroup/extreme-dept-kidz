-- ============================================
-- Fix Enum Name: AdminRole_new → AdminRole
-- ============================================
-- This fixes the enum name if it's still "AdminRole_new"
-- Run this in Supabase SQL Editor if needed
-- ============================================

-- Check current enum name
SELECT typname FROM pg_type WHERE typname IN ('AdminRole', 'AdminRole_new');

-- If AdminRole_new exists but AdminRole doesn't, rename it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole_new') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole') THEN
            ALTER TYPE "AdminRole_new" RENAME TO "AdminRole";
            RAISE NOTICE 'Renamed AdminRole_new to AdminRole';
        ELSE
            -- Both exist, drop the new one
            DROP TYPE "AdminRole_new";
            RAISE NOTICE 'Dropped AdminRole_new (AdminRole already exists)';
        END IF;
    END IF;
END $$;

-- Verify
SELECT typname FROM pg_type WHERE typname = 'AdminRole';
