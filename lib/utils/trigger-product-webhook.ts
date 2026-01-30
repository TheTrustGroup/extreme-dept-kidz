/**
 * Trigger product-updated webhook so frontend cache is revalidated immediately.
 * Call after admin product create/update/delete (fire-and-forget).
 */

function getWebhookBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export interface TriggerProductUpdatedPayload {
  productId?: string;
  productSlug?: string;
  action?: "created" | "updated" | "deleted";
  categorySlug?: string;
}

/**
 * POST to /api/webhooks/product-updated. Does not throw; failures are logged only.
 */
export function triggerProductUpdatedWebhook(payload: TriggerProductUpdatedPayload): void {
  const base = getWebhookBaseUrl();
  const url = `${base}/api/webhooks/product-updated`;
  const secret = process.env.REVALIDATE_SECRET || process.env.WEBHOOK_SECRET;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (secret) {
    headers["x-webhook-secret"] = secret;
  }

  fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  }).catch((err) => {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Webhook] Failed to trigger product-updated:", err);
    }
  });
}
