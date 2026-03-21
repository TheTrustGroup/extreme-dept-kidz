"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ProductGrid from "@/components/product/ProductGrid";
import CollectionTabs from "@/components/collection/CollectionTabs";
import type { ProductCardProps } from "@/components/product/ProductCard";

interface JustDroppedProps {
  products: ProductCardProps[];
  onAddToCart?: (id: string) => void;
}

export default function JustDropped({
  products,
  onAddToCart,
}: JustDroppedProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <section
      ref={ref}
      className="section container-luxury"
      aria-labelledby="just-dropped-heading"
    >
      <motion.div
        className="home-section-header"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <p className="home-section-eyebrow">SS25</p>
          <h2 id="just-dropped-heading" className="home-section-title">
            Just Dropped
          </h2>
        </div>
        <Link href="/collections/new-arrivals" className="home-section-viewall">
          View All
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </motion.div>

      <div className="container-luxury mb-6">
        <CollectionTabs />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <ProductGrid
          products={products}
          onAddToCart={onAddToCart}
          columns={4}
        />
      </motion.div>

      {products.length > 2 && (
        <motion.div
          className="mt-8 flex justify-center lg:hidden"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Link
            href="/collections/new-arrivals"
            className="btn-secondary"
            style={{ height: "48px", padding: "0 32px", fontSize: "11px" }}
          >
            View All New Arrivals
          </Link>
        </motion.div>
      )}
    </section>
  );
}
