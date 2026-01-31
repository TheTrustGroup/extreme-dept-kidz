"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, ShieldCheck, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { InstagramIcon, TikTokIcon, SnapchatIcon } from "@/components/ui/social-icons";

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Shipping", href: "/shipping-info" },
  { label: "Returns", href: "/returns-exchange" },
  { label: "FAQ", href: "/contact#faq" },
];

const TRUST_BADGES = [
  { label: "SSL Secured", icon: Lock },
  { label: "Secure Checkout", icon: ShieldCheck },
  { label: "Safe Payment", icon: CreditCard },
];

const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/extreme_dept_kidz?igsh=bm92Zng4OGRyN3Fl", icon: InstagramIcon, label: "Instagram" },
  { href: "https://www.tiktok.com/@extreme_dept_kidz?_r=1&_t=ZM-92wJ2AMJUoS", icon: TikTokIcon, label: "TikTok" },
  { href: "https://snapchat.com/t/dE3hKeZX", icon: SnapchatIcon, label: "Snapchat" },
];

/** Luxury footer: dark navy, gold accents, glassmorphism newsletter, 4-column desktop. */
export function LuxuryFooter(): JSX.Element {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="footer"
      className="bg-luxury-navy-950 text-luxury-cream-100"
      role="contentinfo"
    >
      <div className="container-luxury section-padding">
        {/* Mobile: stacked | Desktop: 4-column grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* 1. Newsletter — glassmorphism card (full width on mobile, then column 1) */}
          <div className="lg:col-span-1">
            <div
              className={cn(
                "rounded-lg border border-white/10 p-6 backdrop-blur-md",
                "bg-white/5 shadow-glass"
              )}
            >
              <h3 className="font-serif text-lg font-semibold uppercase tracking-[0.2em] text-luxury-cream-50">
                Newsletter
              </h3>
              <p className="mt-2 text-sm text-luxury-cream-200/90">
                Exclusive drops, style tips, and early access.
              </p>
              <form
                className="mt-4 space-y-3"
                onSubmit={(e) => e.preventDefault()}
                noValidate
              >
                <input
                  type="email"
                  placeholder="Your email"
                  className={cn(
                    "w-full rounded-none border border-white/20 bg-white/5 px-4 py-3 text-sm",
                    "text-luxury-cream-50 placeholder:text-luxury-cream-400/60",
                    "focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold/50",
                    "transition-colors duration-200"
                  )}
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className={cn(
                    "w-full rounded-none border-2 border-luxury-gold bg-transparent px-4 py-3",
                    "text-sm font-medium uppercase tracking-[0.2em] text-luxury-gold",
                    "hover:bg-luxury-gold hover:text-luxury-navy-900",
                    "transition-colors duration-200"
                  )}
                >
                  Sign up
                </button>
              </form>
            </div>
          </div>

          {/* 2. Links */}
          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-[0.2em] text-luxury-cream-50">
              Quick links
            </h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm text-luxury-cream-200/90 transition-colors duration-200",
                      "hover:text-luxury-gold"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Social */}
          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-[0.2em] text-luxury-cream-50">
              Follow us
            </h3>
            <div className="mt-4 flex gap-4">
              {SOCIAL_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "text-luxury-cream-300 transition-colors duration-200 hover:text-luxury-gold"
                    )}
                    aria-label={item.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 4. Trust badges */}
          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-[0.2em] text-luxury-cream-50">
              Trust
            </h3>
            <ul className="mt-4 space-y-3">
              {TRUST_BADGES.map((badge) => {
                const Icon = badge.icon;
                return (
                  <li
                    key={badge.label}
                    className="flex items-center gap-2 text-sm text-luxury-cream-200/90"
                  >
                    <Icon className="h-4 w-4 flex-shrink-0 text-luxury-gold/80" aria-hidden />
                    <span>{badge.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-luxury-cream-300/80 uppercase tracking-wider">
            © {currentYear} Extreme Dept Kidz. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
