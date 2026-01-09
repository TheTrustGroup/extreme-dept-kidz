'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export function ImageShowcase(): JSX.Element {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Block 1 - Casual - Placeholder for future content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="group relative aspect-[3/4] overflow-hidden bg-cream-100 cursor-pointer rounded-lg"
          >
            <Link href="/collections/boys?style=casual">
              <div className="absolute inset-0 bg-cream-200" />
              <div className="absolute inset-0 flex items-end p-8">
                <div className="text-charcoal-900">
                  <h3 className="text-3xl font-serif font-bold mb-2">
                    Everyday Essentials
                  </h3>
                  <p className="text-charcoal-700 mb-4">
                    Comfortable, versatile pieces for daily adventures
                  </p>
                  <span className="inline-flex items-center text-sm font-semibold uppercase tracking-wider">
                    Shop Casual
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Image Block 2 - Active - Placeholder for future content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative aspect-[3/4] overflow-hidden bg-cream-100 cursor-pointer rounded-lg"
          >
            <Link href="/collections/boys?style=active">
              <div className="absolute inset-0 bg-cream-200" />
              <div className="absolute inset-0 flex items-end p-8">
                <div className="text-charcoal-900">
                  <h3 className="text-3xl font-serif font-bold mb-2">
                    Playground Ready
                  </h3>
                  <p className="text-charcoal-700 mb-4">
                    Performance meets style for non-stop energy
                  </p>
                  <span className="inline-flex items-center text-sm font-semibold uppercase tracking-wider">
                    Shop Active
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
