import Link from "next/link";
import { Container } from "@/components/ui/container";
import { H1, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

/**
 * Product Not Found Page
 */
export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-cream-50 pt-20 md:pt-24 pb-16 flex items-center">
      <Container size="lg">
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <H1 className="text-charcoal-900">This Piece Is No Longer Available</H1>
          <Body className="text-lg text-charcoal-600">
            The item you&apos;re seeking may have been moved or is temporarily unavailable. Explore our curated collections to discover equally exceptional pieces.
          </Body>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="primary" asChild>
              <Link href="/collections">Explore Collections</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

