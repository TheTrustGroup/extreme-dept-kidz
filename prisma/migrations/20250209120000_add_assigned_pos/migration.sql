-- Add AssignedPos enum and assignedPos column to AdminUser (POS access: Main Town or Store)
-- Safe to run: creates enum and column only if they don't exist.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AssignedPos') THEN
    CREATE TYPE "AssignedPos" AS ENUM ('main_town', 'store');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'AdminUser' AND column_name = 'assignedPos'
  ) THEN
    ALTER TABLE "AdminUser" ADD COLUMN "assignedPos" "AssignedPos" NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "AdminUser_assignedPos_idx" ON "AdminUser"("assignedPos");
