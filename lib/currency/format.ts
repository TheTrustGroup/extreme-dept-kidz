/**
 * Currency formatting — convert pesewas to display string in selected currency.
 * Uses Intl for locale-aware thousand separators and decimal places.
 */

import type { CurrencyConfig, ExchangeRates } from "./types";
import { BASE_CURRENCY } from "./constants";

/**
 * Convert store price (pesewas) to amount in target currency.
 * @param pesewas - Price in pesewas (1 GHS = 100 pesewas).
 * @param targetCurrency - ISO code (e.g. USD, GHS).
 * @param rates - Rates from GHS to each currency (1 GHS = rates[code]).
 * @returns Amount in target currency (e.g. 12.99).
 */
export function convertFromPesewas(
  pesewas: number,
  targetCurrency: string,
  rates: ExchangeRates
): number {
  const ghs = pesewas / 100;
  const rate = rates[targetCurrency];
  if (rate == null || Number.isNaN(rate)) return ghs; // fallback to GHS value
  return ghs * rate;
}

/**
 * Format a number as currency with symbol and locale.
 * @param amount - Amount in target currency (not pesewas).
 * @param config - Currency config (symbol, locale, decimals).
 * @returns Formatted string (e.g. "$12.99", "€10,50").
 */
export function formatCurrencyAmount(
  amount: number,
  config: CurrencyConfig
): string {
  const { locale, decimals, symbol } = config;
  const value = Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  // Prepend symbol (locale formatting may vary; we keep symbol first for consistency).
  return `${symbol}${formatted}`;
}

/**
 * Format store price (pesewas) in target currency.
 * @param pesewas - Price in pesewas.
 * @param targetCurrency - ISO code.
 * @param rates - GHS → currency rates.
 * @param configs - Map of currency code → CurrencyConfig (for symbol/locale).
 * @returns Formatted string (e.g. "GHS ₵129.00", "$6.71").
 */
export function formatPriceInCurrency(
  pesewas: number,
  targetCurrency: string,
  rates: ExchangeRates,
  configs: Map<string, CurrencyConfig>
): string {
  const amount = convertFromPesewas(pesewas, targetCurrency, rates);
  const config = configs.get(targetCurrency);
  if (!config) {
    return new Intl.NumberFormat("en", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return formatCurrencyAmount(amount, config);
}
