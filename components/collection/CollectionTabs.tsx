"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const TABS = [
  { label: "All", href: "/collections/all" },
  { label: "Boys", href: "/collections/boys" },
  { label: "Girls", href: "/collections/girls" },
  { label: "New Arrivals", href: "/collections/new-arrivals" },
];

export default function CollectionTabs() {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setShowFade(el.scrollWidth > el.clientWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="collection-tabs-wrap">
      <div
        ref={scrollRef}
        className="collection-tabs"
        role="navigation"
        aria-label="Browse collections"
      >
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={["collection-tab", active ? "collection-tab--active" : ""].join(
                " "
              )}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
              {active && (
                <motion.span
                  layoutId="tab-indicator"
                  className="collection-tab__indicator"
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </Link>
          );
        })}
      </div>
      {showFade && (
        <div className="collection-tabs-fade" aria-hidden="true" />
      )}
    </div>
  );
}
