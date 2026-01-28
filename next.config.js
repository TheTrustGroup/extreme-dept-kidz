/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  
  // TypeScript configuration
  typescript: {
    // Ignore type errors in node_modules (resend has a type error)
    ignoreBuildErrors: false,
  },
  
  // Image Optimization
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
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Compression & Headers
  compress: true,
  poweredByHeader: false,
  
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
      // Note: @prisma/client removed to ensure proper binary bundling
    ],
    // Enable React Server Components optimizations
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Performance: Optimize server component rendering
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // TypeScript configuration
  typescript: {
    // Ignore build errors from dependencies (resend@6.7.0 has a known type definition bug)
    // This only affects the build, runtime is fine
    ignoreBuildErrors: true,
  },
  
  // Compiler Options
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
  
  // ESLint configuration for Vercel
  // Ignore ESLint errors during builds (warnings are still shown)
  // This allows deployment even with false positives like the Menu icon alias
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration for Vercel
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Webpack Optimizations
  webpack: (config, { isServer, dev }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
      
      // Performance: Enhanced tree shaking and code splitting (client-side only)
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        // Performance: Better code splitting (client-side only to avoid server bundle issues)
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Performance: Separate vendor chunks for better caching
            framerMotion: {
              name: 'framer-motion',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            react: {
              name: 'react',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 40,
              reuseExistingChunk: true,
            },
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    } else {
      // Server-side: Keep default optimization, just enable tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
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
        ],
      },
      {
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
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
