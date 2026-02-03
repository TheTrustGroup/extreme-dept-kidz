import { NextRequest } from "next/server";
import { verifyPaystackTransaction } from "@/lib/payment/paystack";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const referenceId = searchParams.get("referenceId") ?? searchParams.get("ref");

  if (!referenceId) {
    return apiError("Reference is required", 400);
  }

  try {
    const verification = await verifyPaystackTransaction(referenceId);
    return apiSuccess(
      {
        verified: verification.verified,
        status: verification.status,
        transactionId: verification.transactionId,
      },
      verification.verified ? "Payment verified" : "Payment not completed"
    );
  } catch (error) {
    console.error("Paystack verify error:", error);
    return apiError("Verification failed", 500);
  }
}
