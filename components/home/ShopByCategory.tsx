'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface PanelProps {
  label:          string
  sublabel:       string
  href:           string
  src:            string
  alt:            string
  objectPosition: string
  delay:          number
  inView:         boolean
}

function Panel({ label, sublabel, href, src, alt, objectPosition, delay, inView }: PanelProps) {
  const [loaded, setLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className="cat-panel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={href} className="cat-panel__link" aria-label={`Shop ${label}`}>

        {/* Image fills entire panel via absolute positioning */}
        <div className="cat-panel__img-wrap">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 639px) 100vw, 50vw"
            quality={90}
            className={[
              'cat-panel__img object-cover',
              'transition-transform duration-700 ease-out',
              hovered ? 'scale-[1.04]' : 'scale-100',
              loaded ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
            style={{ objectPosition }}
            onLoad={() => setLoaded(true)}
          />
          <div className="cat-panel__gradient" aria-hidden="true" />
        </div>

        {/* Text sits over image via z-index in CSS */}
        <div className="cat-panel__content">
          <p className="cat-panel__sublabel">{sublabel}</p>
          <h3 className="cat-panel__title">{label}</h3>
          <motion.span
            className="cat-panel__cta"
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ duration: 0.2 }}
          >
            Shop Now
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </motion.span>
        </div>
      </Link>
    </motion.div>
  )
}

export default function ShopByCategory() {
  const ref    = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })

  return (
    <section ref={ref} className="cat-section" aria-labelledby="cat-heading">
      <div className="container-luxury">
        <motion.div
          className="cat-header"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="home-section-eyebrow">Collections</p>
          <h2 id="cat-heading" className="home-section-title">Shop by Category</h2>
        </motion.div>

        <div className="cat-grid">
          <Panel
            label="Boys"
            sublabel="Ages 2–12"
            href="/collections/boys"
            src="/boys-hero.jpg"
            alt="Young boy in premium streetwear — EDK Boys Collection"
            objectPosition="center 10%"
            delay={0}
            inView={inView}
          />
          <Panel
            label="Girls"
            sublabel="Ages 2–12"
            href="/collections/girls"
            src="/girls-hero.jpg"
            alt="Young girl in premium streetwear — EDK Girls Collection"
            objectPosition="center 5%"
            delay={0.1}
            inView={inView}
          />
        </div>
      </div>
    </section>
  )
}
