import type { Metadata } from "next";
import { StyleGuideGalleryClient } from "./StyleGuideGalleryClient";
import { generateBreadcrumbSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Style Guide | Complete Looks | Extreme Dept Kidz",
  description:
    "Discover curated complete looks for effortless style. Expertly styled outfits for boys, ready to shop in one click.",
  keywords: [
    "complete looks",
    "outfit ideas",
    "boys fashion",
    "styled outfits",
    "curated looks",
  ],
  alternates: {
    canonical: "https://extremedeptkidz.com/style-guide",
  },
  openGraph: {
    title: "Style Guide | Complete Looks | Extreme Dept Kidz",
    description: "Discover curated complete looks for effortless style.",
    url: "https://extremedeptkidz.com/style-guide",
  },
};

/**
 * Style Guide Gallery Page
 * 
 * Shows all curated complete looks with filtering options.
 */
export default function StyleGuidePage(): JSX.Element {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Style Guide", url: "/style-guide" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <StyleGuideGalleryClient />
    </>
  );
}
