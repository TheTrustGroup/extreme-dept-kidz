/**
 * Paystack Payment Integration
 * Card and mobile money payments (GHS, NGN, etc.)
 * @see https://paystack.com/docs
 */

import { getSiteUrl } from "@/lib/config/site-url";

const PAYSTACK_BASE = "https://api.paystack.co";

interface PaystackConfig {
  secretKey: string;
  /** Base URL for callbacks, e.g. https://extremedeptkidz.com */
  baseUrl: string;
}

interface InitializeParams {
  email: string;
  amount: number; // in smallest unit (pesewas for GHS, kobo for NGN)
  reference: string;
  currency?: "GHS" | "NGN" | "ZAR" | "USD";
  metadata?: Record<string, unknown>;
}

interface InitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface VerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    currency: string;
    id: number;
  };
}

function getConfig(): PaystackConfig {
  const secretKey = process.env.PAYSTACK_SECRET_KEY || "";
  const baseUrl = getSiteUrl();
  return { secretKey, baseUrl };
}

/**
 * Initialize a Paystack transaction. Returns the URL to redirect the customer to.
 */
export async function initializePaystackTransaction(
  params: InitializeParams
): Promise<{ authorizationUrl: string; reference: string } | { error: string }> {
  const config = getConfig();
  if (!config.secretKey) {
    console.warn("⚠️ Paystack PAYSTACK_SECRET_KEY is not set.");
    return { error: "Paystack is not configured" };
  }

  const callbackUrl = `${config.baseUrl}/checkout/payment-status?ref=${params.reference}`;
  const body = {
    email: params.email,
    amount: params.amount,
    reference: params.reference,
    callback_url: callbackUrl,
    currency: params.currency ?? "GHS",
    metadata: params.metadata ?? {},
  };

  try {
    const { fetchWithTimeout } = await import("@/lib/utils/fetch-with-timeout");
    const response = await fetchWithTimeout(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        method: "POST",
        timeoutMs: 15000,
        headers: {
          Authorization: `Bearer ${config.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = (await response.json()) as InitializeResponse;

    if (!data.status || !data.data?.authorization_url) {
      const msg = data.message || "Failed to initialize payment";
      console.error("Paystack initialize error:", msg);
      return { error: msg };
    }

    return {
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    };
  } catch (err) {
    console.error("Paystack initialize error:", err);
    return {
      error: err instanceof Error ? err.message : "Payment initialization failed",
    };
  }
}

/**
 * Verify a Paystack transaction by reference.
 */
export async function verifyPaystackTransaction(reference: string): Promise<{
  verified: boolean;
  status: string;
  amount?: number;
  transactionId?: number;
}> {
  const config = getConfig();
  if (!config.secretKey) {
    return { verified: false, status: "NOT_CONFIGURED" };
  }

  try {
    const { fetchWithTimeout } = await import("@/lib/utils/fetch-with-timeout");
    const response = await fetchWithTimeout(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        timeoutMs: 10000,
        headers: {
          Authorization: `Bearer ${config.secretKey}`,
        },
      }
    );

    const data = (await response.json()) as VerifyResponse;

    if (!data.status || !data.data) {
      return {
        verified: false,
        status: data.data?.status ?? data.message ?? "unknown",
      };
    }

    const verified = data.data.status === "success";
    return {
      verified,
      status: data.data.status,
      amount: data.data.amount,
      transactionId: data.data.id,
    };
  } catch (err) {
    console.error("Paystack verify error:", err);
    return { verified: false, status: "ERROR" };
  }
}
