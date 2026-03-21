"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// ─── Social icons ─────────────────────────────────────────────────
const InstagramIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);
const TikTokIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

// ─── Payment icons — inline SVG marks ─────────────────────────────
const MoMoIcon = () => (
  <svg
    width="44"
    height="26"
    viewBox="0 0 44 26"
    aria-label="MTN Mobile Money"
    role="img"
  >
    <rect width="44" height="26" rx="3" fill="#FFCC00" />
    <text
      x="22"
      y="17"
      textAnchor="middle"
      fill="#000000"
      style={{
        fontSize: "9px",
        fontWeight: 700,
        fontFamily: "Montserrat,sans-serif",
      }}
    >
      MoMo
    </text>
  </svg>
);
const VisaIcon = () => (
  <svg width="40" height="24" viewBox="0 0 40 24" aria-label="Visa" role="img">
    <rect width="40" height="24" rx="3" fill="#1a1f71" />
    <text
      x="20"
      y="16"
      textAnchor="middle"
      fill="#fff"
      style={{
        fontSize: "10px",
        fontWeight: 700,
        fontFamily: "Arial,sans-serif",
        letterSpacing: "0.02em",
        fontStyle: "italic",
      }}
    >
      VISA
    </text>
  </svg>
);
const MastercardIcon = () => (
  <svg
    width="40"
    height="24"
    viewBox="0 0 40 24"
    aria-label="Mastercard"
    role="img"
  >
    <rect width="40" height="24" rx="3" fill="#252525" />
    <circle cx="15" cy="12" r="7" fill="#EB001B" />
    <circle cx="25" cy="12" r="7" fill="#F79E1B" />
    <path
      d="M20 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 20 6.8z"
      fill="#FF5F00"
    />
  </svg>
);

// ─── Nav columns ──────────────────────────────────────────────────
const NAV_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", href: "/collections/all" },
      { label: "Boys", href: "/collections/boys" },
      { label: "Girls", href: "/collections/girls" },
      { label: "New Arrivals", href: "/collections/new-arrivals" },
      { label: "Collections", href: "/collections" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping Info", href: "/shipping-info" },
      { label: "Returns", href: "/returns-exchange" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Track Order", href: "/track-order" },
      { label: "FAQ", href: "/contact#faq" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Style Guide", href: "/style-guide" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/extreme_dept_kidz",
    icon: <InstagramIcon />,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@extreme_dept_kidz",
    icon: <TikTokIcon />,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/233000000000",
    icon: <WhatsAppIcon />,
  },
];

// ─── Mobile accordion column ───────────────────────────────────────
function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="footer-column">
      <button
        className="footer-column__heading-btn md:hidden"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="footer-column__heading">{heading}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center text-[rgba(250,248,245,0.3)]"
        >
          <ChevronDown size={15} strokeWidth={1.5} />
        </motion.span>
      </button>

      <p className="footer-column__heading hidden md:block">{heading}</p>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            key="mobile-links"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="footer-column__links md:hidden overflow-hidden"
            style={{ margin: 0, padding: 0 }}
          >
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="footer-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <ul className="footer-column__links hidden md:block">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="footer-link">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main footer ──────────────────────────────────────────────────
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="site-footer" aria-label="Site footer">
      <div className="site-footer__body">
        <div className="container-luxury">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link href="/" aria-label="Extreme Dept Kidz — home">
                <Image
                  src="/IMG_8640.PNG"
                  alt="Extreme Dept Kidz"
                  width={110}
                  height={33}
                  className="h-8 w-auto object-contain brightness-0 invert"
                />
              </Link>

              <p className="footer-brand__tagline">
                Premium streetwear for young legends.
                <br />
                Accra, Ghana.
              </p>

              <div
                className="footer-social"
                role="list"
                aria-label="Follow us on social media"
              >
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social__icon"
                    aria-label={`Follow us on ${s.label}`}
                    role="listitem"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {NAV_COLUMNS.map((col) => (
              <FooterColumn
                key={col.heading}
                heading={col.heading}
                links={col.links}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="container-luxury">
          <div className="footer-bottom-inner">
            <p className="footer-copyright">
              © {year} Extreme Dept Kidz. All rights reserved.
            </p>

            <div
              className="footer-payments"
              role="list"
              aria-label="Accepted payment methods"
            >
              <span role="listitem" aria-label="MTN Mobile Money">
                <MoMoIcon />
              </span>
              <span role="listitem" aria-label="Visa">
                <VisaIcon />
              </span>
              <span role="listitem" aria-label="Mastercard">
                <MastercardIcon />
              </span>
            </div>

            <nav className="footer-legal" aria-label="Legal links">
              <Link href="/privacy" className="footer-legal__link">
                Privacy
              </Link>
              <span className="footer-legal__sep" aria-hidden="true">
                ·
              </span>
              <Link href="/terms" className="footer-legal__link">
                Terms
              </Link>
              <span className="footer-legal__sep" aria-hidden="true">
                ·
              </span>
              <Link href="/accessibility" className="footer-legal__link">
                Accessibility
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
