"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Body } from "./typography";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb Component
 * 
 * Navigation breadcrumb for product pages.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps): JSX.Element {
  return (
    <nav
      className={cn("flex items-center gap-2 text-sm", className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-charcoal-600 hover:text-charcoal-900 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ) : (
                <Body
                  className={cn(
                    "text-charcoal-900",
                    isLast && "font-medium"
                  )}
                >
                  {item.label}
                </Body>
              )}
              {!isLast && (
                <ChevronRight className="w-4 h-4 text-charcoal-400" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

