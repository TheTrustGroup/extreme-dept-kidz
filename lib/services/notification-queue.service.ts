import { prisma } from "@/lib/db/prisma";
import {
  buildAdminNewOrderEmail,
  buildOrderConfirmationEmail,
  type AdminNewOrderEmailParams,
  type OrderConfirmationEmailParams,
  sendEmail,
} from "@/lib/services/email.service";
import { logger } from "@/lib/utils/logger";
import type { Prisma } from "@prisma/client";

type NotificationEventType = "ORDER_CONFIRMATION" | "ADMIN_NEW_ORDER";
type NotificationStatus = "PENDING" | "RETRYING" | "FAILED" | "SENT" | "DEAD";

interface QueueEmailInput {
  eventType: NotificationEventType;
  payload: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  };
  metadata?: Record<string, unknown>;
}

interface QueueProcessResult {
  scanned: number;
  sent: number;
  failed: number;
  dead: number;
}

const DEFAULT_MAX_ATTEMPTS = 5;
const RETRY_BACKOFF_MINUTES = [1, 3, 10, 30, 120];

function getRetryBackoffMinutes(attempts: number): number {
  return RETRY_BACKOFF_MINUTES[Math.min(attempts - 1, RETRY_BACKOFF_MINUTES.length - 1)];
}

export async function queueEmailNotification(input: QueueEmailInput): Promise<void> {
  if (!prisma) return;
  try {
    await prisma.notificationEvent.create({
      data: {
        channel: "EMAIL",
        eventType: input.eventType,
        status: "PENDING",
        attempts: 0,
        maxAttempts: DEFAULT_MAX_ATTEMPTS,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
        payload: input.payload as Prisma.InputJsonValue,
        nextAttemptAt: new Date(),
      },
    });
  } catch (error) {
    logger.error("[Notifications] failed to queue email notification", error);
  }
}

export async function sendOrQueueOrderConfirmationEmail(
  params: OrderConfirmationEmailParams,
  metadata?: Record<string, unknown>
): Promise<void> {
  const message = buildOrderConfirmationEmail(params);
  const sent = await sendEmail(message);
  if (sent) return;

  await queueEmailNotification({
    eventType: "ORDER_CONFIRMATION",
    payload: message,
    metadata,
  });
}

export async function sendOrQueueAdminNewOrderEmail(
  params: AdminNewOrderEmailParams,
  metadata?: Record<string, unknown>
): Promise<void> {
  const message = buildAdminNewOrderEmail(params);
  const sent = await sendEmail(message);
  if (sent) return;

  await queueEmailNotification({
    eventType: "ADMIN_NEW_ORDER",
    payload: message,
    metadata,
  });
}

export async function processNotificationEmailQueue(limit = 25): Promise<QueueProcessResult> {
  if (!prisma) {
    return { scanned: 0, sent: 0, failed: 0, dead: 0 };
  }

  const dueEvents = await prisma.notificationEvent.findMany({
    where: {
      channel: "EMAIL",
      status: { in: ["PENDING", "FAILED"] },
      nextAttemptAt: { lte: new Date() },
    },
    orderBy: { createdAt: "asc" },
    take: Math.max(1, Math.min(limit, 100)),
  });

  let sent = 0;
  let failed = 0;
  let dead = 0;

  for (const event of dueEvents) {
    const nextAttempts = event.attempts + 1;

    await prisma.notificationEvent.update({
      where: { id: event.id },
      data: {
        status: "RETRYING",
        attempts: nextAttempts,
      },
    });

    const payload = event.payload as {
      to?: string;
      subject?: string;
      html?: string;
      text?: string;
    };
    const hasMessage = payload.to && payload.subject && payload.html;
    const delivered = hasMessage
      ? await sendEmail({
          to: payload.to as string,
          subject: payload.subject as string,
          html: payload.html as string,
          text: typeof payload.text === "string" ? payload.text : undefined,
        })
      : false;

    if (delivered) {
      sent += 1;
      await prisma.notificationEvent.update({
        where: { id: event.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          lastError: null,
        },
      });
      continue;
    }

    const exhausted = nextAttempts >= event.maxAttempts;
    if (exhausted) {
      dead += 1;
      await prisma.notificationEvent.update({
        where: { id: event.id },
        data: {
          status: "DEAD",
          lastError: hasMessage
            ? "Delivery failed after max attempts"
            : "Invalid payload: missing to/subject/html",
        },
      });
      continue;
    }

    failed += 1;
    const backoffMinutes = getRetryBackoffMinutes(nextAttempts);
    const nextAttemptAt = new Date(Date.now() + backoffMinutes * 60 * 1000);
    await prisma.notificationEvent.update({
      where: { id: event.id },
      data: {
        status: "FAILED",
        nextAttemptAt,
        lastError: hasMessage
          ? `Delivery failed on attempt ${nextAttempts}`
          : "Invalid payload: missing to/subject/html",
      },
    });
  }

  return {
    scanned: dueEvents.length,
    sent,
    failed,
    dead,
  };
}

export async function getNotificationQueueMetrics(): Promise<{
  pending: number;
  failed: number;
  dead: number;
}> {
  if (!prisma) {
    return { pending: 0, failed: 0, dead: 0 };
  }

  const [pending, failed, dead] = await Promise.all([
    prisma.notificationEvent.count({
      where: { channel: "EMAIL", status: "PENDING" as NotificationStatus },
    }),
    prisma.notificationEvent.count({
      where: { channel: "EMAIL", status: "FAILED" as NotificationStatus },
    }),
    prisma.notificationEvent.count({
      where: { channel: "EMAIL", status: "DEAD" as NotificationStatus },
    }),
  ]);

  return { pending, failed, dead };
}
