-- Add tokenVersion field to AdminUser for session invalidation
-- This allows invalidating all user sessions when password or role changes

ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- Create index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS "AdminUser_tokenVersion_idx" ON "AdminUser"("tokenVersion");
