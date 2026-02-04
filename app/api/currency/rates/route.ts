/**
 * GET /api/currency/rates
 * Returns exchange rates from GHS to supported currencies.
 * Caches response (1 hour). Uses fallback rates if API fails.
 */

import { NextResponse } from "next/server";
import { fetchExchangeRates } from "@/lib/currency/fetch-rates";
import { RATES_CACHE_SECONDS } from "@/lib/currency/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(): Promise<NextResponse> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  const { rates, source } = await fetchExchangeRates(apiKey);

  const body = {
    base: "GHS",
    rates,
    source,
    updatedAt: Date.now(),
  };

  const res = NextResponse.json(body);
  // Cache in CDN/browser for 1 hour; client can refetch on currency change if stale.
  res.headers.set(
    "Cache-Control",
    `public, s-maxage=${RATES_CACHE_SECONDS}, stale-while-revalidate=300`
  );
  return res;
}
