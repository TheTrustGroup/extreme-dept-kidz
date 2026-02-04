/**
 * Currency conversion module — unit tests
 * Run with: npm test -- tests/currency.test.ts (or jest tests/currency.test.ts)
 */

import { describe, test, expect } from "@jest/globals";
import {
  convertFromPesewas,
  formatCurrencyAmount,
  formatPriceInCurrency,
} from "@/lib/currency/format";
import { FALLBACK_RATES_GHS, SUPPORTED_CURRENCIES } from "@/lib/currency/constants";
import type { CurrencyConfig, ExchangeRates } from "@/lib/currency/types";

const CONFIGS = new Map<string, CurrencyConfig>(
  SUPPORTED_CURRENCIES.map((c) => [c.code, c])
);

describe("Currency conversion", () => {
  describe("convertFromPesewas", () => {
    test("converts pesewas to GHS amount", () => {
      expect(convertFromPesewas(10000, "GHS", FALLBACK_RATES_GHS)).toBe(100);
      expect(convertFromPesewas(12900, "GHS", FALLBACK_RATES_GHS)).toBe(129);
    });

    test("converts pesewas to USD using rate", () => {
      const rates: ExchangeRates = { GHS: 1, USD: 0.052 };
      expect(convertFromPesewas(10000, "USD", rates)).toBe(5.2); // 100 GHS * 0.052
      expect(convertFromPesewas(100000, "USD", rates)).toBe(52);
    });

    test("falls back to GHS value when rate missing", () => {
      const rates: ExchangeRates = { GHS: 1 };
      expect(convertFromPesewas(10000, "XXX", rates)).toBe(100);
    });
  });

  describe("formatCurrencyAmount", () => {
    test("formats with symbol and decimals", () => {
      const usd = SUPPORTED_CURRENCIES.find((c) => c.code === "USD")!;
      const s = formatCurrencyAmount(12.99, usd);
      expect(s).toContain("$");
      expect(s).toMatch(/12[.,]99/);
    });

    test("handles zero", () => {
      const ghs = SUPPORTED_CURRENCIES.find((c) => c.code === "GHS")!;
      expect(formatCurrencyAmount(0, ghs)).toContain("₵");
    });
  });

  describe("formatPriceInCurrency", () => {
    test("formats store price in GHS", () => {
      const out = formatPriceInCurrency(12900, "GHS", FALLBACK_RATES_GHS, CONFIGS);
      expect(out).toContain("₵");
      expect(out).toMatch(/129[.,]00/);
    });

    test("formats store price in USD", () => {
      const out = formatPriceInCurrency(10000, "USD", FALLBACK_RATES_GHS, CONFIGS);
      // 100 GHS * 0.052 = 5.2
      expect(out).toContain("$");
      expect(out).toMatch(/5[.,]20/);
    });

    test("unknown currency uses generic number format", () => {
      const rates: ExchangeRates = { GHS: 1, XXX: 2 };
      const out = formatPriceInCurrency(10000, "XXX", rates, CONFIGS);
      expect(out).toMatch(/200/); // 100 * 2
    });
  });

  describe("fallback rates", () => {
    test("FALLBACK_RATES_GHS includes GHS as 1", () => {
      expect(FALLBACK_RATES_GHS.GHS).toBe(1);
    });

    test("FALLBACK_RATES_GHS includes all supported currency codes", () => {
      const codes = new Set(SUPPORTED_CURRENCIES.map((c) => c.code));
      for (const code of codes) {
        expect(FALLBACK_RATES_GHS[code]).toBeDefined();
        expect(typeof FALLBACK_RATES_GHS[code]).toBe("number");
      }
    });
  });
});
