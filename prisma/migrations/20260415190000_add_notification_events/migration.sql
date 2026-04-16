-- Create notification enums
DO $$ BEGIN
  CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationEventType" AS ENUM ('ORDER_CONFIRMATION', 'ADMIN_NEW_ORDER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'RETRYING', 'FAILED', 'SENT', 'DEAD');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create queue table
CREATE TABLE IF NOT EXISTS "NotificationEvent" (
  "id" TEXT NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "eventType" "NotificationEventType" NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 5,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payload" JSONB NOT NULL,
  "metadata" JSONB,
  "lastError" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NotificationEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "NotificationEvent_channel_status_nextAttemptAt_idx"
  ON "NotificationEvent"("channel", "status", "nextAttemptAt");
CREATE INDEX IF NOT EXISTS "NotificationEvent_createdAt_idx"
  ON "NotificationEvent"("createdAt");
