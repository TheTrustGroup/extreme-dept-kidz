import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LookDetailClient } from "./LookDetailClient";
import { styleLooks } from "@/lib/mock-data/styling-data";
import { generateBreadcrumbSchema } from "@/lib/seo/structured-data";

interface LookDetailPageProps {
  params: {
    lookId: string;
  };
}

/**
 * Generate metadata for look detail page
 */
export async function generateMetadata({
  params,
}: LookDetailPageProps): Promise<Metadata> {
  const look = styleLooks.find(l => l.id === params.lookId);

  if (!look) {
    return {
      title: "Look Not Found | Extreme Dept Kidz",
    };
  }

  return {
    title: `${look.name} | Complete Look | Extreme Dept Kidz`,
    description: look.description,
    keywords: [
      look.name,
      "complete look",
      "outfit",
      "boys fashion",
      "styled outfit",
    ],
    alternates: {
      canonical: `https://extremedeptkidz.com/style-guide/${look.id}`,
    },
    openGraph: {
      title: `${look.name} | Complete Look`,
      description: look.description,
      images: [look.mainImage],
    },
  };
}

/**
 * Look Detail Page
 * 
 * Detailed view of a single complete look.
 */
export default function LookDetailPage({ params }: LookDetailPageProps): JSX.Element {
  const look = styleLooks.find(l => l.id === params.lookId);

  if (!look) {
    notFound();
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Style Guide", url: "/style-guide" },
    { name: look.name, url: `/style-guide/${look.id}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <LookDetailClient look={look} />
    </>
  );
}
