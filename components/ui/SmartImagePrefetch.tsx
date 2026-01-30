/**
 * SmartImagePrefetch Component
 * 
 * Intelligently prefetches product images when user is likely to view them.
 * Uses IntersectionObserver to prefetch images that are near the viewport.
 */

"use client";

import * as React from "react";

interface SmartImagePrefetchProps {
  /**
   * Array of image URLs to prefetch
   */
  imageUrls: string[];
  /**
   * Distance from viewport to start prefetching (in pixels)
   * Default: 200px
   */
  prefetchDistance?: number;
  /**
   * Maximum number of images to prefetch simultaneously
   * Default: 3
   */
  maxConcurrent?: number;
  /**
   * Whether prefetching is enabled
   * Default: true
   */
  enabled?: boolean;
}

/**
 * Connection-aware: skip prefetch on slow networks or when saveData is on.
 * Reduces contention with LCP/critical requests on 3G and low bandwidth.
 */
function shouldPrefetchImages(): boolean {
  if (typeof navigator === 'undefined') return true;
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
  if (!conn) return true;
  if (conn.saveData === true) return false;
  const et = conn.effectiveType;
  if (et === '2g' || et === 'slow-2g') return false;
  return true;
}

/**
 * SmartImagePrefetch Component
 *
 * Prefetches product images intelligently based on viewport proximity.
 * Disables prefetch on 2g/save-data to avoid competing with critical requests (mobile-first).
 */
export function SmartImagePrefetch({
  imageUrls,
  prefetchDistance = 200,
  maxConcurrent = 3,
  enabled = true,
}: SmartImagePrefetchProps): null {
  const prefetchedRef = React.useRef<Set<string>>(new Set());
  const prefetchingCountRef = React.useRef(0);

  React.useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }
    if (!shouldPrefetchImages()) return;

    // Create intersection observer for each image
    const observers: IntersectionObserver[] = [];
    const prefetchQueue: string[] = [];

    const prefetchImage = (url: string) => {
      if (prefetchedRef.current.has(url) || prefetchingCountRef.current >= maxConcurrent) {
        return;
      }

      prefetchedRef.current.add(url);
      prefetchingCountRef.current += 1;

      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'image';
      link.href = url;

      link.onload = () => {
        prefetchingCountRef.current = Math.max(0, prefetchingCountRef.current - 1);
        if (prefetchQueue.length > 0) {
          const nextUrl = prefetchQueue.shift();
          if (nextUrl) prefetchImage(nextUrl);
        }
      };

      link.onerror = () => {
        prefetchingCountRef.current = Math.max(0, prefetchingCountRef.current - 1);
        prefetchedRef.current.delete(url);
        if (prefetchQueue.length > 0) {
          const nextUrl = prefetchQueue.shift();
          if (nextUrl) prefetchImage(nextUrl);
        }
      };

      document.head.appendChild(link);
    };

    // Create observers for each image URL
    imageUrls.forEach((url) => {
      // Create a placeholder element to observe
      const placeholder = document.createElement('div');
      placeholder.style.position = 'absolute';
      placeholder.style.width = '1px';
      placeholder.style.height = '1px';
      placeholder.style.opacity = '0';
      placeholder.style.pointerEvents = 'none';
      placeholder.dataset.imageUrl = url;
      document.body.appendChild(placeholder);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const imageUrl = entry.target.getAttribute('data-image-url');
              if (imageUrl && !prefetchedRef.current.has(imageUrl)) {
                if (prefetchingCountRef.current < maxConcurrent) {
                  prefetchImage(imageUrl);
                } else {
                  prefetchQueue.push(imageUrl);
                }
              }
              observer.disconnect();
              entry.target.remove();
            }
          });
        },
        {
          rootMargin: `${prefetchDistance}px`,
        }
      );

      observer.observe(placeholder);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
      prefetchedRef.current.clear();
    };
  }, [imageUrls, prefetchDistance, maxConcurrent, enabled]);

  return null;
}
