import { NextRequest } from "next/server";
import { verifyPaystackTransaction } from "@/lib/payment/paystack";
import { confirmOrderPayment } from "@/lib/services/order.service";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const referenceId = searchParams.get("referenceId") ?? searchParams.get("ref");

  if (!referenceId) {
    return apiError("Reference is required", 400);
  }

  try {
    const verification = await verifyPaystackTransaction(referenceId);

    // Mission-critical: when Paystack says success, confirm order (inventory, payment status)
    if (verification.verified) {
      try {
        await confirmOrderPayment(referenceId);
      } catch (confirmErr) {
        logger.error("Paystack verify: confirmOrderPayment failed (webhook may retry)", confirmErr);
        // Still return success so client sees payment verified; order confirm is idempotent and webhook can fix
      }
    }

    return apiSuccess(
      {
        verified: verification.verified,
        status: verification.status,
        transactionId: verification.transactionId,
      },
      verification.verified ? "Payment verified" : "Payment not completed"
    );
  } catch (error) {
    logger.error("Paystack verify error:", error);
    return apiError("Verification failed", 500);
  }
}
