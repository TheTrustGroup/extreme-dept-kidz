"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Minus, ChevronDown, Star, Heart, Share2, CheckCircle } from "lucide-react";
import type { Product, ProductSize } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { useProductPurchase } from "@/lib/hooks/use-product-purchase";
import { Button } from "@/components/ui/button";
import { H1, H3, Body } from "@/components/ui/typography";
import { cn, formatPrice } from "@/lib/utils";

interface ProductInfoProps {
  product: Product;
  className?: string;
  purchaseState?: ReturnType<typeof useProductPurchase>;
}

/**
 * ProductInfo Component
 * 
 * Premium product information section with size selection,
 * quantity selector, and add to cart functionality.
 * 
 * On mobile: Purchase controls (size, quantity, add to cart) are hidden
 * and handled by StickyAddToCart component for better UX.
 */
export function ProductInfo({ product, className, purchaseState }: ProductInfoProps): JSX.Element {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [expandedDetails, setExpandedDetails] = React.useState<string | null>(
    null
  );

  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const { open: openCart } = useCartDrawer();

  // Use shared purchase state if provided, otherwise create local state (for backward compatibility)
  const localPurchaseState = useProductPurchase(product);
  const {
    selectedSize,
    quantity,
    availableSizes,
    handleSizeSelect,
    handleQuantityChange,
  } = purchaseState || localPurchaseState;

  // Check if product is on sale
  const isOnSale = product.originalPrice && product.originalPrice > product.price;

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedSize) {
      // Could show error toast here
      return;
    }

    setIsAddingToCart(true);

    // Simulate async operation (in real app, this might be an API call)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Add item with quantity
    // Check if item already exists in cart
    const currentItems = useCartStore.getState().items;
    const existingItem = currentItems.find(
      (item) => item.product.id === product.id && item.selectedSize === selectedSize.size
    );

    if (existingItem && existingItem.id) {
      // Update existing item quantity by adding the new quantity
      updateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      // Add new item(s) - add once, then update quantity if needed
      addItem(product, selectedSize.size);
      // If quantity > 1, update it after a brief delay to ensure state is updated
      if (quantity > 1) {
        setTimeout(() => {
          const updatedItems = useCartStore.getState().items;
          const newItem = updatedItems.find(
            (item) => item.product.id === product.id && item.selectedSize === selectedSize.size
          );
          if (newItem && newItem.id) {
            updateQuantity(newItem.id, quantity);
          }
        }, 10);
      }
    }

    setIsAddingToCart(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Auto-open cart drawer
    openCart();
  };

  // Toggle accordion section
  const toggleDetails = (section: string) => {
    setExpandedDetails(expandedDetails === section ? null : section);
  };

  const canAddToCart = selectedSize && product.inStock;

  return (
    <div className={cn("space-y-4 sm:space-y-6 md:space-y-8", className)}>
      {/* Product Name with Actions - Glass Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass-panel rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <H1 className="text-charcoal-900 mb-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl line-clamp-2">
              {product.name}
            </H1>
            {product.category && (
              <Body className="text-xs sm:text-sm text-charcoal-500 uppercase tracking-wider">
                {product.category.name}
              </Body>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
              <motion.button
                className="p-2.5 rounded-lg glass-card hover:bg-cream-100/80 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Add to wishlist"
              >
                <Heart className="w-5 h-5 text-charcoal-700" />
              </motion.button>
              <motion.button
                className="p-2.5 rounded-lg glass-card hover:bg-cream-100/80 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Share product"
              >
                <Share2 className="w-5 h-5 text-charcoal-700" />
              </motion.button>
          </div>
        </div>

        {/* Price - Glass Panel */}
        <div className="flex items-baseline gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-cream-200/60 flex-wrap">
          <span className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-charcoal-900">
            {formatPrice(product.price)}
          </span>
          {isOnSale && product.originalPrice && (
            <span className="font-sans text-base sm:text-lg text-charcoal-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          {isOnSale && (
            <span className="px-2.5 sm:px-3 py-1 bg-honey-100 text-honey-600 text-xs font-semibold uppercase rounded-full border border-honey-200">
              Sale
            </span>
          )}
        </div>
      </motion.div>

      {/* Reviews & Rating - Glass Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        className="glass-panel rounded-xl p-4 sm:p-6"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  star <= 4 ? "fill-honey-400 text-honey-400" : "text-cream-300"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-charcoal-600 font-semibold">4.8</span>
          <span className="text-sm text-charcoal-500">(127 reviews)</span>
          <span className="px-3 py-1 bg-blush-100 text-blush-700 text-xs font-semibold rounded-full border border-blush-200">
            Bestseller
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <Body className="text-sm sm:text-base text-charcoal-700 leading-relaxed mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-cream-200/60">
            {product.description}
          </Body>
        )}
      </motion.div>

      {/* Size Selector - Glass Panel - Desktop Only */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
        className="hidden lg:block glass-panel rounded-xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <label className="font-serif text-sm font-semibold text-charcoal-900 uppercase tracking-wider">
            Size
          </label>
          {!selectedSize && (
            <span className="font-sans text-xs text-charcoal-500">
              Select a size
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {product.sizes.map((size) => {
            const isSelected = selectedSize?.size === size.size;
            const isAvailable = size.inStock;

            return (
              <motion.button
                key={size.size}
                onClick={() => isAvailable && handleSizeSelect(size)}
                disabled={!isAvailable}
                className={cn(
                  "relative px-4 py-3 rounded-lg border-2 transition-all duration-300",
                  "font-sans text-sm font-medium",
                  "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                  isSelected
                    ? "border-navy-900 bg-navy-900 text-cream-50 shadow-glass"
                    : isAvailable
                      ? "border-cream-200 text-charcoal-900 hover:border-navy-600 hover:bg-cream-100 hover:shadow-glass"
                      : "border-cream-200 text-charcoal-400 bg-cream-50 cursor-not-allowed opacity-50"
                )}
                whileHover={isAvailable ? { scale: 1.05, y: -2 } : {}}
                whileTap={isAvailable ? { scale: 0.95 } : {}}
                transition={{ duration: 0.2, ease: "easeOut" }}
                aria-label={`Size ${size.size}${!isAvailable ? " - Out of stock" : ""}`}
              >
                {size.size}
                {!isAvailable && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-charcoal-400 rounded-full" />
                )}
              </motion.button>
            );
          })}
        </div>
        {availableSizes.length === 0 && (
          <Body className="text-sm text-charcoal-600">
            This product is currently out of stock in all sizes.
          </Body>
        )}
      </motion.div>

      {/* Quantity Selector - Glass Panel - Desktop Only */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
        className="hidden lg:block glass-panel rounded-xl p-6"
      >
        <label className="font-serif text-sm font-semibold text-charcoal-900 uppercase tracking-wider block mb-4">
          Quantity
        </label>
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className={cn(
              "p-2.5 rounded-lg glass-card",
              "hover:bg-cream-200/80 transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            whileHover={{ scale: quantity > 1 ? 1.1 : 1 }}
            whileTap={{ scale: quantity > 1 ? 0.9 : 1 }}
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4 text-charcoal-900" />
          </motion.button>
          <span className="font-sans text-lg font-semibold text-charcoal-900 min-w-[3rem] text-center">
            {quantity}
          </span>
          <motion.button
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= 10}
            className={cn(
              "p-2.5 rounded-lg glass-card",
              "hover:bg-cream-200/80 transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            whileHover={{ scale: quantity < 10 ? 1.1 : 1 }}
            whileTap={{ scale: quantity < 10 ? 0.9 : 1 }}
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4 text-charcoal-900" />
          </motion.button>
        </div>
      </motion.div>

      {/* Add to Cart & Buy Now Buttons - Glass Panel - Desktop Only */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
        className="hidden lg:block glass-panel rounded-xl p-6 space-y-3"
      >
        <motion.div
          initial={false}
          animate={{
            scale: showSuccess ? 0.95 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleAddToCart}
            disabled={!canAddToCart || isAddingToCart}
            loading={isAddingToCart}
            loadingText="Adding..."
            className={cn(
              "w-full py-6 text-lg font-semibold uppercase tracking-wide",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-300",
              showSuccess && "bg-sage-600 hover:bg-sage-700"
            )}
          >
            {showSuccess ? (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Added!
              </span>
            ) : !product.inStock
              ? "Currently Unavailable"
              : !selectedSize
                ? "Please Select a Size"
                : "Add to Cart"}
          </Button>
        </motion.div>
        
        <Button
          variant="secondary"
          size="lg"
          disabled={!canAddToCart}
          className={cn(
            "w-full py-6 text-lg font-semibold uppercase tracking-wide",
            "border-2 border-navy-900 text-navy-900",
            "hover:bg-navy-900 hover:text-cream-50 hover:shadow-glass-lg",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-300"
          )}
        >
          Buy Now
        </Button>

        {/* Success Feedback */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="flex items-center gap-2 p-4 bg-forest-50 border border-forest-200 rounded-lg"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                  delay: 0.1,
                }}
              >
                <Check className="w-5 h-5 text-forest-600 flex-shrink-0" />
              </motion.div>
              <Body className="text-sm text-forest-700 font-medium">
                Item added to your cart
              </Body>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Trust Indicators - Glass Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.5 }}
        className="glass-panel rounded-xl p-6 space-y-3"
      >
        <div className="flex items-center gap-3 text-sm text-charcoal-600">
          <CheckCircle className="w-5 h-5 text-sage-600 flex-shrink-0" />
          <span>Free shipping on orders over ₵800</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-charcoal-600">
          <CheckCircle className="w-5 h-5 text-sage-600 flex-shrink-0" />
          <span>Free returns within 30 days</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-charcoal-600">
          <CheckCircle className="w-5 h-5 text-sage-600 flex-shrink-0" />
          <span>Secure checkout guaranteed</span>
        </div>
      </motion.div>

      {/* Product Details Accordion - Glass Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.6 }}
        className="glass-panel rounded-xl p-6 space-y-2"
      >
        <DetailSection
          title="Product Details"
          content="Premium cotton blend bomber with embroidered details. A modern classic for the style-conscious boy. Built for adventure, designed for style."
          isExpanded={expandedDetails === "details"}
          onToggle={() => toggleDetails("details")}
        />
        <DetailSection
          title="Materials & Care"
          content="Premium organic cotton, sustainably sourced. Machine wash cold with like colors. Tumble dry low. Do not bleach. Iron on low heat if needed."
          isExpanded={expandedDetails === "materials"}
          onToggle={() => toggleDetails("materials")}
        />
        <DetailSection
          title="Size & Fit"
          content="True to size. Model is wearing size 8. For a relaxed fit, size up. For a fitted look, size down."
          isExpanded={expandedDetails === "size"}
          onToggle={() => toggleDetails("size")}
        />
        <DetailSection
          title="Shipping & Returns"
          content="Free shipping on orders over ₵800. Easy returns within 30 days. Items must be unworn with tags attached. Processing time: 1-2 business days."
          isExpanded={expandedDetails === "shipping"}
          onToggle={() => toggleDetails("shipping")}
        />
      </motion.div>

      {/* Trust Badges - Glass Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.7 }}
        className="glass-panel rounded-xl p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TrustBadge
          icon="🚚"
          title="Free Shipping"
          description="On orders over ₵800"
        />
        <TrustBadge
          icon="↩️"
          title="Easy Returns"
          description="30-day return policy"
        />
        <TrustBadge
          icon="🔒"
          title="Secure Checkout"
          description="SSL encrypted"
        />
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Detail Section Component
 * Collapsible accordion section
 */
interface DetailSectionProps {
  title: string;
  content: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function DetailSection({
  title,
  content,
  isExpanded,
  onToggle,
}: DetailSectionProps): JSX.Element {
  return (
    <div className="border-b border-cream-200 last:border-b-0">
      <motion.button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded-lg px-2 -mx-2 hover:bg-cream-50 transition-colors duration-200"
        aria-expanded={isExpanded}
        whileHover={{ x: 2 }}
        transition={{ duration: 0.2 }}
      >
        <H3 className="text-base font-semibold text-charcoal-900">{title}</H3>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-charcoal-500" />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <Body className="text-sm text-charcoal-600 pb-4 leading-relaxed pl-2">
              {content}
            </Body>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Trust Badge Component
 */
interface TrustBadgeProps {
  icon: string;
  title: string;
  description: string;
}

function TrustBadge({ icon, title, description }: TrustBadgeProps) {
  return (
    <div className="text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <Body className="font-semibold text-charcoal-900 text-sm mb-1">
        {title}
      </Body>
      <Body className="text-xs text-charcoal-600">{description}</Body>
    </div>
  );
}

