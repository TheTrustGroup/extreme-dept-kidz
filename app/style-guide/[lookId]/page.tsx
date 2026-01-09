import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LookDetailClient } from "./LookDetailClient";
import { styleLooks } from "@/lib/mock-data/styling-data";

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

  return <LookDetailClient look={look} />;
}
