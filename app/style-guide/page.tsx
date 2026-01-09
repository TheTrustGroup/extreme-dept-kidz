import type { Metadata } from "next";
import { StyleGuideGalleryClient } from "./StyleGuideGalleryClient";

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
  return <StyleGuideGalleryClient />;
}
