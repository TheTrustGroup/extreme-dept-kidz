-- ============================================
-- Migration: Add Admin Activity Logging
-- Date: Phase 3 - Activity Logging Implementation
-- ============================================
-- This migration creates the AdminActivityLog table for audit trails
-- ============================================

-- Create AdminActivityLog table
CREATE TABLE IF NOT EXISTS "AdminActivityLog" (
  "id" TEXT NOT NULL,
  "adminUserId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "resource" TEXT,
  "resourceId" TEXT,
  "details" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AdminActivityLog_pkey" PRIMARY KEY ("id")
);

-- Create foreign key to AdminUser
ALTER TABLE "AdminActivityLog"
ADD CONSTRAINT "AdminActivityLog_adminUserId_fkey"
FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "AdminActivityLog_adminUserId_idx" ON "AdminActivityLog"("adminUserId");
CREATE INDEX IF NOT EXISTS "AdminActivityLog_action_idx" ON "AdminActivityLog"("action");
CREATE INDEX IF NOT EXISTS "AdminActivityLog_resource_idx" ON "AdminActivityLog"("resource");
CREATE INDEX IF NOT EXISTS "AdminActivityLog_resourceId_idx" ON "AdminActivityLog"("resourceId");
CREATE INDEX IF NOT EXISTS "AdminActivityLog_createdAt_idx" ON "AdminActivityLog"("createdAt");

-- Composite index for common queries (user + date range)
CREATE INDEX IF NOT EXISTS "AdminActivityLog_adminUserId_createdAt_idx" 
ON "AdminActivityLog"("adminUserId", "createdAt" DESC);

-- Verify the migration
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'AdminActivityLog'
ORDER BY ordinal_position;

-- Expected output: 9 columns showing the table structure
