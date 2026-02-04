"use client";

/**
 * CurrencyProvider — fetches exchange rates and provides formatPrice for the storefront.
 * Wrap storefront (non-admin) in this provider. Admin continues to use raw formatPrice (GHS).
 */

import * as React from "react";
import type { ExchangeRates } from "@/lib/currency/types";
import {
  SUPPORTED_CURRENCIES,
  FALLBACK_RATES_GHS,
  RATES_STORAGE_KEY,
} from "@/lib/currency/constants";
import { formatPriceInCurrency } from "@/lib/currency/format";
import { useCurrencyStore } from "@/lib/stores/currency-store";

const CONFIGS = new Map(SUPPORTED_CURRENCIES.map((c) => [c.code, c]));

interface CurrencyContextValue {
  /** Format price (pesewas) in selected currency. */
  formatPrice: (pesewas: number) => string;
  /** Current exchange rates (GHS → code). */
  rates: ExchangeRates;
  /** Whether rates are loading (first fetch). */
  isLoading: boolean;
  /** Last fetch error, if any. */
  error: string | null;
  /** Refetch rates (e.g. on focus). */
  refetch: () => void;
}

const CurrencyContext = React.createContext<CurrencyContextValue | null>(null);

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function loadCachedRates(): ExchangeRates | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RATES_STORAGE_KEY);
    if (!raw) return null;
    const { rates, updatedAt } = JSON.parse(raw) as {
      rates: ExchangeRates;
      updatedAt: number;
    };
    if (Date.now() - updatedAt > CACHE_TTL_MS) return null;
    return rates;
  } catch {
    return null;
  }
}

function saveCachedRates(rates: ExchangeRates): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        RATES_STORAGE_KEY,
        JSON.stringify({ rates, updatedAt: Date.now() })
      );
    }
  } catch {
    // ignore
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const currency = useCurrencyStore((s) => s.currency);
  const [rates, setRates] = React.useState<ExchangeRates>(() => loadCachedRates() ?? FALLBACK_RATES_GHS);
  const [isLoading, setIsLoading] = React.useState(!loadCachedRates());
  const [error, setError] = React.useState<string | null>(null);

  const fetchRates = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/currency/rates", {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Rates ${res.status}`);
      const data = (await res.json()) as { rates: ExchangeRates };
      const next = { ...FALLBACK_RATES_GHS, ...data.rates };
      setRates(next);
      saveCachedRates(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load rates");
      setRates((prev) => (Object.keys(prev).length ? prev : FALLBACK_RATES_GHS));
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (loadCachedRates()) {
      setIsLoading(false);
      return;
    }
    fetchRates();
  }, [fetchRates]);

  const formatPrice = React.useCallback(
    (pesewas: number): string => {
      return formatPriceInCurrency(pesewas, currency, rates, CONFIGS);
    },
    [currency, rates]
  );

  const value: CurrencyContextValue = React.useMemo(
    () => ({ formatPrice, rates, isLoading, error, refetch: fetchRates }),
    [formatPrice, rates, isLoading, error, fetchRates]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrencyContext(): CurrencyContextValue {
  const ctx = React.useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrencyContext must be used within CurrencyProvider");
  }
  return ctx;
}

/** Safe hook: returns context if available, otherwise a no-op formatter (GHS). */
export function useFormattedPrice(): (pesewas: number) => string {
  const ctx = React.useContext(CurrencyContext);
  const currency = useCurrencyStore((s) => s.currency);
  const fallbackRates = React.useMemo(() => FALLBACK_RATES_GHS, []);
  if (ctx) return ctx.formatPrice;
  return (pesewas: number) =>
    formatPriceInCurrency(pesewas, currency, fallbackRates, CONFIGS);
}
