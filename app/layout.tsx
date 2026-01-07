import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Header, Footer } from "@/components/layout";
import { CartDrawerWrapper } from "@/components/layout/CartDrawerWrapper";
import { Providers } from "@/components/providers";
import { SkipLinks } from "@/components/a11y/SkipLinks";
import { WebVitals } from "./web-vitals";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: true,
  fallback: ["Georgia", "serif"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  preload: true,
  fallback: ["system-ui", "arial"],
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
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {/* Font preconnect for faster font loading */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Image CDN preconnect */}
        <link
          rel="preconnect"
          href="https://images.unsplash.com"
        />
        <link
          rel="dns-prefetch"
          href="https://images.unsplash.com"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <SkipLinks />
        <Providers>
          <Header cartItemCount={0} />
          <main id="main-content" className="flex-1" role="main">
            {children}
          </main>
          <Footer />
          <CartDrawerWrapper />
          <WebVitals />
        </Providers>
      </body>
    </html>
  );
}
