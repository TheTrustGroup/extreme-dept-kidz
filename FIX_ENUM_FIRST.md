# Fix Enum Name First

## Issue

The database enum is still named `AdminRole_new` instead of `AdminRole`. This needs to be fixed first.

## Quick Fix

Run this SQL in Supabase SQL Editor:

```sql
-- Fix enum name if it's still AdminRole_new
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole_new') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole') THEN
            ALTER TYPE "AdminRole_new" RENAME TO "AdminRole";
            RAISE NOTICE '✅ Renamed AdminRole_new to AdminRole';
        ELSE
            DROP TYPE "AdminRole_new";
            RAISE NOTICE '✅ Dropped AdminRole_new (AdminRole already exists)';
        END IF;
    END IF;
END $$;

-- Verify
SELECT typname FROM pg_type WHERE typname = 'AdminRole';
```

After running this, the cleanup script should work!
