'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import ProductCard from '@/components/product/ProductCard'
import type { ProductCardProps } from '@/components/product/ProductCard'

interface JustDroppedProps {
  products:     ProductCardProps[]
  onAddToCart?: (id: string) => void
}

export default function JustDropped({ products, onAddToCart }: JustDroppedProps) {
  const ref    = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px 0px' })

  const displayProducts =
    products.length > 2 && products.length % 2 !== 0
      ? products.slice(0, products.length - 1)
      : products

  return (
    <section ref={ref} className="jd-section" aria-labelledby="jd-heading">
      <div className="container-luxury">

        {/* Header */}
        <motion.div
          className="jd-header"
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <p className="home-section-eyebrow">SS25</p>
            <h2 id="jd-heading" className="home-section-title">Just Dropped</h2>
          </div>
          <Link href="/collections/new-arrivals" className="jd-viewall">
            View All
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </motion.div>

        {/* Grid — always 2 columns on mobile, 4 on desktop */}
        {displayProducts.length > 0 ? (
          <motion.div
            className="jd-grid"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {displayProducts.map((p, i) => (
              <ProductCard
                key={p.id}
                {...p}
                index={i}
                priority={i < 2}
                onAddToCart={onAddToCart}
              />
            ))}
          </motion.div>
        ) : (
          /* Empty state */
          <div className="jd-empty">
            <p className="jd-empty__title">New drops coming soon</p>
            <Link href="/collections/all" className="btn-secondary"
              style={{ height: '44px', padding: '0 24px', fontSize: '11px' }}>
              Shop All
            </Link>
          </div>
        )}

      </div>
    </section>
  )
}
