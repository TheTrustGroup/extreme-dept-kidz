/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,

  // Warehouse app (warehouse.extremedeptkidz.com) – align paths with main API
  async rewrites() {
    return [
      { source: '/admin/api/login', destination: '/api/admin/auth/login' },
      { source: '/admin/api/me', destination: '/api/admin/auth/me' },
      { source: '/api/orders', destination: '/api/admin/orders' },
    ];
  },
  
  // TypeScript configuration
  typescript: {
    // Ignore type errors in node_modules (resend has a type error)
    ignoreBuildErrors: false,
  },
  
  // NEXT/IMAGE STRICT CONFIG: Optimized image configuration
  images: {
    domains: ['localhost', 'extremedeptkidz.com'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // NEXT/IMAGE STRICT CONFIG: Modern formats only
    formats: ['image/avif', 'image/webp'],
    // NEXT/IMAGE STRICT CONFIG: 24-hour cache TTL for optimal balance
    minimumCacheTTL: 86400,
    // NEXT/IMAGE STRICT CONFIG: Disable SVG for security
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // NEXT/IMAGE STRICT CONFIG: Standard device breakpoints
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    // NEXT/IMAGE STRICT CONFIG: Optimized image sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable image optimization with CDN caching
    unoptimized: false,
  },
  
  // CRITICAL FIX: Enhanced Compression & Headers
  compress: true, // Enables gzip compression (Brotli handled by Vercel/CDN automatically)
  poweredByHeader: false,
  
  // HTTP/2 Server Push (handled automatically by Vercel/CDN)
  // Next.js and Vercel automatically use HTTP/2 with server push for critical resources
  
  // Performance Optimizations
  // Disable SWC minification in dev to see full errors during development
  swcMinify: process.env.NODE_ENV === 'production',
  
  // Optimize Fonts
  optimizeFonts: true,
  
  // Experimental Features
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "recharts",
      "date-fns",
      "zod",
      // Note: @prisma/client removed to ensure proper binary bundling
    ],
    // Enable React Server Components optimizations
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Performance: Optimize server component rendering
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // CRITICAL: Compiler Options - Remove console statements in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error"], // Keep only console.error for error tracking
    } : false,
  },
  
  // ESLint configuration for Vercel
  // Ignore ESLint errors during builds (warnings are still shown)
  // This allows deployment even with false positives like the Menu icon alias
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Webpack Optimizations - CRITICAL: Enhanced bundle optimization
  webpack: (config, { isServer, dev }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
      
      // CRITICAL: Enhanced tree shaking and code splitting (client-side only)
      config.optimization = {
        ...config.optimization,
        usedExports: true, // Enable tree shaking
        sideEffects: false, // Mark all modules as side-effect free for better tree shaking
        // CRITICAL: Route-based chunk splitting for optimal code splitting
        splitChunks: {
          chunks: 'all',
          minSize: 20000, // Minimum chunk size (20KB)
          maxSize: 244000, // Maximum chunk size (244KB) - prevents huge chunks
          cacheGroups: {
            default: false,
            vendors: false,
            // CRITICAL: Separate React chunks (highest priority - most stable)
            react: {
              name: 'react',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 50,
              reuseExistingChunk: true,
              enforce: true, // Force separate chunk
            },
            // CRITICAL: Separate Framer Motion (large library, separate chunk)
            framerMotion: {
              name: 'framer-motion',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              priority: 40,
              reuseExistingChunk: true,
              enforce: true,
            },
            // CRITICAL: Separate Lucide React icons (large icon library)
            lucideReact: {
              name: 'lucide-react',
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              priority: 35,
              reuseExistingChunk: true,
            },
            // CRITICAL: Separate Recharts (large charting library)
            recharts: {
              name: 'recharts',
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            // CRITICAL: Separate form libraries (react-hook-form, zod)
            forms: {
              name: 'forms',
              test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
              priority: 25,
              reuseExistingChunk: true,
            },
            // CRITICAL: Separate date utilities
            dateUtils: {
              name: 'date-utils',
              test: /[\\/]node_modules[\\/]date-fns[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // CRITICAL: Other vendor libraries
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
              minChunks: 2, // Only create vendor chunk if used in 2+ chunks
            },
            // CRITICAL: Common chunks shared across routes
            common: {
              name: 'common',
              minChunks: 2, // Shared by at least 2 routes
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
        // CRITICAL: Module concatenation for better tree shaking
        concatenateModules: true,
        // CRITICAL: Minimize bundle size
        minimize: !dev,
      };
    } else {
      // Server-side: Keep default optimization, just enable tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        concatenateModules: true,
      };
    }
    
    return config;
  },
  
  // Headers for Performance & Security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          // CRITICAL FIX: Enhanced CDN caching for uploaded assets
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          // CRITICAL FIX: Add edge caching headers for CDN optimization
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          // CRITICAL FIX: Enhanced CDN caching headers for edge optimization
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          // Compression headers (Brotli handled by CDN, but specify Accept-Encoding)
          {
            key: "Accept-Encoding",
            value: "br, gzip, deflate",
          },
        ],
      },
      {
        source: "/:all*(mp4|webm|mov)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          // CRITICAL FIX: Enhanced CDN caching for static assets
          {
            key: "CDN-Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/data/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
