"use client";

import * as React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const boysCategories = [
  {
    title: "New",
    href: "/collections/boys?filter=new",
    image: "/4671.png",
  },
  {
    title: "Tops",
    href: "/collections/boys?category=tops",
    image: "/4672.png",
  },
  {
    title: "Bottoms",
    href: "/collections/boys?category=bottoms",
    image: "/4674.png",
  },
  {
    title: "Outerwear",
    href: "/collections/boys?category=outerwear",
    image: "/IMG_4673.png",
  },
  {
    title: "Accessories",
    href: "/collections/boys?category=accessories",
    image: "/4681.png",
  },
];

export function MegaMenu({ isOpen, onClose }: MegaMenuProps): JSX.Element {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            className="fixed inset-0 bg-charcoal-900/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <m.div
            ref={menuRef}
            className="absolute top-full left-0 right-0 bg-cream-50 border-t border-cream-200 shadow-2xl z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            role="menu"
            aria-label="Boys collection menu"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {boysCategories.map((category, index) => (
                  <m.div
                    key={category.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={category.href}
                      className="group block"
                      onClick={onClose}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-lg mb-3 bg-cream-100">
                        <m.div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${category.image})` }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent" />
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-charcoal-900 group-hover:text-navy-900 transition-colors">
                        {category.title}
                      </h3>
                    </Link>
                  </m.div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-cream-200">
                <Link
                  href="/collections/boys"
                  className="inline-flex items-center space-x-2 font-sans text-sm font-medium text-charcoal-700 hover:text-navy-900 transition-colors"
                  onClick={onClose}
                >
                  <span>View All Boys&apos; Collection</span>
                  <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </Link>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
