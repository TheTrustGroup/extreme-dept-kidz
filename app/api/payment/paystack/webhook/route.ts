import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { confirmOrderPayment } from "@/lib/services/order.service";
import { prisma } from "@/lib/db/prisma";
import {
  sendOrQueueAdminNewOrderEmail,
  sendOrQueueOrderConfirmationEmail,
} from "@/lib/services/notification-queue.service";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({}, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; metadata?: { orderId?: string } } };
  try {
    event = JSON.parse(body) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    const reference = event.data.reference;
    const orderId =
      typeof event.data.metadata?.orderId === "string" && event.data.metadata.orderId.length > 0
        ? event.data.metadata.orderId
        : reference;
    try {
      const paymentState = await confirmOrderPayment(orderId);
      if (prisma && paymentState.alreadyCompleted === false) {
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

          if (addr.email) {
            void sendOrQueueOrderConfirmationEmail(
              { to: addr.email, orderNumber: order.orderNumber, totalPesewas: order.total },
              { orderId, reference, source: "paystack.webhook" }
            );
          }
          void sendOrQueueAdminNewOrderEmail({
            orderId: order.id,
            orderNumber: order.orderNumber,
            totalPesewas: order.total,
            customerName,
            customerEmail: addr.email ?? "unknown@unknown.local",
            customerPhone: addr.phone ?? "N/A",
            shippingSummary,
            paymentMethod: order.paymentMethod,
          }, { orderId, reference, source: "paystack.webhook" });
        }
      }
    } catch (err) {
      logger.error("[Paystack webhook] confirmOrderPayment failed", reference, err);
    }
    if (process.env.NODE_ENV === "development") {
      logger.log("Paystack webhook: charge.success", reference);
    }
  }

  return NextResponse.json({ received: true });
}
