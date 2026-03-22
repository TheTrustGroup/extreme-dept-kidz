import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { confirmOrderPayment } from "@/lib/services/order.service";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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
      await confirmOrderPayment(orderId);
    } catch (err) {
      logger.error("[Paystack webhook] confirmOrderPayment failed", reference, err);
    }
    if (process.env.NODE_ENV === "development") {
      logger.log("Paystack webhook: charge.success", reference);
    }
  }

  return NextResponse.json({ received: true });
}
