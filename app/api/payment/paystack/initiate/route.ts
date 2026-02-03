import { NextRequest } from "next/server";
import { initializePaystackTransaction } from "@/lib/payment/paystack";
import { apiSuccess, apiError, apiValidationError } from "@/lib/utils/api-response";
import { createRateLimitMiddleware, RATE_LIMITS } from "@/lib/security/rate-limiter";
import { z } from "zod";

const initiateSchema = z.object({
  email: z.string().email("Invalid email address"),
  amount: z.number().int().positive().max(100_000_00), // in smallest unit (pesewas/kobo)
  orderId: z.string().min(1, "Order ID is required"),
  currency: z.enum(["GHS", "NGN", "ZAR", "USD"]).optional(),
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimitCheck = createRateLimitMiddleware(RATE_LIMITS.PAYMENT);
  const rateLimitResponse = await rateLimitCheck(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = initiateSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        const path = e.path.join(".");
        if (path) errors[path] = e.message;
      });
      return apiValidationError(errors);
    }

    const { email, amount, orderId, currency } = parsed.data;
    // Reference: alphanumeric, - . = only (Paystack requirement)
    const reference = orderId.replace(/[^a-zA-Z0-9\-._=]/g, "_").slice(0, 100);

    const result = await initializePaystackTransaction({
      email,
      amount,
      reference,
      currency: currency ?? "GHS",
      metadata: { orderId },
    });

    if ("error" in result) {
      return apiError("Payment initiation failed", 400, result.error);
    }

    return apiSuccess(
      {
        authorizationUrl: result.authorizationUrl,
        reference: result.reference,
        message: "Redirect customer to the authorization URL to complete payment",
      },
      "Payment initiated"
    );
  } catch (error) {
    console.error("Paystack initiate error:", error);
    return apiError(
      "Payment initiation failed",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
