-- Add visibleOnStore: store admin can hide warehouse-only products from the website.
-- Default true so existing products remain visible.
-- Run with: npx prisma db execute --file prisma/migrations/add_visible_on_store/migration.sql
-- Or: psql $DATABASE_URL -f prisma/migrations/add_visible_on_store/migration.sql
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "visibleOnStore" BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS "Product_visibleOnStore_idx" ON "Product"("visibleOnStore");
