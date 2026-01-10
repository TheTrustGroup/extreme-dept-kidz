-- Manual migration for AdminUser table
-- Run this in Supabase SQL Editor if Prisma migration doesn't work

-- Create AdminRole enum
DO $$ BEGIN
    CREATE TYPE "AdminRole" AS ENUM ('super_admin', 'manager', 'editor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create AdminUser table
CREATE TABLE IF NOT EXISTS "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'editor',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX IF NOT EXISTS "AdminUser_email_idx" ON "AdminUser"("email");
CREATE INDEX IF NOT EXISTS "AdminUser_role_idx" ON "AdminUser"("role");
