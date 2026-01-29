"use client";

import * as React from "react";
import { Container } from "@/components/ui/container";
import { H1, H2, H3, Body } from "@/components/ui/typography";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Truck, Clock, Globe, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * Shipping Info Page Client Component
 * 
 * Displays shipping information including times, costs, and delivery options.
 */
export function ShippingInfoPageClient(): JSX.Element {
  const { theme } = useTheme();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shipping Info" },
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
              Shipping Information
            </H1>
            <Body className={cn(
              "text-xl md:text-2xl leading-relaxed transition-colors duration-300",
              theme === "dark" ? "text-dark-text-secondary" : "text-cream-100"
            )}>
              Fast, reliable shipping to Ghana and around the world
            </Body>
          </div>
        </Container>
      </section>

      {/* Shipping Options Section */}
      <section className="py-16 md:py-24 lg:py-32">
        <Container size="lg">
          <div className="text-center mb-16">
            <H2 className={cn(
              "mb-4 transition-colors duration-300",
              theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
            )}>
              Shipping Options
            </H2>
            <Body className={cn(
              "text-lg transition-colors duration-300",
              theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-600"
            )}>
              Choose the shipping method that works best for you
            </Body>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Ghana Shipping */}
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
                  <Truck className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    theme === "dark" ? "text-accent-primary" : "text-navy-900"
                  )} />
                </div>
                <H3 className={cn(
                  "transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}>
                  Ghana Shipping
                </H3>
              </div>
              <div className="space-y-4">
                <div>
                  <Body className={cn(
                    "font-semibold mb-2 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Standard Shipping
                  </Body>
                  <Body className={cn(
                    "transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    <strong>Time:</strong> 5-7 business days<br />
                    <strong>Cost:</strong> ₵25 - ₵50 (based on weight and location)
                  </Body>
                </div>
                <div>
                  <Body className={cn(
                    "font-semibold mb-2 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Express Shipping
                  </Body>
                  <Body className={cn(
                    "transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    <strong>Time:</strong> 2-3 business days<br />
                    <strong>Cost:</strong> ₵50 - ₵100 (based on weight and location)
                  </Body>
                </div>
                <div>
                  <Body className={cn(
                    "font-semibold mb-2 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Same-Day Delivery (Accra & Kumasi)
                  </Body>
                  <Body className={cn(
                    "transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    <strong>Time:</strong> Same day (orders placed before 12 PM)<br />
                    <strong>Cost:</strong> ₵75 - ₵150
                  </Body>
                </div>
              </div>
            </div>

            {/* International Shipping */}
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
                  <Globe className={cn(
                    "w-6 h-6 transition-colors duration-300",
                    theme === "dark" ? "text-accent-primary" : "text-navy-900"
                  )} />
                </div>
                <H3 className={cn(
                  "transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                )}>
                  International Shipping
                </H3>
              </div>
              <div className="space-y-4">
                <div>
                  <Body className={cn(
                    "font-semibold mb-2 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Standard International
                  </Body>
                  <Body className={cn(
                    "transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    <strong>Time:</strong> 10-14 business days<br />
                    <strong>Cost:</strong> $25 - $50 USD (calculated at checkout)
                  </Body>
                </div>
                <div>
                  <Body className={cn(
                    "font-semibold mb-2 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Express International
                  </Body>
                  <Body className={cn(
                    "transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    <strong>Time:</strong> 5-7 business days<br />
                    <strong>Cost:</strong> $50 - $100 USD (calculated at checkout)
                  </Body>
                </div>
                <div>
                  <Body className={cn(
                    "font-semibold mb-2 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    DHL Express
                  </Body>
                  <Body className={cn(
                    "transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    <strong>Time:</strong> 3-5 business days<br />
                    <strong>Cost:</strong> $75 - $150 USD (calculated at checkout)
                  </Body>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Processing & Delivery Section */}
      <section className={cn(
        "py-16 md:py-24 lg:py-32 transition-colors duration-300",
        theme === "dark" ? "bg-dark-bg-secondary" : "bg-cream-100"
      )}>
        <Container size="lg">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                Processing & Delivery
              </H2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300",
                    theme === "dark" ? "bg-accent-primary/20" : "bg-navy-900/10"
                  )}>
                    <Package className={cn(
                      "w-5 h-5 transition-colors duration-300",
                      theme === "dark" ? "text-accent-primary" : "text-navy-900"
                    )} />
                  </div>
                  <div>
                    <Body className={cn(
                      "font-semibold mb-2 transition-colors duration-300",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}>
                      Order Processing
                    </Body>
                    <Body className={cn(
                      "transition-colors duration-300",
                      theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                    )}>
                      All orders are processed within 1-2 business days (Monday-Friday, excluding public holidays). 
                      You will receive an email confirmation with your order number and tracking information once your order ships.
                    </Body>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300",
                    theme === "dark" ? "bg-accent-primary/20" : "bg-navy-900/10"
                  )}>
                    <Clock className={cn(
                      "w-5 h-5 transition-colors duration-300",
                      theme === "dark" ? "text-accent-primary" : "text-navy-900"
                    )} />
                  </div>
                  <div>
                    <Body className={cn(
                      "font-semibold mb-2 transition-colors duration-300",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}>
                      Delivery Times
                    </Body>
                    <Body className={cn(
                      "transition-colors duration-300",
                      theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                    )}>
                      Delivery times are estimates and begin from the date your order ships, not the date you place your order. 
                      International orders may be subject to customs delays, which are beyond our control.
                    </Body>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300",
                    theme === "dark" ? "bg-accent-primary/20" : "bg-navy-900/10"
                  )}>
                    <Truck className={cn(
                      "w-5 h-5 transition-colors duration-300",
                      theme === "dark" ? "text-accent-primary" : "text-navy-900"
                    )} />
                  </div>
                  <div>
                    <Body className={cn(
                      "font-semibold mb-2 transition-colors duration-300",
                      theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                    )}>
                      Tracking Your Order
                    </Body>
                    <Body className={cn(
                      "transition-colors duration-300",
                      theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                    )}>
                      Once your order ships, you&apos;ll receive a tracking number via email. 
                      You can track your order status using our <a href="/track-order" className={cn(
                        "underline transition-colors duration-300",
                        theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                      )}>order tracking page</a> or by contacting our customer service team.
                    </Body>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Important Notes Section */}
      <section className="py-16 md:py-24 lg:py-32">
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
                : "bg-cream-100 border-cream-200"
            )}>
              <Body className={cn(
                "transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                • Shipping costs are calculated at checkout based on your location and order weight.<br />
                • Free shipping is available for orders over ₵500 within Ghana and $100 USD for international orders.<br />
                • We are not responsible for delays caused by customs, weather, or other factors beyond our control.<br />
                • Please ensure your shipping address is correct. We cannot be held responsible for orders shipped to incorrect addresses.<br />
                • For questions about shipping, please contact us at <a href="mailto:info@extremedeptkidz.com" className={cn(
                  "underline transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                )}>info@extremedeptkidz.com</a> or visit our <a href="/contact" className={cn(
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
