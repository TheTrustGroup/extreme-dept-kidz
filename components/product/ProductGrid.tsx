"use client";

import { motion } from "framer-motion";
import ProductCard, { type ProductCardProps } from "./ProductCard";
import EmptyState from "@/components/ui/EmptyState";

// ─── Skeleton card ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="product-card product-card--skeleton"
      aria-hidden="true"
    >
      <div className="product-card__image-wrap">
        <div className="product-card__skeleton" />
      </div>
      <div className="product-card__info">
        <div
          className="skeleton-line"
          style={{ width: "70%", height: "10px", marginBottom: "6px" }}
        />
        <div
          className="skeleton-line"
          style={{ width: "40%", height: "14px" }}
        />
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────
interface ProductGridProps {
  products: ProductCardProps[];
  loading?: boolean;
  skeletonCount?: number;
  collectionName?: string;
  onQuickView?: (id: string) => void;
  onAddToCart?: (id: string) => void;
  columns?: 2 | 3 | 4;
}

// ─── Grid ─────────────────────────────────────────────────────────
export default function ProductGrid({
  products,
  loading = false,
  skeletonCount = 4,
  collectionName,
  onQuickView,
  onAddToCart,
  columns,
}: ProductGridProps) {
  const gridClass = columns
    ? {
        2: "product-grid product-grid--2",
        3: "product-grid product-grid--3",
        4: "product-grid product-grid--4",
      }[columns]
    : "product-grid";

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className={gridClass}>
        <EmptyState
          illustration="grid"
          title="Nothing here yet"
          description={
            collectionName
              ? `No products found in ${collectionName}.`
              : "Check back soon — new drops coming."
          }
          cta={{ label: "Shop All", href: "/collections/all" }}
          className="col-span-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      className={gridClass}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
    >
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          {...product}
          index={i}
          onQuickView={onQuickView}
          onAddToCart={onAddToCart}
          priority={i < 4}
        />
      ))}
    </motion.div>
  );
}
