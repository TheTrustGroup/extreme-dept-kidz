import type { StaticImageData } from 'next/image';

/**
 * Generates optimized image props for Next.js Image component
 */
export function getOptimizedImageProps(
  src: string,
  alt: string,
  options?: {
    priority?: boolean;
    quality?: number;
    sizes?: string;
  }
) {
  return {
    src,
    alt,
    quality: options?.quality || 85,
    priority: options?.priority || false,
    sizes: options?.sizes || '100vw',
    placeholder: 'blur' as const,
  };
}

/**
 * Get blur data URL for images (for loading state)
 */
export function getImageBlurDataURL(width = 10, height = 10): string {
  const shimmer = (w: number, h: number) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f6f7f8" offset="0%" />
          <stop stop-color="#edeef1" offset="20%" />
          <stop stop-color="#f6f7f8" offset="40%" />
          <stop stop-color="#f6f7f8" offset="100%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#f6f7f8" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
    </svg>
  `;

  const toBase64 = (str: string) =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str);

  return `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`;
}

/**
 * Responsive image sizes for different breakpoints
 */
export const responsiveSizes = {
  hero: '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px',
  productCard: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  productDetail: '(max-width: 768px) 100vw, 60vw',
  lifestyle: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px',
  editorial: '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px',
};

/**
 * Standard image aspect ratios
 */
export const aspectRatios = {
  hero: 16 / 9,        // 1.78:1
  portrait: 3 / 4,     // 0.75:1 (fashion standard)
  square: 1 / 1,       // 1:1
  landscape: 4 / 3,    // 1.33:1
  ultrawide: 21 / 9,   // 2.33:1
};
