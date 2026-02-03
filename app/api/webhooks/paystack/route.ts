/**
 * Paystack Webhook
 * Verify signature, on charge.success confirm order (inventory + payment status).
 * Return 200 quickly so Paystack does not retry; processing is idempotent.
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { confirmOrderPayment } from "@/lib/services/order.service";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

function verifyPaystackSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const hash = createHmac("sha512", secret).update(payload).digest("hex");
  return hash === signature;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    logger.error("[Webhook Paystack] PAYSTACK_SECRET_KEY not set");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const signature = request.headers.get("x-paystack-signature");
  if (!verifyPaystackSignature(rawBody, signature, secret)) {
    logger.warn("[Webhook Paystack] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody) as { event?: string; data?: { reference?: string } };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    const reference = event.data.reference;
    try {
      await confirmOrderPayment(reference);
    } catch (err) {
      logger.error("[Webhook Paystack] confirmOrderPayment failed", reference, err);
      // Still 200 so Paystack does not retry forever; confirm is idempotent so manual retry or verify flow can fix
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
