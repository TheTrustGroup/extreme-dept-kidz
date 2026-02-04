/**
 * Server-side fetch of exchange rates (GHS base).
 * Uses ExchangeRate-API (key optional; open endpoint as fallback) with static fallback on error.
 */

import type { ExchangeRateApiResponse, ExchangeRates } from "./types";
import {
  BASE_CURRENCY,
  FALLBACK_RATES_GHS,
  RATES_CACHE_SECONDS,
} from "./constants";

const OPEN_API_URL = "https://open.er-api.com/v6/latest/GHS";
const PAID_API_BASE = "https://v6.exchangerate-api.com/v6";

/**
 * Normalize API response to our ExchangeRates shape (GHS → target).
 * Handles both "conversion_rates" (paid) and "rates" (open) response keys.
 */
function normalizeRates(res: ExchangeRateApiResponse): ExchangeRates | null {
  const raw = res.conversion_rates ?? res.rates;
  if (!raw || typeof raw !== "object") return null;
  const rates: ExchangeRates = { ...raw };
  if (!rates[BASE_CURRENCY]) rates[BASE_CURRENCY] = 1;
  return rates;
}

/**
 * Fetch live rates from API. Prefers paid endpoint if key is set.
 * @param apiKey - Optional. If set, uses v6.exchangerate-api.com (no attribution). Else open.er-api.com.
 * @returns Rates from GHS to supported currencies, or fallback on error.
 */
export async function fetchExchangeRates(
  apiKey?: string
): Promise<{ rates: ExchangeRates; source: "api" | "fallback" }> {
  const url = apiKey
    ? `${PAID_API_BASE}/${apiKey}/latest/${BASE_CURRENCY}`
    : OPEN_API_URL;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: RATES_CACHE_SECONDS },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Rates API ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as ExchangeRateApiResponse;
    if (data.result === "error") {
      throw new Error(data["error-type"] ?? "Unknown API error");
    }

    const rates = normalizeRates(data);
    if (!rates) throw new Error("Invalid API response shape");

    // Merge with fallback so we always have our supported set
    const merged: ExchangeRates = { ...FALLBACK_RATES_GHS, ...rates };
    return { rates: merged, source: "api" };
  } catch (err) {
    console.warn("[currency] Rates fetch failed, using fallback:", err);
    return { rates: { ...FALLBACK_RATES_GHS }, source: "fallback" };
  }
}
