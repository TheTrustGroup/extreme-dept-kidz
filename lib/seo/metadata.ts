import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://extremedeptkidz.com";
const SITE_NAME = "Extreme Dept Kidz";

/**
 * Generate canonical URL
 */
export function getCanonicalUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/**
 * Generate Open Graph image URL
 */
export function getOgImageUrl(imagePath?: string): string {
  if (imagePath) {
    return imagePath.startsWith("http") ? imagePath : `${SITE_URL}${imagePath}`;
  }
  return `${SITE_URL}/og-image.jpg`;
}

/**
 * Base metadata for all pages
 */
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
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
};

/**
 * Generate page metadata
 */
export function generatePageMetadata({
  title,
  description,
  path,
  keywords,
  image,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
}): Metadata {
  const canonicalUrl = getCanonicalUrl(path);
  const ogImage = getOgImageUrl(image);

  return {
    ...baseMetadata,
    title,
    description,
    keywords: keywords || [],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      ...baseMetadata.twitter,
      title,
      description,
      images: [ogImage],
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
        }
      : baseMetadata.robots,
  };
}


