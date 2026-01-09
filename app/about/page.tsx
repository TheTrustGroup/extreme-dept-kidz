import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { H1, H2, H3, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us | Extreme Dept Kidz",
  description:
    "Discover the story behind Extreme Dept Kidz. We craft premium fashion for the modern family with uncompromising quality and timeless design.",
  keywords: [
    "about us",
    "brand story",
    "luxury kids fashion",
    "premium children's clothing",
    "quality",
    "sustainability",
  ],
  alternates: {
    canonical: "https://extremedeptkidz.com/about",
  },
  openGraph: {
    title: "About Us | Extreme Dept Kidz",
    description:
      "Discover the story behind Extreme Dept Kidz. We craft premium fashion for the modern family with uncompromising quality and timeless design.",
    url: "https://extremedeptkidz.com/about",
    images: [
      {
        url: "https://extremedeptkidz.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "About Extreme Dept Kidz",
      },
    ],
  },
};

/**
 * About Page
 * 
 * Editorial about page with brand story, values, and founder section.
 * Luxury lookbook aesthetic with storytelling focus.
 */
export default function AboutPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden bg-charcoal-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/60 via-charcoal-900/50 to-charcoal-900/70" />
        </div>

        <Container size="lg" className="relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <H1 className="text-cream-50 mb-6 drop-shadow-lg">
              Crafting Tomorrow&apos;s Style
            </H1>
            <Body className="text-xl md:text-2xl text-cream-100 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Where luxury meets playfulness, and every piece tells a story of
              uncompromising quality and timeless design.
            </Body>
          </div>
        </Container>
      </section>

      {/* Brand Story Section */}
      <section className="py-16 md:py-24 lg:py-32">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image - Placeholder for future content */}
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-cream-200">
              {/* Image will be added later */}
            </div>

            {/* Story Content */}
            <div className="space-y-8">
              <div>
                <H2 className="text-charcoal-900 mb-6">Our Story</H2>
                <div className="space-y-6">
                  <Body className="text-lg md:text-xl text-charcoal-700 leading-relaxed">
                    Extreme Dept Kidz was born from a simple belief: children
                    deserve the same attention to detail, quality, and style
                    that we expect in our own wardrobes. Founded with a vision
                    to bridge the gap between luxury fashion and functional
                    children&apos;s wear, we create pieces that are both beautiful
                    and built to last.
                  </Body>
                  <Body className="text-lg md:text-xl text-charcoal-700 leading-relaxed">
                    Every garment in our collection is thoughtfully designed,
                    carefully sourced, and meticulously crafted. We work with
                    premium materials and trusted artisans to ensure that each
                    piece meets our exacting standards—because we believe that
                    style knows no age, and quality should be a given, not a
                    luxury.
                  </Body>
                  <Body className="text-lg md:text-xl text-charcoal-700 leading-relaxed">
                    Today, Extreme Dept Kidz stands as a testament to our
                    commitment to excellence, offering families a curated
                    selection of premium fashion that grows with their children
                    and becomes part of their most cherished memories.
                  </Body>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-cream-100">
        <Container size="lg">
          <div className="text-center mb-16">
            <H2 className="text-charcoal-900 mb-4">Our Values</H2>
            <Body className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              The principles that guide everything we create
            </Body>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Quality */}
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-navy-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-cream-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <H3 className="text-charcoal-900">Quality</H3>
              <Body className="text-charcoal-700 leading-relaxed">
                We source only the finest materials and work with skilled
                craftspeople to ensure every piece meets our uncompromising
                standards. Quality isn&apos;t an option—it&apos;s our foundation.
              </Body>
            </div>

            {/* Sustainability */}
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-forest-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-cream-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <H3 className="text-charcoal-900">Sustainability</H3>
              <Body className="text-charcoal-700 leading-relaxed">
                We&apos;re committed to responsible practices, from sourcing
                sustainable materials to creating pieces designed to last. Our
                goal is to leave a positive impact on both children and the
                planet.
              </Body>
            </div>

            {/* Design */}
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-charcoal-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-cream-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>
              <H3 className="text-charcoal-900">Design</H3>
              <Body className="text-charcoal-700 leading-relaxed">
                Our designs blend timeless elegance with contemporary edge,
                creating pieces that feel both classic and fresh. Every detail is
                intentional, every silhouette carefully considered.
              </Body>
            </div>
          </div>
        </Container>
      </section>

      {/* Founder Section */}
      <section className="py-16 md:py-24 lg:py-32">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
            {/* Founder Image */}
            <div className="lg:col-span-2 relative aspect-square rounded-lg overflow-hidden bg-cream-100">
              <Image
                src="/IMG_8620.PNG"
                alt="Founder"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>

            {/* Founder Content */}
            <div className="lg:col-span-3 space-y-6">
              <H2 className="text-charcoal-900">Meet the Founder</H2>
              <div className="space-y-4">
                <Body className="text-lg md:text-xl text-charcoal-700 leading-relaxed">
                  &quot;As a parent, I found myself frustrated by the lack of
                  options that combined true quality with thoughtful design in
                  children&apos;s fashion. Too often, we&apos;re forced to choose between
                  style and durability, or settle for pieces that don&apos;t reflect
                  our values.&quot;
                </Body>
                <Body className="text-lg md:text-xl text-charcoal-700 leading-relaxed">
                  &quot;Extreme Dept Kidz was created to change that. We believe
                  every child deserves clothing that&apos;s not just functional, but
                  beautiful—pieces that parents are proud to dress their
                  children in, and that children love to wear.&quot;
                </Body>
                <Body className="text-lg md:text-xl text-charcoal-700 leading-relaxed font-medium">
                  — Founder, Extreme Dept Kidz
                </Body>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-charcoal-900">
        <Container size="lg">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <H2 className="text-cream-50">Shop the Collection</H2>
            <Body className="text-lg md:text-xl text-cream-100 leading-relaxed">
              Discover our carefully curated selection of premium fashion for
              boys and girls. Each piece is designed to become a cherished part
              of your family&apos;s story.
            </Body>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="primary" size="lg" asChild>
                <Link href="/collections">View Collections</Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="bg-transparent border-2 border-cream-50 text-cream-50 hover:bg-cream-50 hover:text-charcoal-900"
                asChild
              >
                <Link href="/collections/new-arrivals">New Arrivals</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

