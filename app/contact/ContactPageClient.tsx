"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { m, AnimatePresence } from "framer-motion";
import { Mail, Phone, CheckCircle2, ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { H1, H2, H3, Body } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Contact Form Schema
 */
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * FAQ Item
 */
interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy on all unworn items with tags attached. Items must be in original condition. Returns are free for orders over ₵100. Please contact us at returns@extremedeptkidz.com to initiate a return.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 5-7 business days. Express shipping (2-3 business days) and overnight shipping (next business day) are also available at checkout. All orders are processed within 1-2 business days.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Currently, we ship within the United States and Canada. International shipping options are coming soon. Sign up for our newsletter to be notified when international shipping becomes available.",
  },
  {
    question: "What sizes do you offer?",
    answer:
      "We offer sizes from 2T to 12, with select items available in extended sizes. Each product page includes a detailed size guide to help you find the perfect fit. If you need assistance, our customer service team is happy to help.",
  },
  {
    question: "How do I care for my items?",
    answer:
      "Care instructions are included on each product page and on the garment label. Most items are machine washable on gentle cycle with cold water. We recommend air drying to preserve the quality and longevity of your pieces.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Yes! Once your order ships, you'll receive a tracking number via email. You can track your order status in real-time through the shipping carrier's website or by logging into your account.",
  },
];

/**
 * Contact Page Client Component
 */
export function ContactPageClient(): JSX.Element {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [expandedFAQ, setExpandedFAQ] = React.useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (_data: ContactFormData): Promise<void> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // In production, send to API endpoint
    // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) });
    
    // Show success message
    setShowSuccess(true);
    reset();
    
    // Hide success message after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const toggleFAQ = (index: number): void => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-cream-50 pt-20 md:pt-24 pb-16">
      <Container size="lg">
        {/* Page Title */}
        <div className="text-center mb-12 md:mb-16">
          <H1 className="text-charcoal-900 mb-4">We&apos;re Here to Help</H1>
          <Body className="text-lg text-charcoal-600 max-w-2xl mx-auto">
            Questions about our collections, sizing, or care instructions? Our team is ready to assist. Reach out and we&apos;ll respond within 24 hours.
          </Body>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-8 md:p-12 shadow-sm border border-cream-200">
              <H2 className="text-charcoal-900 mb-6">Send Us a Message</H2>

              {/* Success Message */}
              <AnimatePresence>
                {showSuccess && (
                  <m.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 bg-forest-50 border border-forest-200 rounded-lg flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-forest-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <Body className="text-forest-900 font-medium">
                        Message Received
                      </Body>
                      <Body className="text-forest-700 text-sm mt-1">
                        Thank you for reaching out. We&apos;ll respond within 24 hours.
                      </Body>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-charcoal-900 mb-2"
                  >
                    Name <span className="text-charcoal-400">*</span>
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    id="name"
                    className={cn(
                      "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors",
                      errors.name
                        ? "border-red-300 bg-red-50"
                        : "border-cream-300 bg-white"
                    )}
                    placeholder="Your full name"
                    aria-invalid={errors.name ? "true" : "false"}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p
                      id="name-error"
                      className="mt-1 text-sm text-red-600"
                      role="alert"
                    >
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-charcoal-900 mb-2"
                  >
                    Email <span className="text-charcoal-400">*</span>
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    id="email"
                    className={cn(
                      "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors",
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-cream-300 bg-white"
                    )}
                    placeholder="your.email@example.com"
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      className="mt-1 text-sm text-red-600"
                      role="alert"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-charcoal-900 mb-2"
                  >
                    Subject <span className="text-charcoal-400">*</span>
                  </label>
                  <input
                    {...register("subject")}
                    type="text"
                    id="subject"
                    className={cn(
                      "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors",
                      errors.subject
                        ? "border-red-300 bg-red-50"
                        : "border-cream-300 bg-white"
                    )}
                    placeholder="What is this regarding?"
                    aria-invalid={errors.subject ? "true" : "false"}
                    aria-describedby={
                      errors.subject ? "subject-error" : undefined
                    }
                  />
                  {errors.subject && (
                    <p
                      id="subject-error"
                      className="mt-1 text-sm text-red-600"
                      role="alert"
                    >
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-charcoal-900 mb-2"
                  >
                    Message <span className="text-charcoal-400">*</span>
                  </label>
                  <textarea
                    {...register("message")}
                    id="message"
                    rows={6}
                    className={cn(
                      "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-colors resize-y",
                      errors.message
                        ? "border-red-300 bg-red-50"
                        : "border-cream-300 bg-white"
                    )}
                    placeholder="Tell us how we can help..."
                    aria-invalid={errors.message ? "true" : "false"}
                    aria-describedby={
                      errors.message ? "message-error" : undefined
                    }
                  />
                  {errors.message && (
                    <p
                      id="message-error"
                      className="mt-1 text-sm text-red-600"
                      role="alert"
                    >
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={isSubmitting}
                  loadingText="Sending Message..."
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>

          {/* Contact Information Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-cream-200">
              <H3 className="text-charcoal-900 mb-6">Contact Information</H3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-navy-900" />
                  </div>
                  <div>
                    <Body className="font-medium text-charcoal-900 mb-1">
                      Email
                    </Body>
                    <a
                      href="mailto:info@extremedeptkidz.com"
                      className="text-charcoal-600 hover:text-navy-900 transition-colors"
                    >
                      info@extremedeptkidz.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-navy-900" />
                  </div>
                  <div>
                    <Body className="font-medium text-charcoal-900 mb-1">
                      Phone
                    </Body>
                    <a
                      href="tel:+18005551234"
                      className="text-charcoal-600 hover:text-navy-900 transition-colors"
                    >
                      (800) 555-1234
                    </a>
                  </div>
                </div>

                <div className="pt-6 border-t border-cream-200">
                  <Body className="text-sm text-charcoal-600 leading-relaxed">
                    Our customer service team is available Monday through Friday,
                    9 AM to 5 PM EST. We typically respond to inquiries within
                    24 hours.
                  </Body>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16 md:mt-24">
          <div className="text-center mb-12">
            <H2 className="text-charcoal-900 mb-4">Frequently Asked Questions</H2>
            <Body className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              Find answers to common questions about our products, shipping, and
              policies.
            </Body>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-cream-200 overflow-hidden">
              {FAQ_ITEMS.map((faq, index) => (
                <FAQAccordion
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isExpanded={expandedFAQ === index}
                  onToggle={() => toggleFAQ(index)}
                />
              ))}
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}

/**
 * FAQ Accordion Component
 */
interface FAQAccordionProps {
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function FAQAccordion({
  question,
  answer,
  isExpanded,
  onToggle,
}: FAQAccordionProps): JSX.Element {
  return (
    <div className="border-b border-cream-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-6 text-left group hover:bg-cream-50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`faq-answer-${question}`}
      >
        <H3 className="text-charcoal-900 pr-4">{question}</H3>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-charcoal-600 flex-shrink-0 transition-transform duration-200",
            isExpanded && "transform rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <m.div
            id={`faq-answer-${question}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              <Body className="text-charcoal-700 leading-relaxed">{answer}</Body>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

