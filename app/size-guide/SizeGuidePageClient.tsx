"use client";

import * as React from "react";
import { Container } from "@/components/ui/container";
import { H1, H2, H3, Body } from "@/components/ui/typography";
import { Ruler, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * Size Guide Page Client Component
 * 
 * Displays age-to-size conversion chart and sizing information.
 */
export function SizeGuidePageClient(): JSX.Element {
  const { theme } = useTheme();

  // Size chart data
  const sizeChart = [
    { age: "2-3 Years", chest: "56-60 cm", waist: "54-58 cm", height: "92-98 cm", size: "2T/3T" },
    { age: "3-4 Years", chest: "60-64 cm", waist: "58-62 cm", height: "98-104 cm", size: "3T/4T" },
    { age: "4-5 Years", chest: "64-68 cm", waist: "62-66 cm", height: "104-110 cm", size: "4T/5T" },
    { age: "5-6 Years", chest: "68-72 cm", waist: "66-70 cm", height: "110-116 cm", size: "5T/6T" },
    { age: "6-7 Years", chest: "72-76 cm", waist: "70-74 cm", height: "116-122 cm", size: "6-7" },
    { age: "7-8 Years", chest: "76-80 cm", waist: "74-78 cm", height: "122-128 cm", size: "7-8" },
    { age: "8-9 Years", chest: "80-84 cm", waist: "78-82 cm", height: "128-134 cm", size: "8-9" },
    { age: "9-10 Years", chest: "84-88 cm", waist: "82-86 cm", height: "134-140 cm", size: "9-10" },
    { age: "10-11 Years", chest: "88-92 cm", waist: "86-90 cm", height: "140-146 cm", size: "10-11" },
    { age: "11-12 Years", chest: "92-96 cm", waist: "90-94 cm", height: "146-152 cm", size: "11-12" },
    { age: "12-13 Years", chest: "96-100 cm", waist: "94-98 cm", height: "152-158 cm", size: "12-13" },
    { age: "13-14 Years", chest: "100-104 cm", waist: "98-102 cm", height: "158-164 cm", size: "13-14" },
  ];

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      theme === "dark" ? "bg-dark-bg-primary" : "bg-cream-50"
    )}>
      {/* Hero Section */}
      <section className={cn(
        "relative py-16 md:py-24 lg:py-32 transition-colors duration-300",
        theme === "dark" ? "bg-dark-bg-secondary" : "bg-charcoal-900"
      )}>
        <Container size="lg" className="relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <H1 className={cn(
              "mb-6 transition-colors duration-300",
              theme === "dark" ? "text-dark-text-primary" : "text-cream-50"
            )}>
              Size Guide
            </H1>
            <Body className={cn(
              "text-xl md:text-2xl leading-relaxed transition-colors duration-300",
              theme === "dark" ? "text-dark-text-secondary" : "text-cream-100"
            )}>
              Find the perfect fit for your child with our comprehensive size guide
            </Body>
          </div>
        </Container>
      </section>

      {/* Size Chart Section */}
      <section className="py-16 md:py-24 lg:py-32">
        <Container size="lg">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 text-center">
              <H2 className={cn(
                "mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                Age-to-Size Conversion Chart
              </H2>
              <Body className={cn(
                "text-lg transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
              )}>
                Measurements are approximate. For the best fit, measure your child and compare to the chart below.
              </Body>
            </div>

            {/* Size Chart Table */}
            <div className="overflow-x-auto">
              <table className={cn(
                "w-full border-collapse transition-colors duration-300",
                theme === "dark" ? "bg-dark-surface" : "bg-white"
              )}>
                <thead>
                  <tr className={cn(
                    "border-b transition-colors duration-300",
                    theme === "dark" ? "border-dark-border-glass bg-dark-bg-secondary" : "border-cream-200 bg-cream-100"
                  )}>
                    <th className={cn(
                      "px-6 py-4 text-left font-semibold uppercase text-xs tracking-wider transition-colors duration-300",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}>
                      Age Range
                    </th>
                    <th className={cn(
                      "px-6 py-4 text-left font-semibold uppercase text-xs tracking-wider transition-colors duration-300",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}>
                      Size
                    </th>
                    <th className={cn(
                      "px-6 py-4 text-left font-semibold uppercase text-xs tracking-wider transition-colors duration-300",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}>
                      Chest
                    </th>
                    <th className={cn(
                      "px-6 py-4 text-left font-semibold uppercase text-xs tracking-wider transition-colors duration-300",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}>
                      Waist
                    </th>
                    <th className={cn(
                      "px-6 py-4 text-left font-semibold uppercase text-xs tracking-wider transition-colors duration-300",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}>
                      Height
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.map((row, index) => (
                    <tr
                      key={index}
                      className={cn(
                        "border-b transition-colors duration-300",
                        theme === "dark" ? "border-dark-border-glass hover:bg-dark-bg-secondary" : "border-cream-200 hover:bg-cream-50"
                      )}
                    >
                      <td className={cn(
                        "px-6 py-4 font-medium transition-colors duration-300",
                        theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                      )}>
                        {row.age}
                      </td>
                      <td className={cn(
                        "px-6 py-4 font-semibold transition-colors duration-300",
                        theme === "dark" ? "text-accent-primary" : "text-navy-900"
                      )}>
                        {row.size}
                      </td>
                      <td className={cn(
                        "px-6 py-4 transition-colors duration-300",
                        theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                      )}>
                        {row.chest}
                      </td>
                      <td className={cn(
                        "px-6 py-4 transition-colors duration-300",
                        theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                      )}>
                        {row.waist}
                      </td>
                      <td className={cn(
                        "px-6 py-4 transition-colors duration-300",
                        theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                      )}>
                        {row.height}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </section>

      {/* How to Measure Section */}
      <section className={cn(
        "py-16 md:py-24 lg:py-32 transition-colors duration-300",
        theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-100"
      )}>
        <Container size="lg">
          <div className="max-w-4xl mx-auto">
            <H2 className={cn(
              "mb-12 text-center transition-colors duration-300",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              How to Measure
            </H2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Chest Measurement */}
              <div className={cn(
                "p-6 rounded-lg border transition-colors duration-300",
                theme === "dark"
                  ? "bg-dark-surface border-dark-border-glass"
                  : "bg-white border-cream-200 shadow-sm"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors duration-300",
                  theme === "dark" ? "bg-accent-primary/20" : "bg-navy-900/10"
                )}>
                  <Ruler className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    theme === "dark" ? "text-accent-primary" : "text-navy-900"
                  )} />
                </div>
                <H3 className={cn(
                  "mb-3 transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}>
                  Chest
                </H3>
                <Body className={cn(
                  "text-sm transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                )}>
                  Measure around the fullest part of the chest, keeping the tape measure horizontal and snug but not tight.
                </Body>
              </div>

              {/* Waist Measurement */}
              <div className={cn(
                "p-6 rounded-lg border transition-colors duration-300",
                theme === "dark"
                  ? "bg-dark-surface border-dark-border-glass"
                  : "bg-white border-cream-200 shadow-sm"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors duration-300",
                  theme === "dark" ? "bg-accent-primary/20" : "bg-navy-900/10"
                )}>
                  <Ruler className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    theme === "dark" ? "text-accent-primary" : "text-navy-900"
                  )} />
                </div>
                <H3 className={cn(
                  "mb-3 transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}>
                  Waist
                </H3>
                <Body className={cn(
                  "text-sm transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                )}>
                  Measure around the natural waistline, typically the narrowest part of the torso, usually just above the belly button.
                </Body>
              </div>

              {/* Height Measurement */}
              <div className={cn(
                "p-6 rounded-lg border transition-colors duration-300",
                theme === "dark"
                  ? "bg-dark-surface border-dark-border-glass"
                  : "bg-white border-cream-200 shadow-sm"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors duration-300",
                  theme === "dark" ? "bg-accent-primary/20" : "bg-navy-900/10"
                )}>
                  <Ruler className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    theme === "dark" ? "text-accent-primary" : "text-navy-900"
                  )} />
                </div>
                <H3 className={cn(
                  "mb-3 transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}>
                  Height
                </H3>
                <Body className={cn(
                  "text-sm transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                )}>
                  Have your child stand straight against a wall without shoes. Measure from the top of the head to the floor.
                </Body>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Sizing Tips Section */}
      <section className="py-16 md:py-24 lg:py-32">
        <Container size="lg">
          <div className="max-w-4xl mx-auto">
            <div className={cn(
              "p-8 rounded-lg border transition-colors duration-300",
              theme === "dark"
                ? "bg-dark-surface border-dark-border-glass"
                : "bg-white border-cream-200 shadow-sm"
            )}>
              <div className="flex items-center gap-4 mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300",
                  theme === "dark" ? "bg-accent-primary/20" : "bg-navy-900/10"
                )}>
                  <Info className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    theme === "dark" ? "text-accent-primary" : "text-navy-900"
                  )} />
                </div>
                <H2 className={cn(
                  "transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}>
                  Sizing Tips
                </H2>
              </div>
              <div className="space-y-4">
                <Body className={cn(
                  "leading-relaxed transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                )}>
                  • <strong>Growth Room:</strong> Children grow quickly! Consider sizing up if your child is between sizes or near the upper limit of their current size range.
                </Body>
                <Body className={cn(
                  "leading-relaxed transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                )}>
                  • <strong>Fit Preference:</strong> Our sizes are designed for a comfortable, relaxed fit. If you prefer a more fitted look, you may want to size down.
                </Body>
                <Body className={cn(
                  "leading-relaxed transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                )}>
                  • <strong>Different Brands:</strong> Sizing can vary between brands. Always refer to our specific size chart rather than assuming sizes match other brands.
                </Body>
                <Body className={cn(
                  "leading-relaxed transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                )}>
                  • <strong>Measure Regularly:</strong> Children&apos;s measurements change frequently. Measure your child every few months to ensure the best fit.
                </Body>
                <Body className={cn(
                  "leading-relaxed transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                )}>
                  • <strong>Still Unsure?</strong> Our customer service team is here to help! Contact us at <a href="mailto:info@extremedeptkidz.com" className={cn(
                    "underline transition-colors duration-300",
                    theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                  )}>info@extremedeptkidz.com</a> or visit our <a href="/contact" className={cn(
                    "underline transition-colors duration-300",
                    theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                  )}>contact page</a> for personalized sizing assistance.
                </Body>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
