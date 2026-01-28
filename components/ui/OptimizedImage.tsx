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
   * Default: 85 (desktop), 75 (mobile), 90 (LCP)
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
  const [isInView, setIsInView] = React.useState(!useIntersectionObserver || isLCP);
  const [shouldLoad, setShouldLoad] = React.useState(isLCP);
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
      // Small delay to prioritize critical content
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, isLCP ? 0 : 50);
      return () => clearTimeout(timer);
    }
  }, [inView, useIntersectionObserver, isLCP]);

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

  // Get optimized quality
  const getQuality = (): number => {
    if (quality !== undefined) return quality;
    if (isLCP) return 90;
    if (isMobile) return 75;
    return 85;
  };

  // Get fetch priority
  const getFetchPriority = (): 'auto' | 'high' | 'low' => {
    if (isLCP) return 'high';
    if (isMobile) return 'low';
    return 'auto';
  };

  // Don't render until in view (for lazy loading)
  if (!isInView) {
    return (
      <div
        ref={setRefs}
        className={cn("bg-cream-100 animate-pulse", className)}
        style={{
          aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : '1/1',
          contain: 'layout style paint',
        }}
        aria-label="Loading image"
      />
    );
  }

  return (
    <div ref={setRefs} className={cn("relative", className)} style={{ contain: 'layout style paint' }}>
      {shouldLoad ? (
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
          className={cn(
            "object-cover",
            className
          )}
          {...props}
        />
      ) : (
        <div
          className={cn("bg-cream-100 animate-pulse", className)}
          style={{
            aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : '1/1',
            contain: 'layout style paint',
          }}
        />
      )}
    </div>
  );
}
