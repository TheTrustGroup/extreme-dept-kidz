/**
 * Bundle Optimization Utilities
 * 
 * Utilities for optimizing bundle size and reducing hydration payload
 */

/**
 * Lazy load heavy components only when needed
 * Reduces initial bundle size and hydration payload
 */
export function lazyLoadComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    ssr?: boolean;
    loading?: React.ComponentType;
  }
) {
  return typeof window !== 'undefined'
    ? require('next/dynamic').default(importFn, {
        ssr: options?.ssr ?? false,
        loading: options?.loading,
      })
    : null;
}

/**
 * Check if code is running on client-side
 * Useful for conditional imports
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if code is running on server-side
 * Useful for conditional imports
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Defer non-critical imports until after initial render
 * Reduces hydration payload
 */
export function deferImport<T>(
  importFn: () => Promise<T>,
  delay: number = 100
): Promise<T> {
  if (typeof window === 'undefined') {
    return importFn();
  }
  
  return new Promise((resolve) => {
    setTimeout(() => {
      importFn().then(resolve);
    }, delay);
  });
}

/**
 * Load module only when condition is met
 * Useful for feature flags or conditional features
 */
export async function conditionalImport<T>(
  condition: boolean,
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  if (!condition) {
    return fallback;
  }
  
  return importFn();
}
