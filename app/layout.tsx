import type { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { Playfair_Display, Inter, Montserrat } from "next/font/google";
import { ConditionalHeader } from "@/components/layout/ConditionalHeader";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { CartDrawerWrapper } from "@/components/layout/CartDrawerWrapper";
import { LazyFloatingCartButton } from "@/components/layout/LazyFloatingCartButton";
import { LazyFloatingCurrencySelector } from "@/components/layout/LazyFloatingCurrencySelector";
import { Providers } from "@/components/providers";
import { SkipLinks } from "@/components/a11y/SkipLinks";
import { LazyWebVitals } from "./LazyWebVitals";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageLoadingBar } from "@/components/ui/PageLoadingBar";
import PageTransition from "@/components/ui/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProductsUpdateListener } from "@/components/ProductsUpdateListener";
import ToastProvider from "@/components/ui/ToastProvider";
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
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  preload: true,
  fallback: ["-apple-system", "BlinkMacSystemFont", "SF Pro Text", "SF Pro Display", "system-ui", "sans-serif"],
  adjustFontFallback: true,
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  adjustFontFallback: true,
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
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
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${montserrat.variable}`} data-theme="light" suppressHydrationWarning>
      <head>
        {/* Prevents dark mode flash on reload — runs before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = stored === 'dark' || (!stored && prefersDark);
                  if (isDark) document.documentElement.classList.add('dark');
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* CRITICAL: Prevent theme FOUC - inline script must execute before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);document.documentElement.className=t}else{var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var i=d?'dark':'light';document.documentElement.setAttribute('data-theme',i);document.documentElement.className=i}}catch(e){document.documentElement.setAttribute('data-theme','light');document.documentElement.className='light'}})();`,
          }}
        />
        {/* CRITICAL: Preconnect to font domains for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Resource hints — Supabase storage (set NEXT_PUBLIC_SUPABASE_URL if using Supabase) */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
          </>
        )}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* CRITICAL: Preload hero image for LCP optimization (mobile-first) */}
        {/* Note: Next.js Image component handles optimization, preload is handled by priority prop */}
        
        {/* CRITICAL FIX: Removed icon preloads - icons are small (< 100KB total) and browsers handle them efficiently */}
        {/* Preloading icons causes "preloaded but not used" warnings and wastes bandwidth */}
        {/* Icons are already referenced in metadata and manifest - browsers will fetch them when needed */}
        
        {/* PWA: Theme color and background color meta tags for proper splash screen */}
        <meta name="theme-color" content="#1A1A2E" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1A1A2E" media="(prefers-color-scheme: dark)" />
        <meta name="background-color" content="#F5F1E8" />
        
        {/* PWA: Mobile web app capable (standard; avoids deprecation warning) */}
        <meta name="mobile-web-app-capable" content="yes" />
        {/* iOS PWA: Apple-specific (legacy; keep for older Safari) */}
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
        {/* Structured data — ClothingStore for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ClothingStore",
              name: "Extreme Dept Kidz",
              description: "Premium streetwear for young legends. Based in Accra, Ghana.",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://extremedeptkidz.com",
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://extremedeptkidz.com"}/IMG_8640.PNG`,
              address: { "@type": "PostalAddress", addressLocality: "Accra", addressCountry: "GH" },
              priceRange: "₵₵",
              currenciesAccepted: "GHS",
              paymentAccepted: "MoMo, Visa, Mastercard",
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ErrorBoundary>
          <PageLoadingBar />
          <SkipLinks />
          <Providers>
            <ProductsUpdateListener />
            <Suspense fallback={<PageLoader />}>
              <ConditionalHeader />
            </Suspense>
            <main id="main-content" className="flex-1" role="main">
              <Suspense fallback={<PageLoader />}>
                <PageTransition>{children}</PageTransition>
              </Suspense>
            </main>
            {/*
             * GLOBAL UTILITY LAYER — Currency selector and other global utilities.
             * DO NOT move the currency selector into the footer or any other layout slot.
             *
             * Why the previous viewport-fixed currency selector could not move (diagnosis):
             * - Body has contain: layout style paint (globals.css), which creates a containing
             *   block for position:fixed descendants. Fixed elements were therefore positioned
             *   relative to body and scrolled with the page instead of staying viewport-fixed.
             * - The component was portaled to document.body but remained a descendant of body,
             *   so body's containment still applied. No amount of z-index or !important fixed it.
             * - We do NOT use viewport-fixed on mobile; the currency pill lives here, above the
             *   footer, and is shown only when the footer enters view (sticky utility pill).
             */}
            <div id="global-utility-layer" role="region" aria-label="Page utilities" />
            <Suspense fallback={null}>
              <ConditionalFooter />
            </Suspense>
            {/* CRITICAL: Partial hydration for non-critical components */}
            {/* These components hydrate after page is interactive to improve FCP/LCP */}
            <Suspense fallback={null}>
              <CartDrawerWrapper />
            </Suspense>
            {/* FloatingCartButton: Deferred hydration (100ms delay) */}
            <LazyFloatingCartButton />
            {/* FloatingCurrencySelector: Deferred hydration (100ms delay) */}
            <LazyFloatingCurrencySelector />
            {/* WebVitals: Deferred hydration (requestIdleCallback) */}
            <LazyWebVitals />
            <ToastProvider />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
