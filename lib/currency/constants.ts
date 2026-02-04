/**
 * Currency conversion — supported currencies and fallback rates (GHS base).
 * Fallback rates used when API fails or is unavailable. Update periodically.
 * 1 GHS = rate × target (e.g. 1 GHS ≈ 0.052 USD → rates.USD ≈ 0.052).
 */

import type { CurrencyConfig, CurrencyCode, ExchangeRates } from "./types";

/** Base store currency. All DB prices are in pesewas (1 GHS = 100 pesewas). */
export const BASE_CURRENCY = "GHS" as const;

/** Supported currencies for the selector (code, name, symbol, locale, decimals). */
export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: "GHS", name: "Ghana Cedi", symbol: "₵", locale: "en-GH", decimals: 2 },
  { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US", decimals: 2 },
  { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE", decimals: 2 },
  { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB", decimals: 2 },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", locale: "en-CA", decimals: 2 },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", locale: "en-NG", decimals: 2 },
  { code: "XOF", name: "West African CFA", symbol: "CFA", locale: "fr-XOF", decimals: 0 },
  { code: "ZAR", name: "South African Rand", symbol: "R", locale: "en-ZA", decimals: 2 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU", decimals: 2 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", locale: "de-CH", decimals: 2 },
];

/** Fallback rates: 1 GHS = value (e.g. GHS 1 = 0.052 USD). Update periodically. */
export const FALLBACK_RATES_GHS: ExchangeRates = {
  GHS: 1,
  USD: 0.052,
  EUR: 0.048,
  GBP: 0.041,
  CAD: 0.071,
  NGN: 82,
  XOF: 32,
  ZAR: 0.96,
  AUD: 0.079,
  CHF: 0.046,
};

/** Default currency when no preference is set (e.g. from geo). */
export const DEFAULT_CURRENCY = "GHS" as CurrencyCode;

/** Cache TTL for rates in the API (seconds). ExchangeRate-API updates ~daily. */
export const RATES_CACHE_SECONDS = 60 * 60; // 1 hour

/** LocalStorage key for selected currency. */
export const CURRENCY_STORAGE_KEY = "edk_currency";

/** LocalStorage key for last-fetched rates (client-side cache). */
export const RATES_STORAGE_KEY = "edk_currency_rates";
