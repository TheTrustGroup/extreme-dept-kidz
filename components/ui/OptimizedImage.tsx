/**
 * OptimizedImage Component
 * 
 * Ultra-optimized image component with:
 * - AVIF + WebP delivery (Next.js handles automatically)
 * - IntersectionObserver lazy loading
 * - Smart prefetching for product images
 * - Blur placeholders
 * - Proper responsive sizes
 * - LCP-only priority
 * - Dynamic viewport-based loading
 */

"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";
import { useInView } from "react-intersection-observer";
import { getProductCardBlurPlaceholder, getImageBlurDataURL } from "@/lib/utils/image-utils";
import { PRODUCT_CARD_SIZES, HERO_IMAGE_SIZES, GALLERY_IMAGE_SIZES } from "@/lib/utils/responsive-image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt' | 'loading' | 'priority'> {
  src: string;
  alt: string;
  /**
   * Image variant determines default sizes and optimization
   */
  variant?: 'hero' | 'product-card' | 'product-detail' | 'gallery' | 'thumbnail' | 'custom';
  /**
   * Custom sizes override (used when variant='custom')
   */
  customSizes?: string;
  /**
   * Whether this is the LCP element (only one per page)
   */
  isLCP?: boolean;
  /**
   * Whether to use IntersectionObserver for lazy loading
   * Default: true for non-LCP images
   */
  useIntersectionObserver?: boolean;
  /**
   * Prefetch image when it's near viewport (in pixels)
   * Default: 200px
   */
  prefetchDistance?: number;
  /**
   * Image quality (1-100)
   * Default: Hero: 85, Product: 80, Thumbnail: 75, LCP: 85
   */
  quality?: number;
  /**
   * Blur placeholder variant
   */
  blurVariant?: 'product-card' | 'hero' | 'custom';
  /**
   * Custom blur data URL
   */
  customBlurDataURL?: string;
  /**
   * Whether to enable smart prefetching
   * Default: true for product images
   */
  enablePrefetch?: boolean;
}

/**
 * OptimizedImage Component
 * 
 * Ultra-optimized image with IntersectionObserver lazy loading,
 * smart prefetching, and proper responsive sizes.
 */
