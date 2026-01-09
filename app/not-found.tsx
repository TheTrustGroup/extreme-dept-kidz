import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { H1, Body } from "@/components/ui/typography";

export default function NotFound(): JSX.Element {
  return (
    <div className="min-h-screen bg-cream-50 pt-16 xs:pt-18 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
      <Container size="lg">
        <div className="max-w-2xl mx-auto text-center py-16">
          <H1 className="text-charcoal-900 mb-4 text-6xl sm:text-7xl font-serif font-bold">
            404
          </H1>
          <H1 className="text-charcoal-900 mb-4 text-2xl sm:text-3xl font-serif font-bold">
            Page Not Found
          </H1>
          <Body className="text-lg text-charcoal-600 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. 
            Explore our collections or return to the homepage.
          </Body>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" asChild>
              <Link href="/">Go Home</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/collections">View Collections</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
