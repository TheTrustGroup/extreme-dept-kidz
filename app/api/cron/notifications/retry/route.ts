import { NextRequest, NextResponse } from "next/server";
import {
  getNotificationQueueMetrics,
  processNotificationEmailQueue,
} from "@/lib/services/notification-queue.service";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const configuredSecret = process.env.CRON_SECRET?.trim();
  if (!configuredSecret) return false;

  const bearer = request.headers.get("authorization");
  if (bearer && bearer.startsWith("Bearer ")) {
    return bearer.slice("Bearer ".length).trim() === configuredSecret;
  }

  const headerSecret = request.headers.get("x-cron-secret");
  return headerSecret?.trim() === configuredSecret;
}

export async function POST(request: NextRequest): Promise<Response> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processNotificationEmailQueue(50);
    const queue = await getNotificationQueueMetrics();
    return NextResponse.json({
      ok: true,
      result,
      queue,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("[Cron Notifications] Retry run failed", error);
    return NextResponse.json(
      { ok: false, error: "Notification retry run failed" },
      { status: 500 }
    );
  }
}
