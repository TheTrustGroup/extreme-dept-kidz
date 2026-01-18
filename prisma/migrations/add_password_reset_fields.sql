-- ============================================
-- Migration: Add Password Reset Fields
-- Date: Phase 2 - Password Reset Implementation
-- ============================================
-- This migration adds password reset fields to AdminUser table
-- ============================================

-- Add password reset fields
ALTER TABLE "AdminUser"
ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT,
ADD COLUMN IF NOT EXISTS "passwordResetExpiresAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "passwordResetRequestedAt" TIMESTAMP;

-- Create index on reset token for faster lookups
CREATE INDEX IF NOT EXISTS "AdminUser_passwordResetToken_idx" 
ON "AdminUser"("passwordResetToken")
WHERE "passwordResetToken" IS NOT NULL;

-- Verify the migration
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'AdminUser'
  AND column_name IN ('passwordResetToken', 'passwordResetExpiresAt', 'passwordResetRequestedAt')
ORDER BY column_name;

-- Expected output: 3 rows showing the new columns
