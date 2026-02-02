-- Add cashier, warehouse, driver to AdminRole enum (RBAC / Create User)
-- Safe to run: only adds values if they don't exist.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'AdminRole' AND e.enumlabel = 'cashier'
  ) THEN
    ALTER TYPE "AdminRole" ADD VALUE 'cashier';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'AdminRole' AND e.enumlabel = 'warehouse'
  ) THEN
    ALTER TYPE "AdminRole" ADD VALUE 'warehouse';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'AdminRole' AND e.enumlabel = 'driver'
  ) THEN
    ALTER TYPE "AdminRole" ADD VALUE 'driver';
  END IF;
END $$;
