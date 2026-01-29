"use client";

import * as React from "react";
import { Container } from "@/components/ui/container";
import { H1, H2, H3, Body } from "@/components/ui/typography";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { RefreshCw, Clock, CheckCircle, XCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * Returns & Exchange Page Client Component
 * 
 * Displays returns and exchange policy information.
 */
export function ReturnsExchangePageClient(): JSX.Element {
  const { theme } = useTheme();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Returns & Exchange" },
  ];

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      theme === "dark" ? "bg-dark-bg-primary" : "bg-cream-50"
    )}>
      {/* Breadcrumb */}
      <div className="pt-20 md:pt-24 pb-4">
        <Container size="lg">
          <Breadcrumb items={breadcrumbItems} generateStructuredData={false} />
        </Container>
      </div>

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
              Returns & Exchange
            </H1>
            <Body className={cn(
              "text-xl md:text-2xl leading-relaxed transition-colors duration-300",
              theme === "dark" ? "text-dark-text-secondary" : "text-cream-100"
            )}>
              Our 30-day return policy ensures you&apos;re completely satisfied with your purchase
            </Body>
          </div>
        </Container>
      </section>

      {/* Policy Overview Section */}
      <section className="py-16 md:py-24 lg:py-32">
        <Container size="lg">
          <div className="max-w-4xl mx-auto">
            <div className={cn(
              "p-8 rounded-lg border mb-12 transition-colors duration-300",
              theme === "dark"
                ? "bg-dark-surface border-dark-border-glass"
                : "bg-white border-cream-200 shadow-sm"
            )}>
              <div className="flex items-center gap-4 mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300",
                  theme === "dark" ? "bg-accent-primary/20" : "bg-navy-900/10"
                )}>
                  <Clock className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    theme === "dark" ? "text-accent-primary" : "text-navy-900"
                  )} />
                </div>
                <H2 className={cn(
                  "transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}>
                  30-Day Return Policy
                </H2>
              </div>
              <Body className={cn(
                "text-lg leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                We want you to love your purchase. If you&apos;re not completely satisfied, you can return 
                unworn items with tags attached within 30 days of delivery for a full refund or exchange. 
                Returns are free for orders over ₵100 within Ghana.
              </Body>
            </div>

            {/* Return Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className={cn(
                "p-6 rounded-lg border transition-colors duration-300",
                theme === "dark"
                  ? "bg-dark-surface border-dark-border-glass"
                  : "bg-white border-cream-200 shadow-sm"
              )}>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  )} />
                  <H3 className={cn(
                    "transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Eligible for Return
                  </H3>
                </div>
                <ul className={cn(
                  "space-y-2 text-sm transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                )}>
                  <li>• Items unworn and unwashed</li>
                  <li>• Original tags still attached</li>
                  <li>• Original packaging included (if applicable)</li>
                  <li>• Returned within 30 days of delivery</li>
                  <li>• Proof of purchase provided</li>
                </ul>
              </div>

              <div className={cn(
                "p-6 rounded-lg border transition-colors duration-300",
                theme === "dark"
                  ? "bg-dark-surface border-dark-border-glass"
                  : "bg-white border-cream-200 shadow-sm"
              )}>
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  )} />
                  <H3 className={cn(
                    "transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Not Eligible for Return
                  </H3>
                </div>
                <ul className={cn(
                  "space-y-2 text-sm transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                )}>
                  <li>• Items worn, washed, or damaged</li>
                  <li>• Items without original tags</li>
                  <li>• Final sale items (clearly marked)</li>
                  <li>• Items returned after 30 days</li>
                  <li>• Personalized or customized items</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Return Process Section */}
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
              How to Return or Exchange
            </H2>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg transition-colors duration-300",
                  theme === "dark" ? "bg-accent-primary text-dark-bg-primary" : "bg-navy-900 text-cream-50"
                )}>
                  1
                </div>
                <div className="flex-1">
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Contact Us
                  </H3>
                  <Body className={cn(
                    "transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    Email us at <a href="mailto:returns@extremedeptkidz.com" className={cn(
                      "underline transition-colors duration-300",
                      theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                    )}>returns@extremedeptkidz.com</a> or use our <a href="/contact" className={cn(
                      "underline transition-colors duration-300",
                      theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                    )}>contact form</a> with your order number and the items you&apos;d like to return or exchange. 
                    Please include photos if the item is damaged or defective.
                  </Body>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg transition-colors duration-300",
                  theme === "dark" ? "bg-accent-primary text-dark-bg-primary" : "bg-navy-900 text-cream-50"
                )}>
                  2
                </div>
                <div className="flex-1">
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Receive Return Authorization
                  </H3>
                  <Body className={cn(
                    "transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    We&apos;ll review your request and send you a Return Authorization (RA) number within 1-2 business days. 
                    This number must be included with your return package.
                  </Body>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg transition-colors duration-300",
                  theme === "dark" ? "bg-accent-primary text-dark-bg-primary" : "bg-navy-900 text-cream-50"
                )}>
                  3
                </div>
                <div className="flex-1">
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Package & Ship
                  </H3>
                  <Body className={cn(
                    "transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    Package the items securely in their original packaging (if available) with all tags attached. 
                    Include the RA number and your order number. Ship to the address provided in your return authorization email. 
                    We recommend using a trackable shipping method.
                  </Body>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg transition-colors duration-300",
                  theme === "dark" ? "bg-accent-primary text-dark-bg-primary" : "bg-navy-900 text-cream-50"
                )}>
                  4
                </div>
                <div className="flex-1">
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Receive Refund or Exchange
                  </H3>
                  <Body className={cn(
                    "transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    Once we receive and inspect your return (typically within 5-7 business days), we&apos;ll process your refund 
                    or ship your exchange. Refunds will be issued to the original payment method within 5-10 business days.
                  </Body>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Exchange Policy Section */}
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
                  <RefreshCw className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    theme === "dark" ? "text-accent-primary" : "text-navy-900"
                  )} />
                </div>
                <H2 className={cn(
                  "transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}>
                  Exchange Policy
                </H2>
              </div>
              <div className="space-y-4">
                <Body className={cn(
                  "leading-relaxed transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                )}>
                  Exchanges are available for different sizes or colors of the same item, subject to availability. 
                  If the item you want is out of stock, we&apos;ll issue a refund instead.
                </Body>
                <Body className={cn(
                  "leading-relaxed transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                )}>
                  <strong>Exchange Process:</strong> Follow the same return process above, but specify in your email 
                  that you&apos;d like to exchange for a different size or color. Include the size/color you&apos;d like 
                  in your request. If there&apos;s a price difference, we&apos;ll charge or refund the difference accordingly.
                </Body>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Important Notes Section */}
      <section className={cn(
        "py-16 md:py-24 lg:py-32 transition-colors duration-300",
        theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-100"
      )}>
        <Container size="lg">
          <div className="max-w-4xl mx-auto">
            <H2 className={cn(
              "mb-6 transition-colors duration-300",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              Important Notes
            </H2>
            <div className={cn(
              "p-6 rounded-lg border space-y-4 transition-colors duration-300",
              theme === "dark"
                ? "bg-dark-surface border-dark-border-glass"
                : "bg-white border-cream-200"
            )}>
              <Body className={cn(
                "transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                • Return shipping costs are the customer&apos;s responsibility unless the item is defective or incorrect.<br />
                • Free returns are available for orders over ₵100 within Ghana.<br />
                • Refunds are processed to the original payment method. Processing times vary by payment provider.<br />
                • Sale items are eligible for return or exchange, subject to the same conditions.<br />
                • For defective items, we&apos;ll cover return shipping costs and may request photos for verification.<br />
                • International returns may be subject to customs fees, which are the customer&apos;s responsibility.<br />
                • Questions? Contact us at <a href="mailto:returns@extremedeptkidz.com" className={cn(
                  "underline transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                )}>returns@extremedeptkidz.com</a> or visit our <a href="/contact" className={cn(
                  "underline transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                )}>contact page</a>.
              </Body>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
