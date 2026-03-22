/**
 * POST /api/orders
 * Create an order (checkout). Returns orderId and orderNumber for payment reference.
 */

import { NextRequest } from "next/server";
import { createOrder } from "@/lib/services/order.service";
import { sendOrderConfirmationEmail } from "@/lib/services/email.service";
import { apiSuccess, apiError, apiValidationError } from "@/lib/utils/api-response";
import { createRateLimitMiddleware, RATE_LIMITS } from "@/lib/security/rate-limiter";
import { validate } from "@/lib/validation/schemas";
import { createOrderApiSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

const ORDER_RATE_LIMIT = {
  windowMs: 60 * 1000,
  maxRequests: 15,
  message: "Too many order attempts. Please try again in a minute.",
};

export async function POST(request: NextRequest) {
  const rateLimitResponse = await createRateLimitMiddleware(ORDER_RATE_LIMIT)(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const validation = validate(createOrderApiSchema, body);
    if (!validation.success) {
      return apiValidationError(validation.errors);
    }

    const { orderId, orderNumber, total } = await createOrder({
      items: validation.data.items,
      shippingAddress: validation.data.shippingAddress,
      billingAddress: validation.data.billingAddress ?? undefined,
      paymentMethod: validation.data.paymentMethod,
      shippingAmount: validation.data.shippingAmount,
      taxAmount: validation.data.taxAmount,
      idempotencyKey: validation.data.idempotencyKey ?? undefined,
    });

    if (validation.data.paymentMethod === "pay_on_delivery") {
      const email = validation.data.shippingAddress.email;
      void sendOrderConfirmationEmail(email, orderNumber, total);
    }

    return apiSuccess(
      { orderId, orderNumber, total },
      "Order created",
      undefined,
      { requestId: request.headers.get("X-Request-ID") ?? undefined }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("[Orders] Create failed:", message);
    if (
      message.includes("Variant not found") ||
      message.includes("Insufficient stock") ||
      message.includes("At least one item")
    ) {
      return apiError(message, 400, undefined, "VALIDATION_ERROR");
    }
    return apiError("Order creation failed", 500, message);
  }
}
