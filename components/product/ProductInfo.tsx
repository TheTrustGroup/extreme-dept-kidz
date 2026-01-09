"use client";

import * as React from "react";
import { m, AnimatePresence } from "framer-motion";
import { Check, Plus, Minus, ChevronDown, Star, Heart, Share2, CheckCircle } from "lucide-react";
import type { Product, ProductSize } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer";
import { Button } from "@/components/ui/button";
import { H1, H3, Body } from "@/components/ui/typography";
import { cn, formatPrice } from "@/lib/utils";

interface ProductInfoProps {
  product: Product;
  className?: string;
}

/**
 * ProductInfo Component
 * 
 * Premium product information section with size selection,
 * quantity selector, and add to cart functionality.
 */
export function ProductInfo({ product, className }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = React.useState<ProductSize | null>(
    null
  );
  const [quantity, setQuantity] = React.useState(1);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [expandedDetails, setExpandedDetails] = React.useState<string | null>(
    null
  );

  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const { open: openCart } = useCartDrawer();

  // Get available sizes
  const availableSizes = product.sizes.filter((size) => size.inStock);

  // Check if product is on sale
  const isOnSale = product.originalPrice && product.originalPrice > product.price;

  // Set initial selected size to first available
  React.useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  // Handle size selection
  const handleSizeSelect = (size: ProductSize) => {
    setSelectedSize(size);
  };

  // Handle quantity change
  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, 10)));
  };

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
    <div className={cn("space-y-6 md:space-y-8", className)}>
      {/* Breadcrumb */}
      <div className="text-sm text-charcoal-500">
        <span className="hover:text-charcoal-900 transition-colors">Home</span>
        <span className="mx-2">/</span>
        <span className="hover:text-charcoal-900 transition-colors">Boys</span>
        <span className="mx-2">/</span>
        <span className="hover:text-charcoal-900 transition-colors">{product.category?.name || "Product"}</span>
        <span className="mx-2">/</span>
        <span className="text-charcoal-900 font-medium">{product.name}</span>
      </div>

      {/* Product Name with Actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <H1 className="text-charcoal-900 mb-2 text-2xl md:text-3xl lg:text-4xl">{product.name}</H1>
          {product.category && (
            <Body className="text-sm text-charcoal-500 uppercase tracking-wider">
              {product.category.name}
            </Body>
          )}
        </div>
        <div className="flex items-center gap-2">
          <m.button
            className="p-2 rounded-lg border border-cream-200 hover:bg-cream-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Add to wishlist"
          >
            <Heart className="w-5 h-5 text-charcoal-700" />
          </m.button>
          <m.button
            className="p-2 rounded-lg border border-cream-200 hover:bg-cream-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Share product"
          >
            <Share2 className="w-5 h-5 text-charcoal-700" />
          </m.button>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-3xl md:text-4xl font-semibold text-charcoal-900">
          {formatPrice(product.price)}
        </span>
        {isOnSale && product.originalPrice && (
          <span className="font-sans text-lg text-charcoal-500 line-through">
            {formatPrice(product.originalPrice)}
          </span>
        )}
        {isOnSale && (
          <span className="px-2 py-1 bg-navy-900 text-cream-50 text-xs font-semibold uppercase rounded">
            Sale
          </span>
        )}
      </div>

      {/* Reviews & Rating */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-5 h-5",
                star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-cream-300"
              )}
            />
          ))}
        </div>
        <span className="text-sm text-charcoal-600 font-medium">4.8</span>
        <span className="text-sm text-charcoal-500">(127 reviews)</span>
        <span className="px-2 py-1 bg-forest-50 text-forest-700 text-xs font-semibold rounded">
          Bestseller
        </span>
      </div>

      {/* Description */}
      {product.description && (
        <Body className="text-lg text-charcoal-700 leading-relaxed">
          {product.description}
        </Body>
      )}

      {/* Size Selector */}
      <div className="space-y-4">
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
              <button
                key={size.size}
                onClick={() => isAvailable && handleSizeSelect(size)}
                disabled={!isAvailable}
                className={cn(
                  "relative px-4 py-3 rounded-lg border-2 transition-all duration-200",
                  "font-sans text-sm font-medium",
                  "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                  isSelected
                    ? "border-charcoal-900 bg-charcoal-900 text-cream-50"
                    : isAvailable
                      ? "border-cream-200 text-charcoal-900 hover:border-charcoal-400 hover:bg-cream-50"
                      : "border-cream-200 text-charcoal-400 bg-cream-50 cursor-not-allowed opacity-50"
                )}
                aria-label={`Size ${size.size}${!isAvailable ? " - Out of stock" : ""}`}
              >
                {size.size}
                {!isAvailable && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-charcoal-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
        {availableSizes.length === 0 && (
          <Body className="text-sm text-charcoal-600">
            This product is currently out of stock in all sizes.
          </Body>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="space-y-4">
        <label className="font-serif text-sm font-semibold text-charcoal-900 uppercase tracking-wider block">
          Quantity
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className={cn(
              "p-2 rounded-lg border border-cream-200",
              "hover:bg-cream-100 transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4 text-charcoal-900" />
          </button>
          <span className="font-sans text-lg font-semibold text-charcoal-900 min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= 10}
            className={cn(
              "p-2 rounded-lg border border-cream-200",
              "hover:bg-cream-100 transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4 text-charcoal-900" />
          </button>
        </div>
      </div>

      {/* Add to Cart & Buy Now Buttons */}
      <div className="space-y-3">
        <m.div
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
              "transition-all duration-200",
              showSuccess && "bg-forest-600 hover:bg-forest-700"
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
        </m.div>
        
        <Button
          variant="secondary"
          size="lg"
          disabled={!canAddToCart}
          className={cn(
            "w-full py-6 text-lg font-semibold uppercase tracking-wide",
            "border-2 border-charcoal-900 text-charcoal-900",
            "hover:bg-charcoal-900 hover:text-cream-50",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200"
          )}
        >
          Buy Now
        </Button>

        {/* Success Feedback */}
        <AnimatePresence>
          {showSuccess && (
            <m.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="flex items-center gap-2 p-4 bg-forest-50 border border-forest-200 rounded-lg"
            >
              <m.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                  delay: 0.1,
                }}
              >
                <Check className="w-5 h-5 text-forest-600 flex-shrink-0" />
              </m.div>
              <Body className="text-sm text-forest-700 font-medium">
                Item added to your cart
              </Body>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trust Indicators */}
      <div className="space-y-2 border-t border-cream-200 pt-6">
        <div className="flex items-center gap-2 text-sm text-charcoal-600">
          <CheckCircle className="w-4 h-4 text-forest-600 flex-shrink-0" />
          <span>Free shipping on orders over ₵75</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-charcoal-600">
          <CheckCircle className="w-4 h-4 text-forest-600 flex-shrink-0" />
          <span>Free returns within 30 days</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-charcoal-600">
          <CheckCircle className="w-4 h-4 text-forest-600 flex-shrink-0" />
          <span>Secure checkout guaranteed</span>
        </div>
      </div>

      {/* Product Details Accordion */}
      <div className="space-y-2 border-t border-cream-200 pt-6">
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
          content="Free shipping on orders over ₵75. Easy returns within 30 days. Items must be unworn with tags attached. Processing time: 1-2 business days."
          isExpanded={expandedDetails === "shipping"}
          onToggle={() => toggleDetails("shipping")}
        />
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-cream-200">
        <TrustBadge
          icon="🚚"
          title="Free Shipping"
          description="On orders over ₵100"
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
      <m.button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 rounded-lg px-2 -mx-2 hover:bg-cream-50 transition-colors duration-200"
        aria-expanded={isExpanded}
        whileHover={{ x: 2 }}
        transition={{ duration: 0.2 }}
      >
        <H3 className="text-base font-semibold text-charcoal-900">{title}</H3>
        <m.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-charcoal-500" />
        </m.div>
      </m.button>
      <AnimatePresence>
        {isExpanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <Body className="text-sm text-charcoal-600 pb-4 leading-relaxed pl-2">
              {content}
            </Body>
          </m.div>
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

