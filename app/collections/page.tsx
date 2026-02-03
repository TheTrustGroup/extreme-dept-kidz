import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { H1, Body } from "@/components/ui/typography";
import { getAllCategories } from "@/lib/db";

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

/** Paths we treat as placeholder — do not show on collection cards. */
const PLACEHOLDER_IMAGE_PATHS = ["/4677.png", "/4671.png", "/4672.png", "/4674.png", "/4675.png", "/IMG_4673.png", "/IMG_4689.png"];

function isPlaceholderImage(url: string | undefined): boolean {
  if (!url) return true;
  return PLACEHOLDER_IMAGE_PATHS.some((p) => url === p || url.endsWith(p));
}

/** PHASE 9 — Safe ISR: Collections index revalidates every 60s. */
export const revalidate = 60;

/**
 * Collections Index Page
 *
 * Shows admin-created categories (Boys, Girls, Premium Kidswear, etc.) so
 * categories you add in Admin → Categories appear here. Each card links to
 * /collections/[slug], which loads products by category slug.
 * No placeholder image: cards show a styled block unless the category has a real image.
 */
export default async function CollectionsPage(): Promise<JSX.Element> {
  const categories = await getAllCategories();
  const active = categories.filter((c) => c.isActive);

  const items = active.map((c) => {
    const image = c.image && !isPlaceholderImage(c.image) ? c.image : undefined;
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? undefined,
      image,
    };
  });

  return (
    <div className="min-h-screen bg-cream-50 pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
      <Container size="lg">
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

        {items.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-lg bg-cream-100 border border-cream-200">
            <p className="text-charcoal-700 text-lg font-medium mb-2">
              No collections yet
            </p>
            <p className="text-charcoal-600 max-w-md mx-auto">
              Add categories in Admin → Categories. Each active category appears
              here and links to /collections/[slug].
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/collections/${item.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-cream-200 mb-4">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="font-serif text-2xl md:text-3xl font-semibold text-cream-50 drop-shadow-md">
                    {item.name}
                  </h2>
                </div>
              </div>
              {item.description && (
                <Body className="text-charcoal-700 text-center">
                  {item.description}
                </Body>
              )}
            </Link>
          ))}
        </div>
        )}
      </Container>
    </div>
  );
}

