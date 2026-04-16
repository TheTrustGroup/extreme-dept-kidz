import { NextRequest, NextResponse } from "next/server";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { withCors } from "@/lib/utils/cors";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import {
  getNotificationQueueMetrics,
  processNotificationEmailQueue,
} from "@/lib/services/notification-queue.service";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, ["manager"]);
  if (auth.error) return withCors(request, auth.error);
  if (!auth.authorized) {
    return withCors(
      request,
      NextResponse.json(
        { error: "Insufficient permissions. Manager role required." },
        { status: 403 }
      )
    );
  }

  try {
    const metrics = await getNotificationQueueMetrics();
    return withCors(request, apiSuccess({ queue: metrics }, "Notification queue metrics"));
  } catch (error) {
    logger.error("[Admin Notifications] Failed to fetch metrics", error);
    return withCors(
      request,
      apiError("Failed to fetch notification queue metrics", 500, error instanceof Error ? error.message : undefined)
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, ["manager"]);
  if (auth.error) return withCors(request, auth.error);
  if (!auth.authorized) {
    return withCors(
      request,
      NextResponse.json(
        { error: "Insufficient permissions. Manager role required." },
        { status: 403 }
      )
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { limit?: number };
    const limit = typeof body.limit === "number" ? body.limit : 25;
    const result = await processNotificationEmailQueue(limit);
    const queue = await getNotificationQueueMetrics();

    return withCors(
      request,
      apiSuccess(
        { result, queue },
        "Notification retry run completed"
      )
    );
  } catch (error) {
    logger.error("[Admin Notifications] Retry run failed", error);
    return withCors(
      request,
      apiError("Failed to process notification retry queue", 500, error instanceof Error ? error.message : undefined)
    );
  }
}
