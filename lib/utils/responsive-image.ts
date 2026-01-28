/**
 * Responsive Image Utilities
 * 
 * Mobile-first responsive image breakpoints and optimization utilities
 * Enforces lazy loading, proper sizes attributes, and CDN-ready configuration
 */

// Mobile-first breakpoints (matches Tailwind defaults)
export const BREAKPOINTS = {
  xs: 0,      // Extra small devices (portrait phones)
  sm: 640,    // Small devices (landscape phones)
  md: 768,    // Medium devices (tablets)
  lg: 1024,   // Large devices (desktops)
  xl: 1280,   // Extra large devices (large desktops)
  '2xl': 1536, // 2X Extra large devices (larger desktops)
} as const;

/**
 * Generate responsive sizes attribute for Next.js Image component
 * Mobile-first approach: smaller sizes first
 * 
 * @param config - Responsive image configuration
 * @returns sizes attribute string
 */
export function getResponsiveSizes(config: {
  mobile?: string;      // Default: 100vw (full width on mobile)
  sm?: string;         // Small devices (640px+)
  md?: string;         // Medium devices (768px+)
  lg?: string;         // Large devices (1024px+)
  xl?: string;         // Extra large devices (1280px+)
  '2xl'?: string;      // 2X Extra large devices (1536px+)
  default?: string;    // Default size (fallback)
}): string {
  const {
    mobile = '100vw',
    sm,
    md,
    lg,
    xl,
    '2xl': xl2,
    default: defaultSize = '100vw',
  } = config;

  const sizes: string[] = [];

  // Mobile-first: start with smallest breakpoint
  sizes.push(`(max-width: ${BREAKPOINTS.sm - 1}px) ${mobile}`);

  if (sm) {
    sizes.push(`(max-width: ${BREAKPOINTS.md - 1}px) ${sm}`);
  }

  if (md) {
    sizes.push(`(max-width: ${BREAKPOINTS.lg - 1}px) ${md}`);
  }

  if (lg) {
    sizes.push(`(max-width: ${BREAKPOINTS.xl - 1}px) ${lg}`);
  }

  if (xl) {
    sizes.push(`(max-width: ${BREAKPOINTS['2xl'] - 1}px) ${xl}`);
  }

  if (xl2) {
    sizes.push(`${xl2}`);
  } else {
    sizes.push(defaultSize);
  }

  return sizes.join(', ');
}

/**
 * Product card responsive sizes
 * Mobile-first: 1 column on mobile, 2 on tablet, 3-4 on desktop
 */
export const PRODUCT_CARD_SIZES = getResponsiveSizes({
  mobile: '100vw',           // Full width on mobile (1 column)
  sm: '50vw',                // 2 columns on small devices
  md: '33vw',                // 3 columns on medium devices
  lg: '25vw',                // 4 columns on large devices
  default: '280px',          // Fixed width on very large screens
});

/**
 * Hero image responsive sizes
 * Always full viewport width
 */
export const HERO_IMAGE_SIZES = getResponsiveSizes({
  mobile: '100vw',
  default: '100vw',
});

/**
 * Gallery image responsive sizes
 * Responsive based on container
 */
export const GALLERY_IMAGE_SIZES = getResponsiveSizes({
  mobile: '100vw',
  sm: '50vw',
  md: '33vw',
  lg: '25vw',
  default: '400px',
});

/**
 * Thumbnail image responsive sizes
 * Small thumbnails for product galleries
 */
export const THUMBNAIL_SIZES = getResponsiveSizes({
  mobile: '80px',
  sm: '100px',
  md: '120px',
  default: '120px',
});

/**
 * Get optimized image quality based on priority and device
 * Mobile-first: lower quality on mobile for faster loading
 */
export function getOptimizedQuality(
  priority: boolean = false,
  isMobile: boolean = false
): number {
  if (priority) {
    return 90; // High quality for LCP elements
  }
  
  if (isMobile) {
    return 75; // Lower quality on mobile for faster loading
  }
  
  return 85; // Standard quality on desktop
}

/**
 * Check if device is mobile (client-side only)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') {
    return false; // SSR: assume desktop
  }
  
  return window.innerWidth < BREAKPOINTS.md;
}

/**
 * Get fetch priority based on above-fold status
 */
export function getFetchPriority(
  isAboveFold: boolean,
  isMobile: boolean = false
): 'auto' | 'high' | 'low' {
  if (isAboveFold) {
    return 'auto'; // Browser decides based on connection
  }
  
  if (isMobile) {
    return 'low'; // Lower priority on mobile to save bandwidth
  }
  
  return 'low'; // Default to low for below-fold content
}
