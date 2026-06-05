'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { FaInstagram, FaTiktok, FaSnapchat, FaWhatsapp } from 'react-icons/fa'

function IconMoMo() {
  return (
    <span className="footer-payment-chip footer-momo-badge" aria-label="MTN Mobile Money" role="img">
      MoMo
    </span>
  )
}
function IconVisa() {
  return (
    <span className="footer-payment-chip" aria-label="Visa" role="img">
      <svg width="36" height="12" viewBox="0 0 36 12" aria-hidden="true">
        <text x="18" y="10" textAnchor="middle" fill="currentColor"
          style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'Arial,sans-serif', fontStyle: 'italic' }}>
          VISA
        </text>
      </svg>
    </span>
  )
}
function IconMastercard() {
  return (
    <span className="footer-payment-chip" aria-label="Mastercard" role="img">
      <svg width="36" height="16" viewBox="0 0 36 16" aria-hidden="true">
        <circle cx="14" cy="8" r="6" fill="#EB001B" />
        <circle cx="22" cy="8" r="6" fill="#F79E1B" />
      </svg>
    </span>
  )
}

const COLUMNS = [
  {
    id: 'shop',
    heading: 'Shop',
    links: [
      { label: 'All Products',  href: '/collections/all' },
      { label: 'Boys',          href: '/collections/boys' },
      { label: 'Girls',         href: '/collections/girls' },
      { label: 'New Arrivals',  href: '/collections/new-arrivals' },
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
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    links: [
      { label: 'About Us',       href: '/about' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms',          href: '/terms-of-service' },
    ],
  },
]

const PLACEHOLDER_PHONES = new Set(['233000000000', '0000000000'])

function whatsAppHref(): string | null {
  const envUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL
  if (typeof envUrl === 'string' && envUrl.length > 0) return envUrl
  const digits = (process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? '').replace(/\D/g, '')
  if (!digits || PLACEHOLDER_PHONES.has(digits)) return null
  return `https://wa.me/${digits}`
}

const SOCIAL_BASE = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/extreme_dept_kidz?igsh=bm92Zng4OGRyN3Fl',
    Icon: FaInstagram,
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@extreme_dept_kidz?_r=1&_t=ZM-92wJ2AMJUoS',
    Icon: FaTiktok,
  },
  {
    label: 'Snapchat',
    href: 'https://snapchat.com/t/dE3hKeZX',
    Icon: FaSnapchat,
  },
] as const

function buildSocialLinks(): Array<{
  label: string
  href: string
  Icon: typeof FaInstagram
}> {
  const wa = whatsAppHref()
  return [
    ...SOCIAL_BASE,
    ...(wa ? [{ label: 'WhatsApp', href: wa, Icon: FaWhatsapp }] : []),
  ]
}

function FooterColumn({ id, heading, links }: typeof COLUMNS[number]) {
  const [open, setOpen] = useState(false)

  return (
    <div className="footer-col">
      <button
        type="button"
        className="footer-col__trigger md:hidden"
        onClick={() => setOpen((v) => !v)}
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

      <p className="footer-col__heading footer-col__heading--desktop hidden md:block">
        {heading}
      </p>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            id={`footer-col-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="footer-col__links footer-col__links--mobile md:hidden"
          >
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="footer-col__link">{l.label}</Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <ul className="footer-col__links hidden md:flex md:flex-col">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="footer-col__link">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  const social = buildSocialLinks()

  return (
    <footer id="site-footer" className="site-footer" aria-label="Site footer">
      <div className="site-footer__body">
        <div className="container-luxury">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link href="/" aria-label="Extreme Dept Kidz home">
                <Image
                  src="/IMG_8640.PNG"
                  alt="Extreme Dept Kidz"
                  width={110}
                  height={33}
                  priority={false}
                  className="h-7 w-auto object-contain brightness-0 invert md:h-8"
                />
              </Link>
              <p className="footer-brand__tagline">
                Premium streetwear for young legends. Accra, Ghana.
              </p>
              <div className="footer-social" aria-label="Follow us">
                {social.map(({ label, href, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="footer-social__btn" aria-label={label}>
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {COLUMNS.map((col) => (
              <FooterColumn key={col.id} {...col} />
            ))}
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="container-luxury">
          <div className="footer-bottom">
            <p className="footer-copy">
              © {year} Extreme Dept Kidz
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
