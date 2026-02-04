/**
 * Currency store — selected currency with localStorage persistence.
 * Rates are fetched and held in CurrencyProvider; this store only holds user choice.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CurrencyCode } from "@/lib/currency/types";
import { CURRENCY_STORAGE_KEY, DEFAULT_CURRENCY } from "@/lib/currency/constants";

interface CurrencyStore {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
}

const safeStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window !== "undefined") localStorage.setItem(name, value);
    } catch {
      // ignore
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window !== "undefined") localStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: DEFAULT_CURRENCY,
      setCurrency: (code) => set({ currency: code }),
    }),
    {
      name: CURRENCY_STORAGE_KEY,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ currency: s.currency }),
    }
  )
);
