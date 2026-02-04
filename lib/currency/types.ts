/**
 * Currency conversion module — type definitions
 * Base store currency: GHS (Ghana Cedi). Prices in DB are in pesewas (1 GHS = 100 pesewas).
 */

/** ISO 4217 currency code (e.g. USD, EUR, GHS). */
export type CurrencyCode = string;

/** Exchange rates from base currency (GHS) to target currency. Rate: 1 GHS = rate × target. */
export type ExchangeRates = Record<CurrencyCode, number>;

/** Currency display config: symbol, locale for number formatting, decimal places. */
export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  /** BCP 47 locale for Intl.NumberFormat (e.g. "en-US", "en-GB"). */
  locale: string;
  /** Decimal places to show (e.g. 2 for USD, 0 for JPY). */
  decimals: number;
}

/** API response shape from ExchangeRate-API (GHS base). */
export interface ExchangeRateApiResponse {
  result?: "success" | "error";
  "error-type"?: string;
  base_code: string;
  conversion_rates?: Record<string, number>;
  rates?: Record<string, number>;
  time_last_update_utc?: string;
  time_next_update_utc?: string;
}

/** Result of fetching rates (success with optional timestamp, or fallback). */
export interface RatesResult {
  rates: ExchangeRates;
  fromCache?: boolean;
  updatedAt?: number;
  source: "api" | "fallback";
}
