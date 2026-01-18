"use client";

import Link from "next/link";
import { HeadphonesIcon, Package } from "lucide-react";

export function TopBar(): JSX.Element {
  return (
    <div className="fixed top-0 left-0 right-0 z-60 h-8 bg-charcoal-900 text-cream-50 text-xs border-b border-charcoal-800/50">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center justify-between gap-4">
          {/* Left Side - Navigation Links */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-6">
            <Link
              href="/contact"
              className="flex items-center gap-1.5 hover:text-cream-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cream-200/50 focus:ring-offset-2 focus:ring-offset-charcoal-900 rounded"
              aria-label="Customer Care"
            >
              <HeadphonesIcon className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">Customer Care</span>
            </Link>
            <Link
              href="#"
              className="hidden sm:flex items-center gap-1.5 hover:text-cream-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cream-200/50 focus:ring-offset-2 focus:ring-offset-charcoal-900 rounded"
              aria-label="Track Order"
            >
              <Package className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">Track Order</span>
            </Link>
          </div>

          {/* Right Side - Brand Tagline */}
          <div className="text-cream-200/80 text-[10px] sm:text-xs font-medium whitespace-nowrap">
            Premium Streetwear for Young Legends
          </div>
        </div>
      </div>
    </div>
  );
}
