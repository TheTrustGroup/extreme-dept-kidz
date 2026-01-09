'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export function LifestyleSection(): JSX.Element {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-cream-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side - Placeholder for future content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden rounded-lg bg-cream-200"
          >
            {/* Image will be added later */}
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <span className="text-sm uppercase tracking-widest text-charcoal-600 font-semibold">
              The Collection
            </span>

            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-charcoal-900">
              Built for Adventure,
              <br />
              Designed for Style
            </h2>

            <p className="text-lg text-charcoal-600 leading-relaxed max-w-lg">
              From the playground to the city streets, every piece is crafted
              for the modern boy who moves with confidence. Premium materials,
              thoughtful design, and styles that grow with them.
            </p>

            <Link
              href="/about"
              className="inline-flex items-center text-lg font-semibold text-navy-900 group hover:text-navy-700 transition-colors"
            >
              Discover Our Story
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
