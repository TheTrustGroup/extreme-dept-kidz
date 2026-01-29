"use client";

import * as React from "react";
import { Container } from "@/components/ui/container";
import { H1, H2, H3, Body } from "@/components/ui/typography";
import { Accessibility, CheckCircle, AlertTriangle, Mail, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import Link from "next/link";

/**
 * Accessibility Page Client Component
 * 
 * Comprehensive accessibility statement covering commitment, standards, and features.
 */
export function AccessibilityPageClient(): JSX.Element {
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
                <Accessibility className={cn(
                  "w-8 h-8 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-cream-50"
                )} />
              </div>
            </div>
            <H1 className={cn(
              "mb-6 transition-colors duration-300",
              theme === "dark" ? "text-dark-text-primary" : "text-cream-50"
            )}>
              Accessibility Statement
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
            {/* Commitment */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                Our Commitment
              </H2>
              
              <Body className={cn(
                "text-lg leading-relaxed mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                Extreme Dept Kidz is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to achieve these goals.
              </Body>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                We believe that everyone should be able to access and enjoy our website, regardless of their abilities. Our goal is to provide an inclusive online experience that meets or exceeds the requirements of the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
              </Body>
            </div>

            {/* Standards */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                Accessibility Standards
              </H2>
              
              <Body className={cn(
                "leading-relaxed mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                We aim to conform to the <a href="https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_overview&levels=aaa" target="_blank" rel="noopener noreferrer" className={cn(
                  "underline transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                )}>
                  Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
                  <ExternalLink className="inline w-4 h-4 ml-1" />
                </a> standards. These guidelines explain how to make web content more accessible for people with disabilities and user-friendly for everyone.
              </Body>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                Our website is designed and developed with accessibility in mind from the ground up, incorporating best practices for semantic HTML, keyboard navigation, screen reader compatibility, and visual design.
              </Body>
            </div>

            {/* Accessibility Features */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 flex items-center gap-3 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                <CheckCircle className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-navy-900"
                )} />
                Accessibility Features
              </H2>
              
              <Body className={cn(
                "leading-relaxed mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                Our website includes the following accessibility features:
              </Body>
              
              <div className="space-y-6">
                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Keyboard Navigation
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    All interactive elements can be accessed and operated using only a keyboard. We provide visible focus indicators to help users navigate the site efficiently.
                  </Body>
                </div>

                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Screen Reader Support
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    Our website is compatible with popular screen readers including JAWS, NVDA, and VoiceOver. We use semantic HTML, proper heading structure, and descriptive alt text for images to ensure content is accessible.
                  </Body>
                </div>

                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Visual Design
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    We maintain sufficient color contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text) to ensure readability. Text can be resized up to 200% without loss of functionality. We avoid using color alone to convey information.
                  </Body>
                </div>

                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Forms and Inputs
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    All form fields have associated labels, and error messages are clearly identified and described. Required fields are clearly marked, and validation errors are announced to screen reader users.
                  </Body>
                </div>

                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Alternative Text
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    All meaningful images include descriptive alternative text. Decorative images are marked appropriately so screen readers can skip them.
                  </Body>
                </div>

                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Responsive Design
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    Our website is responsive and works across a variety of devices and screen sizes, ensuring accessibility on mobile, tablet, and desktop devices.
                  </Body>
                </div>

                <div>
                  <H3 className={cn(
                    "mb-3 transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
                  )}>
                    Skip Links
                  </H3>
                  <Body className={cn(
                    "leading-relaxed transition-colors duration-300",
                    theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
                  )}>
                    Skip navigation links are provided to allow users to bypass repetitive content and navigate directly to main content areas.
                  </Body>
                </div>
              </div>
            </div>

            {/* Known Issues */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 flex items-center gap-3 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                <AlertTriangle className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  theme === "dark" ? "text-accent-primary" : "text-navy-900"
                )} />
                Known Issues and Areas for Improvement
              </H2>
              
              <Body className={cn(
                "leading-relaxed mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                While we strive to ensure accessibility, we recognize that some areas of our website may need improvement. We are actively working to address the following:
              </Body>
              
              <ul className={cn(
                "list-disc pl-6 space-y-2 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                <li>Some third-party content and widgets may not fully meet accessibility standards</li>
                <li>Older product images may lack comprehensive alternative text descriptions</li>
                <li>Some interactive elements may benefit from additional ARIA labels</li>
                <li>Video content may need captions and transcripts (we are working to add these)</li>
              </ul>
              
              <Body className={cn(
                "leading-relaxed mt-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                We are committed to continuous improvement and regularly audit our website for accessibility issues. We prioritize fixing identified barriers based on their impact and severity.
              </Body>
            </div>

            {/* Third-Party Content */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                Third-Party Content
              </H2>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                Our website may include content from third-party services, such as payment processors, social media widgets, and analytics tools. While we strive to work with accessible third-party providers, we cannot guarantee the accessibility of all third-party content. If you encounter accessibility issues with third-party content, please contact us, and we will work to find an accessible alternative.
              </Body>
            </div>

            {/* Feedback */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                Feedback and Reporting Accessibility Issues
              </H2>
              
              <Body className={cn(
                "leading-relaxed mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                We welcome your feedback on the accessibility of our website. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:
              </Body>
              
              <ul className={cn(
                "list-disc pl-6 space-y-2 mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                <li>Describe the accessibility issue you encountered</li>
                <li>Include the URL of the page where you experienced the issue</li>
                <li>Specify what you were trying to do when the issue occurred</li>
                <li>Let us know what assistive technology you were using (if applicable)</li>
              </ul>
              
              <Body className={cn(
                "leading-relaxed transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                We aim to respond to accessibility feedback within 5 business days and will work to address reported issues promptly.
              </Body>
            </div>

            {/* Assistive Technologies */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                Assistive Technologies
              </H2>
              
              <Body className={cn(
                "leading-relaxed mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                Our website is designed to work with the following assistive technologies:
              </Body>
              
              <ul className={cn(
                "list-disc pl-6 space-y-2 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                <li>Screen readers (JAWS, NVDA, VoiceOver, TalkBack)</li>
                <li>Screen magnification software</li>
                <li>Voice recognition software</li>
                <li>Keyboard-only navigation</li>
                <li>Switch devices</li>
                <li>Browser zoom and text size adjustments</li>
              </ul>
            </div>

            {/* Ongoing Efforts */}
            <div className="mb-12">
              <H2 className={cn(
                "mb-6 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-primary" : "text-charcoal-900"
              )}>
                Ongoing Accessibility Efforts
              </H2>
              
              <Body className={cn(
                "leading-relaxed mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                Accessibility is an ongoing effort. We regularly:
              </Body>
              
              <ul className={cn(
                "list-disc pl-6 space-y-2 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                <li>Conduct accessibility audits and testing</li>
                <li>Train our team on accessibility best practices</li>
                <li>Review and update our website based on user feedback</li>
                <li>Stay current with accessibility standards and guidelines</li>
                <li>Test new features for accessibility before launch</li>
              </ul>
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
                Contact Us
              </H2>
              
              <Body className={cn(
                "leading-relaxed mb-4 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                If you have questions, concerns, or need assistance accessing our website, please contact us:
              </Body>
              
              <div className={cn(
                "space-y-2 transition-colors duration-300",
                theme === "dark" ? "text-dark-text-secondary" : "text-charcoal-700"
              )}>
                <Body>
                  <strong>Extreme Dept Kidz</strong><br />
                  Email: <a href="mailto:info@extremedeptkidz.com" className={cn(
                    "underline transition-colors duration-300",
                    theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                  )}>info@extremedeptkidz.com</a><br />
                  Subject Line: &quot;Accessibility Inquiry&quot;<br />
                  Website: <Link href="/contact" className={cn(
                    "underline transition-colors duration-300",
                    theme === "dark" ? "text-accent-primary hover:text-accent-primary/80" : "text-navy-900 hover:text-navy-700"
                  )}>Contact Page</Link>
                </Body>
              </div>
              
              <Body className={cn(
                "leading-relaxed mt-6 text-sm transition-colors duration-300",
                theme === "dark" ? "text-dark-text-muted" : "text-charcoal-600"
              )}>
                We are committed to providing an accessible experience and will work with you to address any accessibility concerns you may have.
              </Body>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
