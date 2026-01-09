"use client";

import * as React from "react";
import Image from "next/image";
import { m } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage as ProductImageType } from "@/types";
import { cn } from "@/lib/utils";
import { ZoomableImage } from "./ZoomableImage";

interface ProductGalleryProps {
  images: ProductImageType[];
  productName: string;
  className?: string;
}

/**
 * ProductGallery Component
 * 
 * Premium product image gallery with lightbox, thumbnails, and swipe support.
 * Luxury e-commerce experience with smooth transitions.
 */
export function ProductGallery({
  images,
  productName,
  className,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  const selectedImage = images[selectedIndex] || images[0];

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }
  };

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  React.useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, selectedIndex, images.length]);

  // Prevent body scroll when lightbox is open
  React.useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  return (
    <>
      <div className={cn("flex flex-col lg:flex-row gap-3 xs:gap-4 sm:gap-5 lg:gap-6", className)}>
        {/* Main Image */}
        <div className="relative lg:w-full aspect-square lg:aspect-auto lg:h-[600px] xl:h-[700px] bg-cream-100 rounded-lg overflow-hidden group">
          <m.div
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="relative w-full h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <ZoomableImage
              src={selectedImage.url}
              alt={selectedImage.alt || `${productName} - Image ${selectedIndex + 1}`}
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority={selectedIndex === 0}
              loading={selectedIndex === 0 ? "eager" : "lazy"}
              quality={90}
              onLightboxOpen={() => setIsLightboxOpen(true)}
            />


            {/* Navigation Arrows (Desktop) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-cream-50/90 hover:bg-cream-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:flex items-center justify-center"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-charcoal-900" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-cream-50/90 hover:bg-cream-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:flex items-center justify-center"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-charcoal-900" />
                </button>
              </>
            )}

            {/* Image Counter (Mobile) */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 lg:hidden px-3 py-1.5 bg-charcoal-900/70 text-cream-50 rounded-full text-xs font-medium">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </m.div>
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="lg:w-auto lg:flex-shrink-0">
            <div className="flex lg:flex-col gap-2 xs:gap-2.5 sm:gap-3 lg:gap-4 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[600px] scrollbar-hide pb-2 lg:pb-0">
              {images.map((image, index) => (
                <m.button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "relative flex-shrink-0 w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden",
                    "border-2 transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2",
                    selectedIndex === index
                      ? "border-charcoal-900 ring-2 ring-charcoal-900/20"
                      : "border-cream-200 hover:border-charcoal-400"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `${productName} - Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 80px, 96px"
                    loading="lazy"
                    quality={80}
                  />
                </m.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <>
            {/* Backdrop */}
            <m.div
              className="fixed inset-0 bg-charcoal-900/95 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLightboxOpen(false)}
            />

            {/* Lightbox Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <m.div
                className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="absolute top-4 right-4 z-10 p-2 bg-cream-50/10 hover:bg-cream-50/20 rounded-full text-cream-50 transition-colors duration-200"
                  aria-label="Close lightbox"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Main Image */}
                <div className="relative w-full h-full">
                  <m.div
                    key={selectedIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={selectedImage.url}
                      alt={selectedImage.alt || `${productName} - Lightbox view`}
                      fill
                      className="object-contain"
                      sizes="90vw"
                      quality={90}
                    />
                  </m.div>

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-cream-50/10 hover:bg-cream-50/20 rounded-full text-cream-50 transition-colors duration-200"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-cream-50/10 hover:bg-cream-50/20 rounded-full text-cream-50 transition-colors duration-200"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-charcoal-900/70 text-cream-50 rounded-full text-sm font-medium">
                      {selectedIndex + 1} / {images.length}
                    </div>
                  )}
                </div>
              </m.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

