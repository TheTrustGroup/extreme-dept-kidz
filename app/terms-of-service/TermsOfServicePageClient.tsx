"use client";

import * as React from "react";
import { Container } from "@/components/ui/container";
import { H1, H2, H3, Body } from "@/components/ui/typography";
import { FileText, ShoppingBag, CreditCard, Truck, RefreshCw, Shield, AlertCircle, Mail, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import Link from "next/link";

/**
 * Terms of Service Page Client Component
 * 
 * Comprehensive terms and conditions covering website use, purchases, and legal rights.
 */
export function TermsOfServicePageClient(): JSX.Element {
  const { theme } = useTheme();

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
            <div className="flex justify-center mb-6">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300",
                theme === "dark" ? "bg-accent-primary/20" : "bg-cream-200/20"
              )}>
                <FileText className={cn(
                  "w-8 h-8 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-cream-50"
                )} />
              </div>
            </div>
            <H1 className={cn(
              "mb-6 transition-colors duration-300",
              theme === "dark" ? "text-dark-text-primary" : "text-cream-50"
            )}>
              Terms of Service
            </H1>
            <Body className={cn(
              "text-lg leading-relaxed transition-colors duration-300",
              theme === "dark" ? "text-dark-text-secondary" : "text-cream-200"
            )}>
              Last Updated: January 28, 2026
            </Body>
          </div>
        </Container>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24 lg:py-32">
        <Container size="lg">
          <div className="max-w-4xl mx-auto prose prose-lg">
            {/* Introduction */}
            <div className="mb-12">
              <Body className={cn(
                "text-lg leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                Welcome to Extreme Dept Kidz. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our website, products, and services (collectively, the &quot;Services&quot;). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services.
              </Body>
            </div>

            {/* Acceptance of Terms */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                1. Acceptance of Terms
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                By accessing or using our website, creating an account, or making a purchase, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. These Terms constitute a legally binding agreement between you and Extreme Dept Kidz.
              </Body>
            </div>

            {/* Eligibility */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                2. Eligibility
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                You must be at least 18 years old to use our Services or make a purchase. If you are under 18, you may use our Services only with the involvement and consent of a parent or guardian. By using our Services, you represent and warrant that you meet the age requirement and have the legal capacity to enter into these Terms.
              </Body>
            </div>

            {/* Account Registration */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                3. Account Registration
              </H2>
              
              <div className="space-y-4">
                <Body className={cn(
                  "leading-relaxed transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                )}>
                  To access certain features of our Services, you may need to create an account. When creating an account, you agree to:
                </Body>
                <ul className={cn(
                  "list-disc pl-6 space-y-2 transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                )}>
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information to keep it accurate</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
                <Body className={cn(
                  "leading-relaxed transition-colors duration-300",
                  theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                )}>
                  We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent or illegal activity.
                </Body>
              </div>
            </div>

            {/* Products and Pricing */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 flex items-center gap-3 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                <ShoppingBag className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-navy-900"
                )} />
                4. Products and Pricing
              </H2>
              
              <div className="space-y-4">
                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    4.1 Product Information
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that product descriptions, colors, or other content are accurate, complete, reliable, current, or error-free. Product images are for illustrative purposes and may not reflect the exact appearance of the product.
                  </Body>
                </div>

                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    4.2 Pricing
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    All prices are displayed in the currency indicated on the website and are subject to change without notice. Prices do not include shipping, handling, or applicable taxes, which will be calculated and displayed at checkout. We reserve the right to correct pricing errors, even after an order has been placed.
                  </Body>
                </div>

                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    4.3 Product Availability
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    Product availability is subject to change. We reserve the right to limit quantities, discontinue products, or refuse orders at our discretion. If a product becomes unavailable after you place an order, we will notify you and provide a refund or alternative option.
                  </Body>
                </div>
              </div>
            </div>

            {/* Orders and Payment */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 flex items-center gap-3 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                <CreditCard className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-navy-900"
                )} />
                5. Orders and Payment
              </H2>
              
              <div className="space-y-4">
                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    5.1 Order Acceptance
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    When you place an order, you are making an offer to purchase products. We reserve the right to accept or reject any order for any reason. Your order is not accepted until we send you an order confirmation email. If we cannot fulfill your order, we will notify you and provide a full refund.
                  </Body>
                </div>

                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    5.2 Payment Terms
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    Payment must be received before we process and ship your order. We accept various payment methods as displayed at checkout. By providing payment information, you represent that you are authorized to use the payment method. All payments are processed securely through our payment service providers.
                  </Body>
                </div>

                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    5.3 Taxes
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    You are responsible for all applicable taxes, duties, and customs fees associated with your order. Tax amounts are calculated based on your shipping address and displayed at checkout.
                  </Body>
                </div>
              </div>
            </div>

            {/* Shipping and Delivery */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 flex items-center gap-3 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                <Truck className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-navy-900"
                )} />
                6. Shipping and Delivery
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                Shipping terms, costs, and delivery times are detailed on our <Link href="/shipping-info" className={cn(
                  "underline transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                )}>Shipping Information</Link> page. Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers, customs, or other factors beyond our control. Risk of loss and title pass to you upon delivery to the carrier.
              </Body>
            </div>

            {/* Returns and Refunds */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 flex items-center gap-3 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                <RefreshCw className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-navy-900"
                )} />
                7. Returns and Refunds
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                Our return and refund policy is detailed on our <Link href="/returns-exchange" className={cn(
                  "underline transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                )}>Returns & Exchange</Link> page. By making a purchase, you agree to our return policy. Refunds will be processed to the original payment method within 5-10 business days after we receive and inspect the returned items.
              </Body>
            </div>

            {/* Intellectual Property */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                8. Intellectual Property Rights
              </H2>
              
              <Body className={cn(
                "leading-relaxed mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                All content on our website, including text, graphics, logos, images, software, and other materials, is the property of Extreme Dept Kidz or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not:
              </Body>
              
              <ul className={cn(
                "list-disc pl-6 space-y-2 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                <li>Reproduce, distribute, or create derivative works from our content</li>
                <li>Use our trademarks, logos, or brand names without permission</li>
                <li>Remove or alter copyright or trademark notices</li>
                <li>Use our content for commercial purposes without authorization</li>
              </ul>
            </div>

            {/* User Content */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                9. User Content
              </H2>
              
              <Body className={cn(
                "leading-relaxed mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                If you submit reviews, comments, photos, or other content (&quot;User Content&quot;), you grant us a non-exclusive, royalty-free, perpetual, worldwide license to use, reproduce, modify, publish, and display such content. You represent that you own or have the right to grant this license and that your content does not violate any third-party rights or applicable laws.
              </Body>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                We reserve the right to remove or edit User Content that violates these Terms or is otherwise objectionable.
              </Body>
            </div>

            {/* Prohibited Uses */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 flex items-center gap-3 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                <AlertCircle className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-navy-900"
                )} />
                10. Prohibited Uses
              </H2>
              
              <Body className={cn(
                "leading-relaxed mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                You agree not to use our Services:
              </Body>
              
              <ul className={cn(
                "list-disc pl-6 space-y-2 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                <li>For any unlawful purpose or in violation of any laws</li>
                <li>To transmit viruses, malware, or other harmful code</li>
                <li>To interfere with or disrupt our Services or servers</li>
                <li>To impersonate any person or entity</li>
                <li>To collect or harvest information about other users</li>
                <li>To engage in any fraudulent or deceptive practices</li>
                <li>To attempt to gain unauthorized access to our systems</li>
              </ul>
            </div>

            {/* Disclaimers */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                11. Disclaimers
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                OUR SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </Body>
            </div>

            {/* Limitation of Liability */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 flex items-center gap-3 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                <Shield className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-navy-900"
                )} />
                12. Limitation of Liability
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, EXTREME DEPT KIDZ SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION, ARISING FROM YOUR USE OF OUR SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE PRODUCTS IN QUESTION.
              </Body>
            </div>

            {/* Indemnification */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                13. Indemnification
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                You agree to indemnify, defend, and hold harmless Extreme Dept Kidz, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of our Services, violation of these Terms, or infringement of any rights of another party.
              </Body>
            </div>

            {/* Governing Law */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                14. Governing Law and Dispute Resolution
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                These Terms shall be governed by and construed in accordance with the laws of Ghana, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of our Services shall be resolved through good faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration or in the courts of Ghana, as applicable.
              </Body>
            </div>

            {/* Changes to Terms */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 flex items-center gap-3 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                <Calendar className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-navy-900"
                )} />
                15. Changes to These Terms
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the &quot;Last Updated&quot; date. Your continued use of our Services after such changes constitutes acceptance of the updated Terms. If you do not agree to the changes, you must stop using our Services.
              </Body>
            </div>

            {/* Severability */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                16. Severability
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
              </Body>
            </div>

            {/* Entire Agreement */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                17. Entire Agreement
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                These Terms, together with our Privacy Policy and other policies referenced herein, constitute the entire agreement between you and Extreme Dept Kidz regarding your use of our Services and supersede all prior agreements and understandings.
              </Body>
            </div>

            {/* Contact Us */}
            <div className={cn(
              "p-8 rounded-lg border transition-colors duration-300",
              theme === "dark"
                ? "bg-dark-surface border-dark-border-glass"
                : "bg-cream-100 border-cream-200"
            )}>
              <H2 className={cn(
                "mb-6 flex items-center gap-3 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                <Mail className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-navy-900"
                )} />
                18. Contact Us
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                If you have questions about these Terms, please contact us:
              </Body>
              
              <div className={cn(
                "mt-6 space-y-2 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                <Body>
                  <strong>Extreme Dept Kidz</strong><br />
                  Email: <a href="mailto:info@extremedeptkidz.com" className={cn(
                    "underline transition-colors duration-300",
                    theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                  )}>info@extremedeptkidz.com</a><br />
                  Website: <Link href="/contact" className={cn(
                    "underline transition-colors duration-300",
                    theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                  )}>Contact Page</Link>
                </Body>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
