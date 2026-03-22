import { NextRequest, NextResponse } from "next/server";
import { createRateLimitMiddleware, RATE_LIMITS } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rateLimitResponse = await createRateLimitMiddleware(RATE_LIMITS.PAYMENT)(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const { email, amount, orderId, customerInfo, cartItems } = body;

    if (!email || !amount || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
    const callbackUrl = `${siteUrl}/checkout/payment-status`;

    const reference = String(orderId)
      .replace(/[^a-zA-Z0-9\-._=]/g, "_")
      .slice(0, 100);

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        reference,
        callback_url: callbackUrl,
        metadata: {
          orderId,
          customerInfo,
          cartItems,
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: orderId,
            },
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: `${customerInfo?.firstName ?? ""} ${customerInfo?.lastName ?? ""}`.trim(),
            },
          ],
        },
        currency: "GHS",
        channels: ["card", "mobile_money", "bank_transfer"],
      }),
    });

    const data = (await response.json()) as {
      status?: boolean;
      message?: string;
      data?: {
        authorization_url: string;
        reference: string;
        access_code: string;
      };
    };

    if (!data.status) {
      return NextResponse.json(
        { error: data.message || "Payment initiation failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      authorizationUrl: data.data?.authorization_url,
      reference: data.data?.reference,
      accessCode: data.data?.access_code,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
