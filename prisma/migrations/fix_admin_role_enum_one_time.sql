-- ============================================
-- One-time fix: AdminRole_new vs AdminRole + cashier/warehouse/driver
-- ============================================
-- Run this in Supabase SQL Editor if creating/updating admin users fails with:
--   column "role" is of type "AdminRole_new" but expression is of type "AdminRole"
--
-- This script:
-- 1. Adds cashier, warehouse, driver to AdminRole_new (if that type exists).
-- 2. Adds cashier, warehouse, driver to AdminRole (if that type exists).
-- 3. Renames AdminRole_new to AdminRole so Prisma and the DB match.
-- ============================================

-- 1) Add new role values to AdminRole_new (if the type exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole_new') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'AdminRole_new' AND e.enumlabel = 'cashier') THEN
      ALTER TYPE "AdminRole_new" ADD VALUE 'cashier';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'AdminRole_new' AND e.enumlabel = 'warehouse') THEN
      ALTER TYPE "AdminRole_new" ADD VALUE 'warehouse';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'AdminRole_new' AND e.enumlabel = 'driver') THEN
      ALTER TYPE "AdminRole_new" ADD VALUE 'driver';
    END IF;
  END IF;
END $$;

-- 2) Add new role values to AdminRole (if the type exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'AdminRole' AND e.enumlabel = 'cashier') THEN
      ALTER TYPE "AdminRole" ADD VALUE 'cashier';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'AdminRole' AND e.enumlabel = 'warehouse') THEN
      ALTER TYPE "AdminRole" ADD VALUE 'warehouse';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'AdminRole' AND e.enumlabel = 'driver') THEN
      ALTER TYPE "AdminRole" ADD VALUE 'driver';
    END IF;
  END IF;
END $$;

-- 3) Migrate any columns that use "AdminRole" to "AdminRole_new" ONLY if AdminRole_new exists.
--    (If only "AdminRole" exists, skip this—step 2 already added the new values to AdminRole.)
--    e.g. AdminUser_backup.role and any other tables
DO $$
DECLARE
  r RECORD;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole_new') THEN
    RAISE NOTICE 'AdminRole_new does not exist; skipping column migration. AdminRole already has new values from step 2.';
    RETURN;
  END IF;
  FOR r IN
    SELECT c.table_schema, c.table_name, c.column_name
    FROM information_schema.columns c
    WHERE c.udt_name = 'AdminRole'
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ALTER COLUMN %I TYPE "AdminRole_new" USING %I::text::"AdminRole_new"',
      r.table_schema, r.table_name, r.column_name, r.column_name
    );
    RAISE NOTICE 'Migrated %.%.% to AdminRole_new', r.table_schema, r.table_name, r.column_name;
  END LOOP;
END $$;

-- 4) Align enum name: get to a single "AdminRole" type (so Prisma and DB match)
DO $$
DECLARE
  col_enum text;
BEGIN
  SELECT c.udt_name INTO col_enum
  FROM information_schema.columns c
  WHERE c.table_schema = 'public' AND c.table_name = 'AdminUser' AND c.column_name = 'role'
  LIMIT 1;

  IF col_enum = 'AdminRole_new' AND EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole_new') THEN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole') THEN
      DROP TYPE "AdminRole";
      RAISE NOTICE 'Dropped AdminRole type';
    END IF;
    ALTER TYPE "AdminRole_new" RENAME TO "AdminRole";
    RAISE NOTICE 'Renamed AdminRole_new to AdminRole';
  ELSIF col_enum = 'AdminRole' AND EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole_new') THEN
    DROP TYPE "AdminRole_new";
    RAISE NOTICE 'Dropped unused AdminRole_new type';
  ELSIF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole') AND EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole_new') THEN
    ALTER TYPE "AdminRole_new" RENAME TO "AdminRole";
    RAISE NOTICE 'Renamed AdminRole_new to AdminRole';
  END IF;
END $$;

-- Verify
SELECT typname FROM pg_type WHERE typname IN ('AdminRole', 'AdminRole_new');
