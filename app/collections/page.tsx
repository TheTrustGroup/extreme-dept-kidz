import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { H1, Body } from "@/components/ui/typography";
import { mockCollections } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Collections | Extreme Dept Kidz",
  description:
    "Explore our curated collections of premium kids fashion. From new arrivals to timeless essentials, discover pieces designed for the modern family.",
  keywords: [
    "kids fashion collections",
    "premium children's clothing",
    "luxury kids fashion",
    "new arrivals",
    "kids clothing collections",
  ],
  alternates: {
    canonical: "https://extremedeptkidz.com/collections",
  },
  openGraph: {
    title: "Collections | Extreme Dept Kidz",
    description:
      "Explore our curated collections of premium kids fashion. From new arrivals to timeless essentials.",
    url: "https://extremedeptkidz.com/collections",
  },
};

/**
 * Collections Index Page
 * 
 * Displays all available collections.
 */
export default function CollectionsPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-cream-50 pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
      <Container size="lg">
        {/* Page Header */}
        <div className="text-center mb-12 md:mb-16">
          <H1 className="text-charcoal-900 mb-4 text-2xl xs:text-3xl sm:text-4xl">
            Our Collections
          </H1>
          <Body className="text-lg text-charcoal-600 max-w-2xl mx-auto">
            Discover thoughtfully curated collections designed for every moment
            and occasion. Each piece is crafted with uncompromising attention to
            detail.
          </Body>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {mockCollections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-cream-100 mb-4">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="font-serif text-2xl md:text-3xl font-semibold text-cream-50 drop-shadow-md">
                    {collection.name}
                  </h2>
                </div>
              </div>
              {collection.description && (
                <Body className="text-charcoal-700 text-center">
                  {collection.description}
                </Body>
              )}
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}

