"use client";

import * as React from "react";
import { Container } from "@/components/ui/container";
import { H1, H2, H3, Body } from "@/components/ui/typography";
import { Shield, Eye, Lock, Globe, Mail, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import Link from "next/link";

/**
 * Privacy Policy Page Client Component
 * 
 * Comprehensive privacy policy covering data collection, usage, and user rights.
 */
export function PrivacyPolicyPageClient(): JSX.Element {
  const { theme } = useTheme();

  return (
    <main className={cn(
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
                <Shield className={cn(
                  "w-8 h-8 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-cream-50"
                )} />
              </div>
            </div>
            <H1 className={cn(
              "mb-6 transition-colors duration-300",
              theme === "dark" ? "text-dark-text-primary" : "text-cream-50"
            )}>
              Privacy Policy
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
        <Container size="lg" className="prose max-w-[720px] pb-24">
          <div className="max-w-4xl mx-auto prose prose-lg">
            {/* Introduction */}
            <div className="mb-12">
              <Body className={cn(
                "text-lg leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                At Extreme Dept Kidz (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, make a purchase, or interact with our services.
              </Body>
              <Body className={cn(
                "text-lg leading-relaxed mt-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                By using our website or services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
              </Body>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 flex items-center gap-3 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                <Eye className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-navy-900"
                )} />
                1. Information We Collect
              </H2>
              
              <div className="space-y-6">
                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    1.1 Personal Information
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    We collect personal information that you voluntarily provide to us when you:
                  </Body>
                  <ul className={cn(
                    "list-disc pl-6 mt-3 space-y-2 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    <li>Create an account or make a purchase</li>
                    <li>Subscribe to our newsletter or marketing communications</li>
                    <li>Contact us via email, phone, or contact forms</li>
                    <li>Participate in surveys, contests, or promotions</li>
                    <li>Leave reviews or comments</li>
                  </ul>
                  <Body className={cn(
                    "leading-relaxed mt-4 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    This information may include: name, email address, phone number, shipping address, billing address, payment information, date of birth, and any other information you choose to provide.
                  </Body>
                </div>

                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    1.2 Automatically Collected Information
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    When you visit our website, we automatically collect certain information about your device and browsing behavior, including:
                  </Body>
                  <ul className={cn(
                    "list-disc pl-6 mt-3 space-y-2 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    <li>IP address and location data</li>
                    <li>Browser type and version</li>
                    <li>Device information (type, operating system)</li>
                    <li>Pages visited and time spent on pages</li>
                    <li>Referring website addresses</li>
                    <li>Search terms used to find our website</li>
                    <li>Clickstream data and navigation patterns</li>
                  </ul>
                </div>

                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    1.3 Cookies and Tracking Technologies
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    We use cookies, web beacons, and similar tracking technologies to enhance your browsing experience, analyze website traffic, and personalize content. Cookies are small data files stored on your device. You can control cookies through your browser settings, though disabling cookies may limit certain website functionality.
                  </Body>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                2. How We Use Your Information
              </H2>
              
              <Body className={cn(
                "leading-relaxed mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                We use the information we collect for the following purposes:
              </Body>
              
              <ul className={cn(
                "list-disc pl-6 space-y-2 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                <li><strong>Order Processing:</strong> To process and fulfill your orders, manage payments, and arrange shipping</li>
                <li><strong>Customer Service:</strong> To respond to your inquiries, provide support, and handle returns or exchanges</li>
                <li><strong>Account Management:</strong> To create and manage your account, verify your identity, and maintain your preferences</li>
                <li><strong>Marketing:</strong> To send promotional emails, newsletters, and special offers (with your consent)</li>
                <li><strong>Website Improvement:</strong> To analyze website usage, improve user experience, and develop new features</li>
                <li><strong>Security:</strong> To detect and prevent fraud, unauthorized access, and other security threats</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
                <li><strong>Business Operations:</strong> To conduct business analytics, manage inventory, and improve our services</li>
              </ul>
            </div>

            {/* Information Sharing */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 flex items-center gap-3 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                <Globe className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-navy-900"
                )} />
                3. Information Sharing and Disclosure
              </H2>
              
              <Body className={cn(
                "leading-relaxed mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                We do not sell your personal information. We may share your information in the following circumstances:
              </Body>
              
              <div className="space-y-4">
                <div>
                  <H3 className={cn(
                    "mb-2 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    3.1 Service Providers
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    We may share information with third-party service providers who perform services on our behalf, such as payment processing, shipping, email delivery, website hosting, data analytics, and customer service. These providers are contractually obligated to protect your information and use it only for the purposes we specify.
                  </Body>
                </div>

                <div>
                  <H3 className={cn(
                    "mb-2 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    3.2 Business Transfers
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change in ownership or control.
                  </Body>
                </div>

                <div>
                  <H3 className={cn(
                    "mb-2 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    3.3 Legal Requirements
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    We may disclose your information if required by law, court order, or government regulation, or if we believe disclosure is necessary to protect our rights, property, or safety, or that of our customers or others.
                  </Body>
                </div>

                <div>
                  <H3 className={cn(
                    "mb-2 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    3.4 With Your Consent
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    We may share your information with your explicit consent or at your direction.
                  </Body>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 flex items-center gap-3 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                <Lock className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-navy-900"
                )} />
                4. Data Security
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </Body>
              
              <ul className={cn(
                "list-disc pl-6 mt-4 space-y-2 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure payment processing through PCI-compliant providers</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication procedures</li>
                <li>Employee training on data protection</li>
              </ul>
              
              <Body className={cn(
                "leading-relaxed mt-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </Body>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                5. Your Rights and Choices
              </H2>
              
              <Body className={cn(
                "leading-relaxed mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                Depending on your location, you may have certain rights regarding your personal information:
              </Body>
              
              <ul className={cn(
                "list-disc pl-6 space-y-2 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing of your information for certain purposes</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              
              <Body className={cn(
                "leading-relaxed mt-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                To exercise these rights, please contact us using the information provided in the &quot;Contact Us&quot; section below. We will respond to your request within a reasonable timeframe and in accordance with applicable law.
              </Body>
            </div>

            {/* Children's Privacy */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                6. Children&apos;s Privacy
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. If we become aware that we have collected information from a child under 13, we will take steps to delete such information promptly.
              </Body>
            </div>

            {/* International Data Transfers */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                7. International Data Transfers
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. We take appropriate safeguards to ensure your information receives adequate protection, including through standard contractual clauses and other mechanisms recognized by applicable data protection laws.
              </Body>
            </div>

            {/* Data Retention */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                8. Data Retention
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
              </Body>
            </div>

            {/* Changes to This Policy */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 flex items-center gap-3 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                <Calendar className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-navy-900"
                )} />
                9. Changes to This Privacy Policy
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
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
                10. Contact Us
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
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
    </main>
  );
}
