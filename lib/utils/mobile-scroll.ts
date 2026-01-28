/**
 * Mobile Scroll Optimization Utilities
 * 
 * Provides utilities for:
 * - Native momentum scrolling
 * - Passive event listeners
 * - Scroll jank prevention
 * - GPU-accelerated animations
 */

/**
 * Add passive event listener (with fallback for older browsers)
 */
export function addPassiveEventListener(
  element: HTMLElement | Window,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): void {
  const passiveOptions: AddEventListenerOptions = {
    passive: true,
    ...options,
  };

  // Check if browser supports passive listeners
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get() {
        supportsPassive = true;
        return false;
      },
    });
    window.addEventListener('test', () => {}, opts);
    window.removeEventListener('test', () => {}, opts);
  } catch (e) {
    // Browser doesn't support passive listeners
  }

  element.addEventListener(
    event,
    handler,
    supportsPassive ? passiveOptions : (options || false)
  );
}

/**
 * Remove passive event listener
 */
export function removePassiveEventListener(
  element: HTMLElement | Window,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): void {
  const passiveOptions: AddEventListenerOptions = {
    passive: true,
    ...options,
  };

  element.removeEventListener(event, handler, passiveOptions);
}

/**
 * Throttle function with requestAnimationFrame for scroll events
 * Prevents scroll jank by limiting function execution
 */
export function throttleRAF<T extends (...args: any[]) => void>(
  func: T,
  delay: number = 16
): T {
  let rafId: number | null = null;
  let lastExecTime = 0;

  return ((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastExecTime >= delay) {
      lastExecTime = now;
      func(...args);
    } else {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        lastExecTime = Date.now();
        func(...args);
      });
    }
  }) as T;
}

/**
 * Debounce function for resize/scroll events
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number = 150
): T {
  let timeout: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  }) as T;
}

/**
 * Enable native momentum scrolling on iOS
 */
export function enableMomentumScrolling(element: HTMLElement): void {
  // iOS Safari native momentum scrolling
  (element.style as any).webkitOverflowScrolling = 'touch';
  
  // Ensure element can scroll
  if (element.scrollHeight > element.clientHeight) {
    element.style.overflowY = 'auto';
  }
}

/**
 * Prevent scroll jank by using GPU acceleration
 */
export function enableGPUScroll(element: HTMLElement): void {
  // GPU acceleration for smooth scrolling
  element.style.transform = 'translateZ(0)';
  element.style.willChange = 'scroll-position';
  element.style.backfaceVisibility = 'hidden';
  
  // Enable momentum scrolling on iOS
  enableMomentumScrolling(element);
}

/**
 * Optimize scroll container for mobile
 */
export function optimizeScrollContainer(element: HTMLElement): void {
  // Enable native momentum scrolling
  enableMomentumScrolling(element);
  
  // GPU acceleration
  enableGPUScroll(element);
  
  // Prevent layout shifts
  element.style.contain = 'layout style paint';
  
  // Smooth scrolling
  element.style.scrollBehavior = 'smooth';
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Get safe area insets for iOS devices
 */
export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (typeof window === 'undefined' || typeof CSS === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
  };
}

/**
 * Prevent forced reflows by batching DOM reads/writes
 */
export function batchDOMUpdates(reads: () => void, writes: () => void): void {
  // Batch DOM reads
  reads();
  
  // Batch DOM writes in next frame
  requestAnimationFrame(() => {
    writes();
  });
}

/**
 * Optimize element for mobile scrolling
 */
export function optimizeForMobileScroll(element: HTMLElement): void {
  // Enable native momentum scrolling
  enableMomentumScrolling(element);
  
  // GPU acceleration
  enableGPUScroll(element);
  
  // Prevent layout shifts
  element.style.contain = 'layout style paint';
  
  // Touch optimization
  element.style.touchAction = 'pan-y'; // Allow vertical scrolling, prevent horizontal
  
  // Smooth scrolling
  element.style.scrollBehavior = 'smooth';
}
