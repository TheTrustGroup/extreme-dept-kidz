"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { Truck, HeadphonesIcon, Package } from "lucide-react";

export function TopBar(): JSX.Element {
  return (
    <div className="bg-charcoal-900 text-cream-50 text-xs py-2 border-b border-charcoal-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link
              href="#"
              className="flex items-center space-x-1.5 hover:text-cream-200 transition-colors duration-200"
            >
              <Truck className="w-3 h-3" aria-hidden="true" />
              <span>Free Shipping Over ₵75</span>
            </Link>
            <Link
              href="/contact"
              className="hidden sm:flex items-center space-x-1.5 hover:text-cream-200 transition-colors duration-200"
            >
              <HeadphonesIcon className="w-3 h-3" aria-hidden="true" />
              <span>Customer Care</span>
            </Link>
            <Link
              href="#"
              className="hidden md:flex items-center space-x-1.5 hover:text-cream-200 transition-colors duration-200"
            >
              <Package className="w-3 h-3" aria-hidden="true" />
              <span>Track Order</span>
            </Link>
          </div>
          <div className="text-cream-200/80 text-[10px] sm:text-xs">
            Premium Streetwear for Young Legends
          </div>
        </div>
      </div>
    </div>
  );
}