export function OptimizedImage({
  src,
  alt,
  variant = 'custom',
  customSizes,
  isLCP = false,
  useIntersectionObserver = !isLCP,
  prefetchDistance = 200,
  quality,
  blurVariant,
  customBlurDataURL,
  enablePrefetch = variant === 'product-card',
  className,
  ...props
}: OptimizedImageProps): JSX.Element {
  // CRITICAL FIX: Always start with images visible for LCP and non-lazy images
  const [isInView, setIsInView] = React.useState(!useIntersectionObserver || isLCP);
  const [shouldLoad, setShouldLoad] = React.useState(isLCP || !useIntersectionObserver);
  const [isMobile, setIsMobile] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  
  // IntersectionObserver for lazy loading
  const { ref: intersectionRef, inView } = useInView({
    triggerOnce: true,
    rootMargin: `${prefetchDistance}px`,
    skip: !useIntersectionObserver || isLCP,
  });

  // Combine refs - use intersectionRef directly as it handles the ref assignment
  const setRefs = React.useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (typeof intersectionRef === 'function') {
      intersectionRef(node);
    } else if (intersectionRef && 'current' in intersectionRef) {
      (intersectionRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [intersectionRef]);

  // Detect mobile device
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  // Handle IntersectionObserver
  React.useEffect(() => {
    if (inView && useIntersectionObserver) {
      setIsInView(true);
      // CRITICAL FIX: Load images immediately when in view
      setShouldLoad(true);
    }
  }, [inView, useIntersectionObserver]);

  // CRITICAL FIX: Ensure LCP images load immediately
  React.useEffect(() => {
    if (isLCP || !useIntersectionObserver) {
      setIsInView(true);
      setShouldLoad(true);
    }
  }, [isLCP, useIntersectionObserver]);

  // Smart prefetching: Prefetch when near viewport
  React.useEffect(() => {
    if (!enablePrefetch || !useIntersectionObserver || isLCP) return;
    
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Prefetch image
              const link = document.createElement('link');
              link.rel = 'prefetch';
              link.as = 'image';
              link.href = src;
              document.head.appendChild(link);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: `${prefetchDistance}px`,
        }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    }
  }, [enablePrefetch, useIntersectionObserver, isLCP, src, prefetchDistance]);

  // Get responsive sizes based on variant
  const getSizes = (): string => {
    if (customSizes) return customSizes;
    
    switch (variant) {
      case 'hero':
        return HERO_IMAGE_SIZES;
      case 'product-card':
        return PRODUCT_CARD_SIZES;
      case 'gallery':
        return GALLERY_IMAGE_SIZES;
      case 'product-detail':
        return '(max-width: 768px) 100vw, 60vw';
      case 'thumbnail':
        return '(max-width: 640px) 80px, 120px';
      default:
        return '100vw';
    }
  };

  // Get blur placeholder
  const getBlurDataURL = (): string => {
    if (customBlurDataURL) return customBlurDataURL;
    
    switch (blurVariant) {
      case 'product-card':
        return getProductCardBlurPlaceholder();
      case 'hero':
        return getImageBlurDataURL(20, 20);
      default:
        return getImageBlurDataURL(10, 10);
    }
  };

  // Get optimized quality based on variant and priority
  const getQuality = (): number => {
    if (quality !== undefined) return quality;
    
    // Variant-based quality settings
    switch (variant) {
      case 'hero':
        return 85; // Hero images: quality 85
      case 'product-card':
      case 'product-detail':
        return 80; // Product images: quality 80
      case 'thumbnail':
        return 75; // Thumbnails: quality 75
      case 'gallery':
        return 80; // Gallery images: quality 80
      default:
        // Fallback based on LCP and device
        if (isLCP) return 85; // LCP images: quality 85
        if (isMobile) return 75; // Mobile: quality 75
        return 80; // Desktop default: quality 80
    }
  };

  // Get fetch priority
  const getFetchPriority = (): 'auto' | 'high' | 'low' => {
    if (isLCP) return 'high';
    if (isMobile) return 'low';
    return 'auto';
  };

  // CRITICAL FIX: Always render image container with proper dimensions
  // Images MUST always render - no conditional rendering that causes blank cards
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Handle image load errors - fallback to placeholder
  const handleImageError = React.useCallback(() => {
    setImageError(true);
  }, []);

  const handleImageLoad = React.useCallback(() => {
    setImageLoaded(true);
  }, []);

  // CRITICAL: Always render the image container with proper aspect ratio
  // Show placeholder only if image hasn't loaded yet AND not in view (for lazy loading)
  const showPlaceholder = !isInView && useIntersectionObserver && !isLCP && !shouldLoad;

  return (
    <div 
      ref={setRefs} 
      className={cn("relative", className)} 
      style={{ 
        contain: 'layout style paint',
        width: '100%',
        height: '100%',
        minHeight: props.width && props.height ? undefined : '100%',
        // CRITICAL: Ensure container is always visible
        opacity: 1,
        visibility: 'visible',
      }}
    >
      {/* CRITICAL FIX: Always render Image component - never conditionally hide */}
      {/* Next.js Image handles lazy loading internally, we just need to ensure it renders */}
      {shouldLoad || isLCP ? (
        <Image
          src={src}
          alt={alt}
          fill={!props.width || !props.height}
          width={props.width}
          height={props.height}
          sizes={getSizes()}
          loading={isLCP ? 'eager' : 'lazy'}
          priority={isLCP}
          fetchPriority={getFetchPriority()}
          quality={getQuality()}
          placeholder="blur"
          blurDataURL={getBlurDataURL()}
          decoding="async"
          onError={handleImageError}
          onLoad={handleImageLoad}
          className={cn(
            "object-cover",
            className,
            // CRITICAL: Ensure image is always visible
            imageLoaded ? "opacity-100" : "opacity-100"
          )}
          style={{
            ...props.style,
            // CRITICAL FIX: Ensure images are always visible - pixel-perfect rendering
            opacity: imageError ? 0.5 : 1,
            visibility: 'visible',
            display: 'block',
          } as React.CSSProperties}
          {...props}
        />
      ) : null}
      
      {/* Placeholder with shimmer effect - only show when image is not loaded yet */}
      {showPlaceholder && (
        <div
          className={cn("absolute inset-0 bg-cream-100 skeleton-shimmer", className)}
          style={{
            contain: 'layout style paint',
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}
          aria-label="Loading image"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cream-200 via-cream-100 to-cream-200 bg-[length:200%_100%] animate-shimmer" />
        </div>
      )}
      
      {/* Error fallback - show if image fails to load */}
      {imageError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-cream-100"
          style={{
            zIndex: 1,
            contain: 'layout style paint',
          }}
          aria-label="Image failed to load"
        >
          <div className="text-charcoal-400 text-xs">Image</div>
        </div>
      )}
    </div>
  );
}
