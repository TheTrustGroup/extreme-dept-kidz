'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

// ─── Social SVG icons ─────────────────────────────────────────────
function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2.5"/>
    </svg>
  )
}

function IconTikTok() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  )
}

function IconSnapchat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.004 2c-1.894 0-5.148.535-5.28 4.759-.032.887 0 1.71 0 1.71s-.41.19-.878.19c-.477 0-.846-.284-.846-.284s-.082.738.738 1.137c0 0-.205.546-.656.967-.41.38-1.025.517-1.025.517s.164.7 1.558.888c0 0 .082.45.246.697 0 0-.533.26-1.107.26-.39 0-.738-.095-.738-.095s.082.82 2.133 1.23c0 0 .492 1.258 2.707 1.258.082 0 .205 0 .328-.013 0 0-1.025 1.066-3.609 1.066h-.205c0 .013.082.902 3.568 1.366 0 0 .41.93 1.107 1.546.451.396.943.6 1.968.6 1.025 0 1.517-.204 1.968-.6.697-.615 1.107-1.546 1.107-1.546 3.486-.464 3.568-1.353 3.568-1.366h-.205c-2.584 0-3.609-1.066-3.609-1.066.123.013.246.013.328.013 2.215 0 2.707-1.258 2.707-1.258 2.05-.41 2.133-1.23 2.133-1.23s-.348.095-.738.095c-.574 0-1.107-.26-1.107-.26.164-.246.246-.697.246-.697 1.394-.19 1.558-.888 1.558-.888s-.615-.137-1.025-.517c-.451-.42-.656-.967-.656-.967.82-.4.738-1.137.738-1.137s-.369.284-.846.284c-.469 0-.878-.19-.878-.19s.032-.823 0-1.71C17.152 2.535 13.898 2 12.004 2z"/>
    </svg>
  )
}

function IconWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413A11.815 11.815 0 0 0 12.05 0z"/>
    </svg>
  )
}

// ─── Payment icons ─────────────────────────────────────────────────
function IconMoMo() {
  return (
    <svg width="44" height="26" viewBox="0 0 44 26" aria-label="MTN Mobile Money" role="img">
      <rect width="44" height="26" rx="4" fill="#FFCC00"/>
      <text x="22" y="17" textAnchor="middle" fill="#000"
        style={{ fontSize: '9px', fontWeight: 700, fontFamily: 'Montserrat,sans-serif', letterSpacing: '0.02em' }}>
        MoMo
      </text>
    </svg>
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
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms',          href: '/terms' },
    ],
  },
]

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com/extremedeptkidz', Icon: IconInstagram },
  { label: 'TikTok',    href: 'https://tiktok.com/@extremedeptkidz',   Icon: IconTikTok   },
  { label: 'Snapchat',  href: 'https://snapchat.com/add/extremedeptkidz', Icon: IconSnapchat },
  { label: 'WhatsApp',  href: 'https://wa.me/233000000000',            Icon: IconWhatsApp },
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
                    <Icon />
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
                { l: 'Privacy',       h: '/privacy' },
                { l: 'Terms',         h: '/terms' },
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
