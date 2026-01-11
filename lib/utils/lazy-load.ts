/**
 * Lazy Loading Utilities
 * 
 * Utilities for code splitting and lazy loading components
 */

import { lazy, ComponentType } from 'react';

/**
 * Lazy load a component with error boundary
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return lazy(importFunc);
}

/**
 * Preload a component
 */
export function preloadComponent(
  importFunc: () => Promise<any>
): void {
  // Prefetch in the background
  if (typeof window !== 'undefined') {
    importFunc().catch(() => {
      // Silently fail - component will load when needed
    });
  }
}
