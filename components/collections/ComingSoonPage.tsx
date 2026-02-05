"use client";

import * as React from "react";
import { m } from "framer-motion";
import { Mail, Award, Calendar, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { H1, H2, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import Image from "next/image";
import { NewsletterForm } from "./NewsletterForm";

interface ComingSoonPageProps {
  collectionName: string;
  collectionSlug: string;
  estimatedLaunchDate?: string;
  heroImage?: string;
  previewImages?: string[];
}

export function ComingSoonPage({
  collectionName,
  collectionSlug,
  estimatedLaunchDate,
  heroImage = "/4677.png", // Default hero image
  previewImages = [],
}: ComingSoonPageProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Main Content */}
      <Container size="lg" className="pt-16 md:pt-20 lg:pt-24 pb-16 md:pb-20 lg:pb-24">
        <div className="space-y-16 md:space-y-20 lg:space-y-24">
          {/* Email Signup Section */}
          <m.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <H2 className={cn(
              "text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              Get Notified When We Launch
            </H2>
            <Body className={cn(
              "text-base md:text-lg mb-8",
              theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
            )}>
              Be the first to know when the {collectionName} collection drops. Sign up for exclusive early access and a special launch discount.
            </Body>

            <NewsletterForm source={`${collectionSlug}-coming-soon`} />
          </m.section>

          {/* Preview Mood Board Section */}
          {previewImages.length > 0 && (
            <m.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <H2 className={cn(
                "text-3xl md:text-4xl font-serif font-bold mb-8 text-center",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                A Glimpse of What&apos;s Coming
              </H2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {previewImages.map((image, index) => (
                  <m.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="relative aspect-square rounded-lg overflow-hidden bg-cream-100"
                  >
                    <Image
                      src={image}
                      alt={`${collectionName} preview ${index + 1}`}
                      fill
                      className="object-cover"
                      loading="lazy"
                      quality={80}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </m.div>
                ))}
              </div>
            </m.section>
          )}

          {/* What to Expect Section */}
          <m.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={cn(
              "rounded-2xl p-8 md:p-12 lg:p-16",
              theme === "dark"
                ? "bg-dark-surface border border-dark-border-glass"
                : "bg-cream-100 border border-cream-200"
            )}
          >
            <H2 className={cn(
              "text-2xl md:text-3xl font-serif font-bold mb-6 text-center",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              What to Expect
            </H2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: Award,
                  title: "Premium Quality",
                  description: "Thoughtfully crafted pieces with uncompromising attention to detail and premium materials.",
                },
                {
                  icon: Mail,
                  title: "Exclusive Access",
                  description: "Early access to new styles and special launch pricing for subscribers.",
                },
                {
                  icon: ArrowRight,
                  title: "Modern Design",
                  description: "Contemporary styles that blend comfort, style, and confidence for young legends.",
                },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <m.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="text-center"
                  >
                    <div className={cn(
                      "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4",
                      theme === "dark"
                        ? "bg-dark-bg-secondary text-accent-primary"
                        : "bg-navy-900 text-cream-50"
                    )}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className={cn(
                      "font-serif text-xl font-semibold mb-2",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}>
                      {feature.title}
                    </h3>
                    <Body className={cn(
                      "text-sm md:text-base",
                      theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
                    )}>
                      {feature.description}
                    </Body>
                  </m.div>
                );
              })}
            </div>
          </m.section>

          {/* CTA Section */}
          <m.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <H2 className={cn(
              "text-2xl md:text-3xl font-serif font-bold mb-4",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              Explore Our Current Collections
            </H2>
            <Body className={cn(
              "text-base md:text-lg mb-8",
              theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
            )}>
              While you wait, discover our curated selection of premium styles for young legends.
            </Body>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" asChild>
                <a href="/collections/boys">
                  Shop Boys Collection
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <a href="/collections">
                  View All Collections
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </div>
          </m.section>
        </div>
      </Container>
    </div>
  );
}
