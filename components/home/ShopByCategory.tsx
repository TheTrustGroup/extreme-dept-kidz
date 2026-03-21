"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";

interface CategoryPanelProps {
  label: string;
  sublabel: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  align: "left" | "right";
  delay?: number;
  inView: boolean;
  /** CSS object-position for `object-cover` (e.g. full-body portraits) */
  objectPosition?: string;
}

function CategoryPanel({
  label,
  sublabel,
  href,
  imageSrc,
  imageAlt,
  align,
  delay = 0,
  inView,
  objectPosition = "center",
}: CategoryPanelProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="category-panel"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={href}
        className="category-panel__link"
        aria-label={`Shop ${label}`}
      >
        <div className="category-panel__image-wrap">
          <ImageWithSkeleton
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={[
              "object-cover",
              "transition-transform duration-700 ease-out",
              hovered ? "scale-[1.04]" : "scale-100",
            ].join(" ")}
            style={{ objectPosition }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to top,
                rgba(15,23,42,0.78) 0%,
                rgba(15,23,42,0.30) 45%,
                rgba(15,23,42,0.0) 70%)`,
            }}
            aria-hidden="true"
          />
        </div>

        <div
          className={[
            "category-panel__content",
            align === "right"
              ? "items-end text-right"
              : "items-start text-left",
          ].join(" ")}
        >
          <p className="category-panel__sublabel">{sublabel}</p>
          <h3 className="category-panel__title">{label}</h3>
          <motion.span
            className="category-panel__cta"
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            Shop Now
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
          </motion.span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ShopByCategory() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <section
      ref={ref}
      className="section-lg"
      aria-labelledby="category-heading"
    >
      <div className="container-luxury">
        <motion.div
          className="home-section-header mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <p className="home-section-eyebrow">Collections</p>
            <h2 id="category-heading" className="home-section-title">
              Shop by Category
            </h2>
          </div>
        </motion.div>

        <div className="category-panels-grid">
          <CategoryPanel
            label="Boys"
            sublabel="Ages 2–12"
            href="/collections/boys"
            imageSrc="/boys-hero.jpg"
            imageAlt="Young boy in premium streetwear — Extreme Dept Kidz Boys Collection"
            align="left"
            delay={0}
            inView={inView}
            objectPosition="center 20%"
          />
          <CategoryPanel
            label="Girls"
            sublabel="Ages 2–12"
            href="/collections/girls"
            imageSrc="/girls-hero.jpg"
            imageAlt="Young girl in premium streetwear — Extreme Dept Kidz Girls Collection"
            align="right"
            delay={0.1}
            inView={inView}
            objectPosition="center 15%"
          />
        </div>
      </div>
    </section>
  );
}
