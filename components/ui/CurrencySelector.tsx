"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { SUPPORTED_CURRENCIES } from "@/lib/currency/constants";
import { cn } from "@/lib/utils";

export interface CurrencySelectorProps {
  className?: string;
  isDark?: boolean;
}

export function CurrencySelector({ className, isDark = false }: CurrencySelectorProps): JSX.Element {
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const current = SUPPORTED_CURRENCIES.find((c) => c.code === currency) ?? SUPPORTED_CURRENCIES[0];

  return (
    <Menu as="div" className={cn("relative", className)}>
      <MenuButton
        className={cn(
          "flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium outline-none",
          "focus-visible:ring-2 focus-visible:ring-luxury-gold focus-visible:ring-offset-2",
          isDark ? "text-white/90 hover:bg-white/10" : "text-luxury-navy-700 hover:bg-luxury-navy-100/50"
        )}
        aria-label="Select currency"
      >
        <span>{current.symbol}</span>
        <span className="hidden sm:inline">{current.code}</span>
        <ChevronDown className="w-4 h-4 opacity-70" aria-hidden />
      </MenuButton>
      <MenuItems
        transition
        className={cn(
          "absolute right-0 top-full mt-1 min-w-[160px] origin-top-right rounded-lg py-1 shadow-lg z-50",
          "backdrop-blur-md border border-white/20",
          isDark ? "bg-luxury-navy-900/95" : "bg-white/95"
        )}
      >
        {SUPPORTED_CURRENCIES.map((c) => (
          <MenuItem key={c.code}>
            {({ focus }) => (
              <button
                type="button"
                onClick={() => setCurrency(c.code)}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm",
                  focus ? "bg-luxury-gold/10" : "",
                  c.code === currency ? "font-medium text-luxury-gold" : isDark ? "text-white/90" : "text-luxury-navy-700"
                )}
              >
                <span>{c.symbol}</span>
                <span>{c.name}</span>
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
