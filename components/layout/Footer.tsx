'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { FaInstagram, FaTiktok, FaSnapchat, FaWhatsapp } from 'react-icons/fa'

// ─── Payment icons ─────────────────────────────────────────────────
function IconMoMo() {
  return (
    <span
      className="footer-momo-badge"
      aria-label="MTN Mobile Money"
      role="img"
    >
      MoMo
    </span>
  )
}
function IconVisa() {
  return (
    <svg width="44" height="26" viewBox="0 0 44 26" aria-label="Visa" role="img">
      <rect width="44" height="26" rx="4" fill="#1a1f71"/>
      <text x="22" y="17" textAnchor="middle" fill="#fff"
        style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'Arial,sans-serif', fontStyle: 'italic' }}>
        VISA
      </text>
    </svg>
  )
}
function IconMastercard() {
  return (
    <svg width="44" height="26" viewBox="0 0 44 26" aria-label="Mastercard" role="img">
      <rect width="44" height="26" rx="4" fill="#252525"/>
      <circle cx="17" cy="13" r="8" fill="#EB001B"/>
      <circle cx="27" cy="13" r="8" fill="#F79E1B"/>
      <path d="M22 7.2a8 8 0 0 1 0 11.6A8 8 0 0 1 22 7.2z" fill="#FF5F00"/>
    </svg>
  )
}

// ─── Nav data ──────────────────────────────────────────────────────
const COLUMNS = [
  {
    id: 'shop',
    heading: 'Shop',
    links: [
      { label: 'All Products',  href: '/collections/all' },
      { label: 'Boys',          href: '/collections/boys' },
      { label: 'Girls',         href: '/collections/girls' },
      { label: 'New Arrivals',  href: '/collections/new-arrivals' },
      { label: 'Collections',   href: '/collections' },
    ],
  },
  {
    id: 'help',
    heading: 'Help',
    links: [
      { label: 'Contact Us',    href: '/contact' },
      { label: 'Shipping Info', href: '/shipping-info' },
      { label: 'Returns',       href: '/returns-exchange' },
      { label: 'Size Guide',    href: '/size-guide' },
      { label: 'Track Order',   href: '/track-order' },
      { label: 'FAQ',           href: '/contact#faq' },
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    links: [
      { label: 'About Us',       href: '/about' },
      { label: 'Style Guide',    href: '/style-guide' },
      { label: 'Accessibility',  href: '/accessibility' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms',          href: '/terms-of-service' },
    ],
  },
]

const SOCIAL = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/extremedeptkidz',
    Icon: FaInstagram,
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@extremedeptkidz',
    Icon: FaTiktok,
  },
  {
    label: 'Snapchat',
    href: 'https://snapchat.com/add/extremedeptkidz',
    Icon: FaSnapchat,
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/233000000000',
    Icon: FaWhatsapp,
  },
]

// ─── Single accordion column ───────────────────────────────────────
function FooterColumn({ id, heading, links }: typeof COLUMNS[number]) {
  const [open, setOpen] = useState(false)

  return (
    <div className="footer-col">

      {/* ── Mobile: tappable row ─────────────────────────────── */}
      <button
        className="footer-col__trigger md:hidden"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-controls={`footer-col-${id}`}
      >
        <span className="footer-col__heading">{heading}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="footer-col__chevron"
        >
          <ChevronDown size={14} strokeWidth={1.5} />
        </motion.span>
      </button>

      {/* ── Desktop: always-visible heading ──────────────────── */}
      <p className="footer-col__heading footer-col__heading--desktop hidden md:block">
        {heading}
      </p>

      {/* ── Mobile: animated link panel ──────────────────────── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            id={`footer-col-${id}`}
            key="links"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="footer-col__links flex flex-col pb-4 md:hidden"
            style={{ overflow: 'hidden', margin: 0 }}
          >
            {links.map(l => (
              <li key={l.href}>
                <Link href={l.href} className="footer-col__link">{l.label}</Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* ── Desktop: always-visible links ────────────────────── */}
      <ul className="footer-col__links hidden md:flex md:flex-col">
        {links.map(l => (
          <li key={l.href}>
            <Link href={l.href} className="footer-col__link">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Footer ────────────────────────────────────────────────────────
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="site-footer" className="site-footer" aria-label="Site footer">

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="site-footer__body">
        <div className="container-luxury">
          <div className="footer-grid">

            {/* Brand column */}
            <div className="footer-brand" style={{ backgroundColor: 'var(--color-navy)' }}>
              <Link href="/" aria-label="Extreme Dept Kidz home">
                <Image
                  src="/IMG_8640.PNG"
                  alt="Extreme Dept Kidz"
                  width={110}
                  height={33}
                  priority={false}
                  className="h-8 w-auto object-contain brightness-0 invert"
                />
              </Link>
              <p className="footer-brand__tagline">
                Premium streetwear for young legends.<br />Accra, Ghana.
              </p>
              <div className="footer-social" aria-label="Follow us">
                {SOCIAL.map(({ label, href, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="footer-social__btn" aria-label={label}>
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            {COLUMNS.map(col => (
              <FooterColumn key={col.id} {...col} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────── */}
      <div className="site-footer__bottom">
        <div className="container-luxury">
          <div className="footer-bottom">
            <p className="footer-copy">
              © {year} Extreme Dept Kidz. All rights reserved.
            </p>
            <div className="footer-payments" aria-label="Accepted payment methods">
              <IconMoMo />
              <IconVisa />
              <IconMastercard />
            </div>
            <nav className="footer-legal" aria-label="Legal">
              {[
                { l: 'Privacy',       h: '/privacy-policy' },
                { l: 'Terms',         h: '/terms-of-service' },
                { l: 'Accessibility', h: '/accessibility' },
              ].map(({ l, h }) => (
                <Link key={h} href={h} className="footer-legal__link">{l}</Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
