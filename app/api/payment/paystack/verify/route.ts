import { NextRequest, NextResponse } from "next/server";
import { confirmOrderPayment } from "@/lib/services/order.service";
import {
  sendOrQueueAdminNewOrderEmail,
  sendOrQueueOrderConfirmationEmail,
} from "@/lib/services/notification-queue.service";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const reference =
    searchParams.get("reference") ??
    searchParams.get("trxref") ??
    searchParams.get("referenceId") ??
    searchParams.get("ref");

  if (!reference) {
    return NextResponse.json({ error: "No reference provided" }, { status: 400 });
  }

  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secret}` },
        cache: "no-store",
      }
    );

    const data = (await response.json()) as {
      status?: boolean;
      message?: string;
      data?: {
        status?: string;
        metadata?: {
          orderId?: string;
          customerInfo?: unknown;
          cartItems?: unknown;
        };
        amount?: number;
        customer?: { email?: string };
      };
    };

    if (!data.status || data.data?.status !== "success") {
      return NextResponse.json({
        success: false,
        status: data.data?.status || "failed",
        message: data.message,
      });
    }

    const { metadata, customer } = data.data;
    const orderId =
      typeof metadata?.orderId === "string" && metadata.orderId.length > 0
        ? metadata.orderId
        : reference;

    let paymentState: { alreadyCompleted: boolean } | null = null;
    try {
      paymentState = await confirmOrderPayment(orderId);
    } catch (e) {
      logger.error("[Paystack verify] confirmOrderPayment failed", e);
    }

    let orderNumber = orderId;
    let orderTotal = 0;
    let customerEmail = customer?.email ?? "";

    if (prisma) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          orderNumber: true,
          total: true,
          shippingAddress: true,
          paymentMethod: true,
        },
      });
      if (order) {
        orderNumber = order.orderNumber;
        orderTotal = order.total;
        if (!customerEmail && order.shippingAddress && typeof order.shippingAddress === "object") {
          const addr = order.shippingAddress as { email?: string };
          if (addr.email) customerEmail = addr.email;
        }
      }
    }

    if (customerEmail && orderTotal > 0) {
      void sendOrQueueOrderConfirmationEmail(
        { to: customerEmail, orderNumber, totalPesewas: orderTotal },
        { orderId, reference, source: "paystack.verify" }
      );
    }

    // Notify admin inbox when a new successful payment is confirmed.
    if (prisma && paymentState?.alreadyCompleted === false) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          paymentMethod: true,
          shippingAddress: true,
        },
      });
      if (order && order.shippingAddress && typeof order.shippingAddress === "object") {
        const addr = order.shippingAddress as {
          firstName?: string;
          lastName?: string;
          email?: string;
          phone?: string;
          address?: string;
          apartment?: string;
          city?: string;
          state?: string;
          zipCode?: string;
          country?: string;
        };
        const customerName = `${addr.firstName ?? ""} ${addr.lastName ?? ""}`.trim() || "Customer";
        const shippingSummary = [
          addr.address ?? "",
          [addr.apartment, addr.city, addr.state, addr.zipCode, addr.country]
            .filter(Boolean)
            .join(", "),
        ]
          .filter(Boolean)
          .join("\n");

        void sendOrQueueAdminNewOrderEmail({
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalPesewas: order.total,
          customerName,
          customerEmail: addr.email ?? customerEmail ?? "unknown@unknown.local",
          customerPhone: addr.phone ?? "N/A",
          shippingSummary,
          paymentMethod: order.paymentMethod,
        }, { orderId, reference, source: "paystack.verify" });
      }
    }

    return NextResponse.json({
      success: true,
      status: "success",
      reference,
      amount: data.data.amount,
      email: customerEmail || customer?.email,
      orderId,
      orderNumber,
      customerInfo: metadata?.customerInfo,
      cartItems: metadata?.cartItems,
    });
  } catch (err) {
    logger.error("[Paystack verify] error", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
