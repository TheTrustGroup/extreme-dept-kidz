-- Add visibleOnStore: store admin can hide warehouse-only products from the website.
-- Default true so existing products remain visible.
-- Run: set -a && source .env.local && set +a && psql "${DATABASE_URL%%\?*}" -f prisma/migrations/add_visible_on_store/migration.sql
-- Or in Supabase: SQL Editor → paste and run.
SET statement_timeout = '0';

-- Add column (fast)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "visibleOnStore" BOOLEAN NOT NULL DEFAULT true;

-- Create index (CONCURRENTLY avoids blocking; may take time on large tables)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Product_visibleOnStore_idx" ON "Product" ("visibleOnStore");
