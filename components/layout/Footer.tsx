"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { Instagram } from "lucide-react";
import { cn } from "@/lib/utils";
import { TikTokIcon, SnapchatIcon } from "@/components/ui/social-icons";

export function Footer(): JSX.Element {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail("");
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1000);
  };

  return (
    <footer id="footer" className="bg-[#1a1a1a] text-cream-50" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="py-16 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Brand Section */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3">
                <Image
                  src="/IMG_8640.PNG"
                  alt="EXTREME DEPT KIDZ"
                  width={200}
                  height={34}
                  className="h-8 w-auto object-contain"
                  priority={false}
                />
              </div>
              <p className="font-sans text-base text-cream-200/80 leading-relaxed max-w-md">
                Elevated style for young legends. Premium streetwear and luxury essentials for the modern boy.
              </p>
              {/* Social Icons */}
              <div className="flex items-center space-x-4 pt-2">
                <SocialIcon href="#" icon={Instagram} label="Instagram" />
                <SocialIcon href="#" icon={TikTokIcon} label="TikTok" />
                <SocialIcon href="#" icon={SnapchatIcon} label="Snapchat" />
              </div>
            </m.div>

            {/* Newsletter Section */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-4"
            >
              <h3 className="font-serif text-2xl font-bold text-cream-50">
                STAY IN THE LOOP
              </h3>
              <p className="font-sans text-base text-cream-200/80 leading-relaxed">
                Sign up for exclusive drops, style tips, and early access to new collections.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={cn(
                      "flex-1 bg-transparent border border-cream-200/30 rounded-lg px-4 py-3",
                      "text-cream-50 placeholder:text-cream-400/60",
                      "focus:outline-none focus:border-cream-50 focus:ring-2 focus:ring-cream-50/20",
                      "transition-all duration-300",
                      "font-sans text-sm"
                    )}
                    required
                    disabled={isSubmitting}
                  />
                  <m.button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className={cn(
                      "ml-2 p-3 rounded-lg bg-navy-900 text-cream-50",
                      "hover:bg-navy-800 transition-colors duration-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a]"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Subscribe to newsletter"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </m.button>
                </div>
                {isSuccess && (
                  <m.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-green-400"
                  >
                    ✓ Successfully subscribed!
                  </m.p>
                )}
                <div className="flex items-center space-x-2 text-xs text-cream-200/70">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-navy-900/50 text-cream-50 font-medium">
                    ✓ First order: 10% off
                  </span>
                </div>
              </form>
            </m.div>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12 mt-16 lg:mt-20 pt-16 lg:pt-20 border-t border-cream-200/10">
            {/* SHOP */}
            <m.nav
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              aria-label="Shop navigation"
            >
              <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-cream-200/60 mb-4">
                SHOP
              </h4>
              <ul className="space-y-3">
                <FooterNavLink href="/collections/boys">Boys</FooterNavLink>
                <FooterNavLink href="/collections/girls">Girls</FooterNavLink>
                <FooterNavLink href="/collections/new-arrivals">New Arrivals</FooterNavLink>
                <FooterNavLink href="/collections">Collections</FooterNavLink>
                <FooterNavLink href="#">Gift Cards</FooterNavLink>
                <FooterNavLink href="/collections?sort=price-low">Sale</FooterNavLink>
              </ul>
            </m.nav>

            {/* CUSTOMER CARE */}
            <m.nav
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              aria-label="Customer care navigation"
            >
              <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-cream-200/60 mb-4">
                CUSTOMER CARE
              </h4>
              <ul className="space-y-3">
                <FooterNavLink href="#">Shipping Info</FooterNavLink>
                <FooterNavLink href="#">Returns & Exchange</FooterNavLink>
                <FooterNavLink href="#">Size Guide</FooterNavLink>
                <FooterNavLink href="#">Order Tracking</FooterNavLink>
                <FooterNavLink href="/contact">Contact Us</FooterNavLink>
                <FooterNavLink href="#">FAQs</FooterNavLink>
              </ul>
            </m.nav>

            {/* COMPANY */}
            <m.nav
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              aria-label="Company navigation"
            >
              <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-cream-200/60 mb-4">
                COMPANY
              </h4>
              <ul className="space-y-3">
                <FooterNavLink href="/about">About Us</FooterNavLink>
                <FooterNavLink href="/about">Our Story</FooterNavLink>
                <FooterNavLink href="#">Careers</FooterNavLink>
                <FooterNavLink href="#">Press</FooterNavLink>
                <FooterNavLink href="#">Wholesale</FooterNavLink>
                <FooterNavLink href="#">Sustainability</FooterNavLink>
              </ul>
            </m.nav>

            {/* CONNECT */}
            <m.nav
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
              aria-label="Connect navigation"
            >
              <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-cream-200/60 mb-4">
                CONNECT
              </h4>
              <ul className="space-y-3">
                <FooterNavLink href="#" icon={Instagram}>Instagram</FooterNavLink>
                <FooterNavLink href="#" icon={TikTokIcon}>TikTok</FooterNavLink>
                <FooterNavLink href="#" icon={SnapchatIcon}>Snapchat</FooterNavLink>
              </ul>
            </m.nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-[#0f0f0f] border-t border-cream-200/10 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-cream-200/60">
              <span>© {new Date().getFullYear()} <span className="font-semibold text-cream-50">Extreme Dept Kidz</span>. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="italic">Made with precision & care</span>
            </div>

            {/* Center: Legal Links */}
            <nav className="flex items-center gap-4 text-sm text-cream-200/60" aria-label="Legal links">
              <FooterNavLink href="#" className="text-sm">Privacy Policy</FooterNavLink>
              <span className="text-cream-200/30">|</span>
              <FooterNavLink href="#" className="text-sm">Terms of Service</FooterNavLink>
              <span className="text-cream-200/30">|</span>
              <FooterNavLink href="#" className="text-sm">Accessibility</FooterNavLink>
            </nav>

            {/* Right: Payment Icons */}
            <div className="flex items-center gap-2">
              <PaymentIcon name="visa" />
              <PaymentIcon name="mastercard" />
              <PaymentIcon name="amex" />
              <PaymentIcon name="paypal" />
              <PaymentIcon name="apple-pay" />
              <PaymentIcon name="google-pay" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Footer Navigation Link Component
interface FooterNavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

function FooterNavLink({ className, children, icon: Icon, href, ...props }: FooterNavLinkProps): JSX.Element {
  const Component = href?.startsWith("/") ? Link : "a";
  const linkProps = href?.startsWith("/") 
    ? { href } 
    : { href: href || "#" };
  return (
    <Component
      className={cn(
        "font-sans text-sm text-cream-200/80 hover:text-cream-50",
        "transition-colors duration-200 relative group",
        "focus:outline-none focus:ring-2 focus:ring-cream-50 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] focus:rounded px-1",
        className
      )}
      {...linkProps}
      {...props}
    >
      <span className="relative inline-flex items-center space-x-2">
        {Icon && <Icon className="w-4 h-4" />}
        <span>{children}</span>
        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cream-50 transition-all duration-300 group-hover:w-full" aria-hidden="true" />
      </span>
    </Component>
  );
}

// Social Icon Component
interface SocialIconProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function SocialIcon({ href, icon: Icon, label }: SocialIconProps): JSX.Element {
  return (
    <m.a
      href={href}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-cream-200/10 text-cream-200/80 hover:text-cream-50 transition-colors duration-300"
      aria-label={label}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className="w-5 h-5" />
    </m.a>
  );
}

// Payment Icon Component
interface PaymentIconProps {
  name: string;
}

function PaymentIcon({ name }: PaymentIconProps): JSX.Element {
  const icons: Record<string, string> = {
    visa: "VISA",
    mastercard: "MC",
    amex: "AMEX",
    paypal: "PP",
    "apple-pay": "AP",
    "google-pay": "GP",
  };

  return (
    <div className="w-10 h-6 flex items-center justify-center rounded bg-cream-200/10 text-cream-200/60 text-[10px] font-semibold">
      {icons[name] || name}
    </div>
  );
}
