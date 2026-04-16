import { NextRequest, NextResponse } from "next/server";
import { authenticateAndAuthorize } from "@/lib/auth/middleware";
import { withCors } from "@/lib/utils/cors";
import { prisma } from "@/lib/db/prisma";
import { apiError, apiSuccess } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await authenticateAndAuthorize(request, ["manager", "cashier"]);
  if (auth.error) return withCors(request, auth.error);
  if (!auth.authorized) {
    return withCors(
      request,
      NextResponse.json(
        { error: "Insufficient permissions. Manager or Cashier role required." },
        { status: 403 }
      )
    );
  }

  if (!prisma) {
    return withCors(request, apiError("Database not available", 500));
  }

  try {
    const codThreshold = new Date(Date.now() - 30 * 60 * 1000);
    const codWhere: Record<string, unknown> = {
      paymentMethod: "pay_on_delivery",
      status: "PENDING",
      createdAt: { lte: codThreshold },
    };
    if (auth.user?.assignedPos) {
      codWhere.pos = auth.user.assignedPos;
    }

    const [pendingCodAttention, failedEmailDeliveries, deadEmailDeliveries, latestCodOrders] =
      await Promise.all([
        prisma.order.count({ where: codWhere }),
        prisma.notificationEvent.count({
          where: { channel: "EMAIL", status: "FAILED", eventType: "ADMIN_NEW_ORDER" },
        }),
        prisma.notificationEvent.count({
          where: { channel: "EMAIL", status: "DEAD", eventType: "ADMIN_NEW_ORDER" },
        }),
        prisma.order.findMany({
          where: codWhere,
          select: {
            id: true,
            orderNumber: true,
            createdAt: true,
            total: true,
            shippingAddress: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

    const recentOrders = latestCodOrders.map((order) => {
      const addr =
        order.shippingAddress && typeof order.shippingAddress === "object"
          ? (order.shippingAddress as { firstName?: string; lastName?: string; email?: string })
          : null;
      const customerName =
        `${addr?.firstName ?? ""} ${addr?.lastName ?? ""}`.trim() || "Customer";
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        total: order.total,
        customerName,
        customerEmail: addr?.email ?? null,
      };
    });

    const unreadCount = pendingCodAttention + failedEmailDeliveries + deadEmailDeliveries;
    return withCors(
      request,
      apiSuccess(
        {
          unreadCount,
          pendingCodAttention,
          failedEmailDeliveries,
          deadEmailDeliveries,
          recentOrders,
        },
        "Admin notifications fetched"
      )
    );
  } catch (error) {
    logger.error("[Admin Notifications] Failed to fetch notifications", error);
    return withCors(
      request,
      apiError(
        "Failed to fetch notifications",
        500,
        error instanceof Error ? error.message : "Unknown error"
      )
    );
  }
}
