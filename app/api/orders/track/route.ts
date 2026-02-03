/**
 * GET /api/orders/track?number=ORD-xxx&email=customer@example.com
 * Look up order by orderNumber and verify email (from shippingAddress).
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, apiError, apiNotFound } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

interface ShippingAddressJson {
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  firstName?: string;
  lastName?: string;
}

function buildTimeline(order: {
  status: string;
  createdAt: Date;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
}): Array<{ id: string; status: string; date: string; description: string; location?: string }> {
  const timeline: Array<{ id: string; status: string; date: string; description: string; location?: string }> = [];
  timeline.push({
    id: "placed",
    status: "pending",
    date: new Date(order.createdAt).toISOString().slice(0, 10),
    description: "Order placed",
  });
  if (order.status !== "PENDING" && order.status !== "CANCELLED") {
    timeline.push({
      id: "processing",
      status: "processing",
      date: new Date(order.createdAt).toISOString().slice(0, 10),
      description: "Order confirmed and processing",
    });
  }
  if (order.shippedAt || ["SHIPPED", "DELIVERED"].includes(order.status)) {
    timeline.push({
      id: "shipped",
      status: "shipped",
      date: order.shippedAt ? new Date(order.shippedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      description: "Order shipped",
    });
  }
  if (order.deliveredAt || order.status === "DELIVERED") {
    timeline.push({
      id: "delivered",
      status: "delivered",
      date: order.deliveredAt ? new Date(order.deliveredAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      description: "Delivered",
    });
  }
  if (order.status === "CANCELLED" && order.cancelledAt) {
    timeline.push({
      id: "cancelled",
      status: "cancelled",
      date: new Date(order.cancelledAt).toISOString().slice(0, 10),
      description: "Order cancelled",
    });
  }
  return timeline;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("number")?.trim();
    const email = searchParams.get("email")?.trim();

    if (!orderNumber || !email) {
      return apiError("Order number and email are required", 400);
    }

    if (!prisma) {
      return apiError("Service unavailable", 503);
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: { where: { isPrimary: true }, take: 1, select: { url: true } },
              },
            },
            variant: { select: { size: true } },
          },
        },
      },
    });

    if (!order) {
      return apiNotFound("Order");
    }

    const shipping = order.shippingAddress as ShippingAddressJson | null;
    const orderEmail = (shipping?.email ?? "").toString().toLowerCase().trim();
    const requestedEmail = email.toLowerCase().trim();

    if (orderEmail !== requestedEmail) {
      return apiNotFound("Order");
    }

    const statusLower = order.status.toLowerCase();
    const shippingAddress = shipping
      ? [shipping.address, shipping.city, shipping.state, shipping.country].filter(Boolean).join(", ")
      : "";

    const responseOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      email: orderEmail,
      status: statusLower,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product.images[0]?.url ?? "",
      })),
      shipping: {
        address: shippingAddress,
        method: order.paymentMethod,
        trackingNumber: order.trackingNumber ?? undefined,
      },
      timeline: buildTimeline({
        status: order.status,
        createdAt: order.createdAt,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        cancelledAt: order.cancelledAt,
      }),
    };

    return apiSuccess({ order: responseOrder }, "Order found successfully");
  } catch (error) {
    logger.error("Track order error:", error);
    return apiError(
      "Failed to track order",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
