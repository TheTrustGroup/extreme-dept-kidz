"use client";

import * as React from "react";
import { InstagramIcon, TikTokIcon, SnapchatIcon, WhatsAppIcon } from "@/components/ui/social-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Footer() {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail("");
      // Handle success (e.g., show toast notification)
    }, 1000);
  };

  return (
    <footer id="footer" className="bg-charcoal-950 text-cream-50" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 xs:py-14 sm:py-16 md:py-18 lg:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 xs:gap-10 sm:gap-12 lg:gap-8 xl:gap-10">
            {/* Column 1: About */}
            <div className="space-y-6">
              <h3 className="font-serif text-lg font-semibold text-cream-50 uppercase tracking-wider">
                About
              </h3>
              <nav aria-label="About links" className="space-y-4">
                <FooterLink href="#">Our Story</FooterLink>
                <FooterLink href="#">Careers</FooterLink>
              </nav>
            </div>

            {/* Column 2: Customer Care */}
            <div className="space-y-6">
              <h3 className="font-serif text-lg font-semibold text-cream-50 uppercase tracking-wider">
                Customer Care
              </h3>
              <nav aria-label="Customer care links" className="space-y-4">
                <FooterLink href="#">Shipping</FooterLink>
                <FooterLink href="#">Returns</FooterLink>
                <FooterLink href="#">Size Guide</FooterLink>
                <FooterLink href="/contact">Contact</FooterLink>
              </nav>
            </div>

            {/* Column 3: Follow Us */}
            <div className="space-y-6">
              <h3 className="font-serif text-lg font-semibold text-cream-50 uppercase tracking-wider">
                Follow Us
              </h3>
              <nav aria-label="Social media links" className="space-y-4">
                <SocialLink
                  href="#"
                  icon={InstagramIcon}
                  label="Instagram"
                />
                <SocialLink
                  href="#"
                  icon={TikTokIcon}
                  label="TikTok"
                />
                <SocialLink
                  href="#"
                  icon={SnapchatIcon}
                  label="Snapchat"
                />
                <SocialLink
                  href="#"
                  icon={WhatsAppIcon}
                  label="WhatsApp"
                />
              </nav>
            </div>

            {/* Column 4: Newsletter */}
            <div className="space-y-6">
              <h3 className="font-serif text-lg font-semibold text-cream-50 uppercase tracking-wider">
                Newsletter
              </h3>
              <p className="font-sans text-sm text-cream-200 leading-relaxed">
                Be the first to discover our latest collections, exclusive offers, and styling inspiration. Join our community of families who value exceptional design.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={cn(
                      "w-full bg-transparent border-b border-cream-300/30 px-0 py-2",
                      "text-cream-50 placeholder:text-cream-400/60",
                      "focus:outline-none focus:border-cream-50 transition-colors duration-300",
                      "font-sans text-sm"
                    )}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  disabled={isSubmitting || !email}
                  className={cn(
                    "w-full justify-center border border-cream-300/30 text-cream-50",
                    "hover:bg-cream-50 hover:text-charcoal-950 hover:border-cream-50",
                    "transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cream-200/10 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <p className="font-sans text-sm text-cream-300/80">
              © {new Date().getFullYear()} Extreme Dept Kidz. All rights
              reserved.
            </p>

            {/* Legal Links */}
            <nav className="flex items-center gap-6">
              <FooterLink
                href="#"
                className="text-sm text-cream-300/80 hover:text-cream-50"
              >
                Privacy
              </FooterLink>
              <FooterLink
                href="#"
                className="text-sm text-cream-300/80 hover:text-cream-50"
              >
                Terms
              </FooterLink>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Footer Link Component
interface FooterLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

function FooterLink({ className, children, ...props }: FooterLinkProps) {
  return (
    <a
      className={cn(
        "block font-sans text-sm text-cream-200 hover:text-cream-50",
        "transition-colors duration-300 relative group",
        "focus:outline-none focus:ring-2 focus:ring-cream-50 focus:ring-offset-2 focus:ring-offset-charcoal-950 focus:rounded px-1",
        className
      )}
      {...props}
    >
      <span className="relative">
        {children}
        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cream-50 transition-all duration-300 group-hover:w-full" aria-hidden="true" />
      </span>
    </a>
  );
}

// Social Link Component
interface SocialLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

function SocialLink({ href, icon: Icon, label }: SocialLinkProps) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 font-sans text-sm text-cream-200 hover:text-cream-50 transition-colors duration-300 group"
      aria-label={label}
    >
      <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
      <span>{label}</span>
    </a>
  );
}

