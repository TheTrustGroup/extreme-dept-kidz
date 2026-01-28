import type { Metadata } from "next";
import { Suspense } from "react";
import { Playfair_Display, Inter } from "next/font/google";
import { Header, Footer } from "@/components/layout";
import { CartDrawerWrapper } from "@/components/layout/CartDrawerWrapper";
import { LazyFloatingCartButton } from "@/components/layout/LazyFloatingCartButton";
import { Providers } from "@/components/providers";
import { SkipLinks } from "@/components/a11y/SkipLinks";
import { LazyWebVitals } from "./LazyWebVitals";
import { PageLoader } from "@/components/ui/PageLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

// CRITICAL FIX: Optimize font loading to prevent blocking render
// display: "swap" prevents FOIT (Flash of Invisible Text)
// preload: true ensures fonts load early but don't block
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap", // Show fallback immediately, swap when font loads
  weight: ["400", "500", "600", "700"],
  preload: true, // Preload critical font
  fallback: ["Georgia", "serif"], // System fallback for instant text display
  adjustFontFallback: true, // Optimize fallback font metrics
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // Show fallback immediately, swap when font loads
  weight: ["300", "400", "500", "600", "700"],
  preload: true, // Preload critical font
  fallback: ["system-ui", "arial"], // System fallback for instant text display
  adjustFontFallback: true, // Optimize fallback font metrics
});

export const metadata: Metadata = {
  title: {
    default: "Extreme Dept Kidz | Luxury Kids Fashion",
    template: "%s | Extreme Dept Kidz",
  },
  description:
    "Discover luxury kids fashion at Extreme Dept Kidz. Premium clothing and accessories for boys and girls. New arrivals, exclusive collections, and timeless style.",
  keywords: [
    "luxury kids fashion",
    "premium children's clothing",
    "kids fashion brand",
    "boys clothing",
    "girls clothing",
    "designer kids wear",
  ],
  authors: [{ name: "Extreme Dept Kidz" }],
  creator: "Extreme Dept Kidz",
  publisher: "Extreme Dept Kidz",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://extremedeptkidz.com"),
  alternates: {
    canonical: "https://extremedeptkidz.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://extremedeptkidz.com",
    siteName: "Extreme Dept Kidz",
    title: "Extreme Dept Kidz | Luxury Kids Fashion",
    description:
      "Discover luxury kids fashion at Extreme Dept Kidz. Premium clothing and accessories for boys and girls.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Extreme Dept Kidz - Luxury Kids Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Extreme Dept Kidz | Luxury Kids Fashion",
    description:
      "Discover luxury kids fashion at Extreme Dept Kidz. Premium clothing and accessories for boys and girls.",
    images: ["/og-image.jpg"],
    creator: "@extremedeptkidz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon-16x16.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-touch-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/apple-touch-icon-76x76.png", sizes: "76x76", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} data-theme="light" suppressHydrationWarning>
      <head>
        {/* Performance: Prevent theme FOUC by applying theme before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || theme === 'light') {
                    document.documentElement.setAttribute('data-theme', theme);
                    document.documentElement.classList.remove('light', 'dark');
                    document.documentElement.classList.add(theme);
                  } else {
                    var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    var initialTheme = systemPrefersDark ? 'dark' : 'light';
                    document.documentElement.setAttribute('data-theme', initialTheme);
                    document.documentElement.classList.remove('light', 'dark');
                    document.documentElement.classList.add(initialTheme);
                  }
                } catch (e) {
                  // Fallback to light theme
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
        {/* Font preconnect for faster font loading - Next.js handles this automatically */}
        {/* Image CDN preconnect */}
        <link
          rel="preconnect"
          href="https://images.unsplash.com"
        />
        <link
          rel="dns-prefetch"
          href="https://images.unsplash.com"
        />
        {/* Performance: Preload critical resources */}
        {/* Logo is loaded with priority in Header component, no need for preload here */}
        {/* Performance: Resource hints */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* CRITICAL FIX: Removed icon preloads - icons are small (< 100KB total) and browsers handle them efficiently */}
        {/* Preloading icons causes "preloaded but not used" warnings and wastes bandwidth */}
        {/* Icons are already referenced in metadata and manifest - browsers will fetch them when needed */}
        
        {/* PWA: Theme color and background color meta tags for proper splash screen */}
        <meta name="theme-color" content="#1A1A2E" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1A1A2E" media="(prefers-color-scheme: dark)" />
        <meta name="background-color" content="#F5F1E8" />
        
        {/* iOS PWA: Apple mobile web app meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Extreme Dept Kidz" />
        
        {/* iOS PWA: Splash screen sizes for all device sizes */}
        {/* iPhone 14 Pro Max / 13 Pro Max / 12 Pro Max */}
        <link rel="apple-touch-startup-image" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" href="/splash-iphone-14-pro-max.png" />
        {/* iPhone 14 Plus / 13 / 12 */}
        <link rel="apple-touch-startup-image" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" href="/splash-iphone-14-plus.png" />
        {/* iPhone 14 / 13 mini / 12 mini */}
        <link rel="apple-touch-startup-image" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" href="/splash-iphone-14.png" />
        {/* iPhone 11 Pro Max / XS Max */}
        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" href="/splash-iphone-11-pro-max.png" />
        {/* iPhone 11 / XR */}
        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" href="/splash-iphone-11.png" />
        {/* iPhone 8 Plus / 7 Plus / 6s Plus */}
        <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" href="/splash-iphone-8-plus.png" />
        {/* iPhone 8 / 7 / 6s / SE 2nd gen */}
        <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="/splash-iphone-8.png" />
        {/* iPad Pro 12.9" */}
        <link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" href="/splash-ipad-pro-12-9.png" />
        {/* iPad Pro 11" */}
        <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" href="/splash-ipad-pro-11.png" />
        {/* iPad Air / Mini */}
        <link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" href="/splash-ipad.png" />
        
        {/* Fallback splash screen (uses largest icon) */}
        <link rel="apple-touch-startup-image" href="/icon-512x512.png" />
      </head>
      <body className="min-h-screen flex flex-col">
        <ErrorBoundary>
          <SkipLinks />
          <Providers>
            <Suspense fallback={<PageLoader />}>
              <Header cartItemCount={0} />
            </Suspense>
            <main id="main-content" className="flex-1" role="main">
              <Suspense fallback={<PageLoader />}>
                {children}
              </Suspense>
            </main>
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
            {/* CRITICAL FIX: Lazy hydrate non-critical components to improve FCP/LCP */}
            {/* These components don't need to block initial render */}
            <Suspense fallback={null}>
              <CartDrawerWrapper />
            </Suspense>
            {/* FloatingCartButton: Defer hydration until after page is interactive */}
            <LazyFloatingCartButton />
            {/* WebVitals: Load after page is interactive to avoid blocking */}
            <LazyWebVitals />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
