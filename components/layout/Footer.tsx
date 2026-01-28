"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { Instagram } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { TikTokIcon, SnapchatIcon } from "@/components/ui/social-icons";

export function Footer(): JSX.Element {
  const { theme } = useTheme();
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
    <footer 
      id="footer" 
      className={cn(
        "text-cream-50 transition-colors duration-300",
        theme === "dark" 
          ? "bg-dark-bg-secondary text-dark-text-primary" 
          : "bg-[#1a1a1a] text-cream-50"
      )} 
      role="contentinfo"
    >
      <div className="container max-w-7xl mx-auto">
        {/* Top Section - Using spacing scale */}
        <div className="py-[var(--space-12)] md:py-[var(--space-13)] lg:py-[var(--space-13)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-12)] lg:gap-[var(--space-13)]">
            {/* Brand Section */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="space-y-[var(--space-6)]"
            >
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/IMG_8640.PNG"
                    alt="EXTREME DEPT KIDZ"
                    width={1080}
                    height={720}
                    className={cn(
                      "h-10 sm:h-12 md:h-14 w-auto object-contain max-w-[80px] sm:max-w-[100px] md:max-w-[120px]",
                      "transition-opacity duration-300"
                    )}
                    priority={false}
                    sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, 120px"
                  />
                </Link>
              </div>
              <p className={cn(
                "font-sans text-base leading-relaxed max-w-md transition-colors duration-300",
                theme === "dark" 
                  ? "text-dark-text-secondary" 
                  : "text-cream-200/80"
              )}>
                Elevated style for young legends. Premium streetwear and luxury essentials for the modern boy.
              </p>
              {/* Social Icons - Consistent spacing */}
              <div className="flex items-center gap-[var(--space-4)] pt-[var(--space-2)]">
                <SocialIcon 
                  href="https://www.instagram.com/extreme_dept_kidz?igsh=bm92Zng4OGRyN3Fl" 
                  icon={Instagram} 
                  label="Instagram" 
                />
                <SocialIcon 
                  href="https://www.tiktok.com/@extreme_dept_kidz?_r=1&_t=ZM-92wJ2AMJUoS" 
                  icon={TikTokIcon} 
                  label="TikTok" 
                />
                <SocialIcon 
                  href="https://snapchat.com/t/dE3hKeZX" 
                  icon={SnapchatIcon} 
                  label="Snapchat" 
                />
              </div>
            </m.div>

            {/* Newsletter Section */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-[var(--space-4)]"
            >
              <h3 className={cn(
                "font-serif text-2xl font-bold transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-cream-50"
              )}>
                STAY IN THE LOOP
              </h3>
              <p className={cn(
                "font-sans text-base leading-relaxed transition-colors duration-300",
                theme === "dark" 
                  ? "text-dark-text-secondary" 
                  : "text-cream-200/80"
              )}>
                Sign up for exclusive drops, style tips, and early access to new collections.
              </p>
              <form onSubmit={handleSubmit} className="space-y-[var(--space-3)]">
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

          {/* Navigation Columns - Consistent spacing using 8px base scale */}
          <div className={cn(
            "grid grid-cols-2 sm:grid-cols-4",
            "gap-[var(--space-8)] lg:gap-[var(--space-12)]",
            "mt-[var(--space-12)] lg:mt-[var(--space-13)]",
            "pt-[var(--space-12)] lg:pt-[var(--space-13)]",
            "border-t transition-colors duration-300",
            theme === "dark" ? "border-dark-border-glass" : "border-cream-200/10"
          )}>
            {/* SHOP */}
            <m.nav
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              aria-label="Shop navigation"
            >
              <h4 className={cn(
                "font-sans text-xs font-semibold uppercase tracking-wider mb-4 transition-colors duration-300",
                theme === "dark" 
                  ? "text-dark-text-muted" 
                  : "text-cream-200/60"
              )}>
                SHOP
              </h4>
              <ul className="space-y-[var(--space-3)]">
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
              <h4 className={cn(
                "font-sans text-xs font-semibold uppercase tracking-wider mb-4 transition-colors duration-300",
                theme === "dark" 
                  ? "text-dark-text-muted" 
                  : "text-cream-200/60"
              )}>
                CUSTOMER CARE
              </h4>
              <ul className="space-y-[var(--space-3)]">
                <FooterNavLink href="#">Shipping Info</FooterNavLink>
                <FooterNavLink href="#">Returns & Exchange</FooterNavLink>
                <FooterNavLink href="#">Size Guide</FooterNavLink>
                <FooterNavLink href="#">Order Tracking</FooterNavLink>
                <FooterNavLink href="/contact">Contact Us</FooterNavLink>
                <FooterNavLink href="mailto:info@extremedeptkidz.com">info@extremedeptkidz.com</FooterNavLink>
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
              <h4 className={cn(
                "font-sans text-xs font-semibold uppercase tracking-wider mb-4 transition-colors duration-300",
                theme === "dark" 
                  ? "text-dark-text-muted" 
                  : "text-cream-200/60"
              )}>
                COMPANY
              </h4>
              <ul className="space-y-[var(--space-3)]">
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
              <h4 className={cn(
                "font-sans text-xs font-semibold uppercase tracking-wider mb-4 transition-colors duration-300",
                theme === "dark" 
                  ? "text-dark-text-muted" 
                  : "text-cream-200/60"
              )}>
                CONNECT
              </h4>
              <ul className="space-y-[var(--space-3)]">
                <FooterNavLink 
                  href="https://www.instagram.com/extreme_dept_kidz?igsh=bm92Zng4OGRyN3Fl" 
                  icon={Instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </FooterNavLink>
                <FooterNavLink 
                  href="https://www.tiktok.com/@extreme_dept_kidz?_r=1&_t=ZM-92wJ2AMJUoS" 
                  icon={TikTokIcon}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TikTok
                </FooterNavLink>
                <FooterNavLink 
                  href="https://snapchat.com/t/dE3hKeZX" 
                  icon={SnapchatIcon}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Snapchat
                </FooterNavLink>
              </ul>
            </m.nav>
          </div>
        </div>

        {/* Bottom Bar - Consistent spacing */}
        <div className={cn(
          "border-t py-[var(--space-6)] transition-colors duration-300",
          theme === "dark"
            ? "bg-dark-bg-primary border-dark-border-glass"
            : "bg-[#0f0f0f] border-cream-200/10"
        )}>
          <div className="container max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-[var(--space-4)]">
            {/* Left: Copyright - Consistent spacing */}
            <div className={cn(
              "flex flex-col sm:flex-row items-center gap-[var(--space-2)] sm:gap-[var(--space-4)] text-sm transition-colors duration-300",
              theme === "dark" ? "text-dark-text-muted" : "text-cream-200/60"
            )}>
              <span>© {new Date().getFullYear()} <span className={cn(
                "font-semibold transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-cream-50"
              )}>Extreme Dept Kidz</span>. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="italic">Made with precision & care</span>
            </div>

            {/* Center: Legal Links - Consistent spacing */}
            <nav className={cn(
              "flex items-center gap-[var(--space-4)] text-sm transition-colors duration-300",
              theme === "dark" ? "text-dark-text-muted" : "text-cream-200/60"
            )} aria-label="Legal links">
              <FooterNavLink href="#" className="text-sm">Privacy Policy</FooterNavLink>
              <span className={cn(
                "transition-colors duration-300",
                theme === "dark" ? "text-dark-text-muted" : "text-cream-200/30"
              )}>|</span>
              <FooterNavLink href="#" className="text-sm">Terms of Service</FooterNavLink>
              <span className={cn(
                "transition-colors duration-300",
                theme === "dark" ? "text-dark-text-muted" : "text-cream-200/30"
              )}>|</span>
              <FooterNavLink href="#" className="text-sm">Accessibility</FooterNavLink>
            </nav>

            {/* Right: Payment Icons - Consistent spacing */}
            <div className="flex items-center gap-[var(--space-2)]">
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
  const { theme } = useTheme();
  const Component = href?.startsWith("/") ? Link : "a";
  const linkProps = href?.startsWith("/") 
    ? { href } 
    : { href: href || "#" };
  return (
    <Component
      className={cn(
        "font-sans text-sm transition-colors duration-200 relative group",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:rounded px-1",
        theme === "dark"
          ? "text-dark-text-secondary hover:text-dark-text-primary focus:ring-accent-primary focus:ring-offset-dark-bg-secondary"
          : "text-cream-200/80 hover:text-cream-50 focus:ring-cream-50 focus:ring-offset-[#1a1a1a]",
        className
      )}
      {...linkProps}
      {...props}
    >
      <span className="relative inline-flex items-center space-x-2">
        {Icon && <Icon className="w-4 h-4" />}
        <span>{children}</span>
        <span className={cn(
          "absolute bottom-0 left-0 w-0 h-[1px] transition-all duration-300 group-hover:w-full",
          theme === "dark" ? "bg-dark-text-primary" : "bg-cream-50"
        )} aria-hidden="true" />
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
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 flex items-center justify-center rounded-full bg-cream-200/10 text-cream-200/80 hover:text-cream-50 hover:bg-cream-200/20 transition-colors duration-300"
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

  // Brand-specific colors for each payment method
  const paymentStyles: Record<string, { bg: string; text: string; border?: string }> = {
    visa: {
      bg: "bg-gradient-to-br from-[#1A1F71] to-[#1434A4]",
      text: "text-white",
    },
    mastercard: {
      bg: "bg-gradient-to-br from-[#EB001B] to-[#F79E1B]",
      text: "text-white",
    },
    amex: {
      bg: "bg-gradient-to-br from-[#006FCF] to-[#0052A5]",
      text: "text-white",
    },
    paypal: {
      bg: "bg-gradient-to-br from-[#0070BA] to-[#003087]",
      text: "text-white",
    },
    "apple-pay": {
      bg: "bg-black",
      text: "text-white",
    },
    "google-pay": {
      bg: "bg-gradient-to-br from-[#4285F4] via-[#34A853] via-[#FBBC05] to-[#EA4335]",
      text: "text-white",
    },
  };

  const style = paymentStyles[name] || {
    bg: "bg-cream-200/10",
    text: "text-cream-200/60",
  };

  return (
    <div
      className={cn(
        "w-10 h-6 flex items-center justify-center rounded text-[10px] font-semibold",
        "transition-all duration-300 hover:scale-110 hover:shadow-lg",
        style.bg,
        style.text,
        style.border
      )}
      title={name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ")}
    >
      {icons[name] || name}
    </div>
  );
}
