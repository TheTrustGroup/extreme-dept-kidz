import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Extreme Dept Kidz',
  description: 'Terms and conditions for shopping at Extreme Dept Kidz.',
}

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(32px, 8vw, 80px) 24px 80px' }}>
      <p style={{
        fontFamily: 'var(--font-montserrat)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--color-gold)',
        marginBottom: 16,
      }}>
        Legal
      </p>
      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: 'clamp(32px, 7vw, 52px)',
        fontWeight: 400,
        color: 'var(--text-primary)',
        lineHeight: 1.1,
        marginBottom: 8,
        letterSpacing: '-0.01em',
      }}>
        Terms of Service
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 40 }}>
        Last updated: March 2026
      </p>

      {[
        {
          h: 'Agreement',
          p: 'By placing an order on extremedeptkidz.com, you agree to these terms. Please read them carefully. If you have any questions, contact us before purchasing.',
        },
        {
          h: 'Products and pricing',
          p: 'All prices are listed in Ghana Cedis (₵) and include applicable taxes. We reserve the right to change prices at any time. The price shown at the time you place your order is the price you will pay. Product images are representative — slight variations in colour may occur due to screen settings.',
        },
        {
          h: 'Orders and payment',
          p: 'Orders are confirmed once you receive a reference number. We currently offer cash on delivery as our primary payment method. Payment is collected when your order is delivered to your address. Online payment options will be available soon.',
        },
        {
          h: 'Delivery',
          p: 'We deliver across Ghana. Delivery timelines depend on your location — Greater Accra typically within 1–3 business days, other regions within 3–7 business days. Our team will contact you by phone or WhatsApp to confirm your delivery window. Delivery is free on orders over ₵500.',
        },
        {
          h: 'Returns and exchanges',
          p: 'We accept returns within 30 days of delivery, provided items are unused, unwashed, and in original packaging with tags attached. To initiate a return, contact us via WhatsApp with your order reference. Sale items are final sale and cannot be returned unless faulty.',
        },
        {
          h: 'Sizing',
          p: 'We recommend checking our size guide before ordering. If you receive an item that does not fit, we are happy to exchange it within 30 days. Contact us and we will make it right.',
        },
        {
          h: 'Cancellations',
          p: 'You may cancel your order before it has been dispatched. Once dispatched, the order cannot be cancelled but can be returned upon delivery. To cancel, contact us immediately via WhatsApp with your order reference.',
        },
        {
          h: 'Faulty items',
          p: 'If you receive a damaged or faulty item, please contact us within 48 hours of delivery with a photo of the fault. We will arrange a replacement or full refund at no cost to you.',
        },
        {
          h: 'Intellectual property',
          p: 'All content on this website — including the EDK logo, product photography, and brand assets — is owned by Extreme Dept Kidz. You may not reproduce, distribute, or use our content without written permission.',
        },
        {
          h: 'Governing law',
          p: 'These terms are governed by the laws of the Republic of Ghana. Any disputes will be resolved under Ghanaian jurisdiction.',
        },
        {
          h: 'Contact',
          p: 'For any questions about these terms, contact us at info@extremedeptkidz.com or via WhatsApp.',
        },
      ].map(({ h, p }) => (
        <section key={h} style={{ marginBottom: 36 }}>
          <h2 style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            marginBottom: 12,
            paddingBottom: 10,
            borderBottom: '1px solid var(--border-default)',
          }}>
            {h}
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)' }}>
            {p}
          </p>
        </section>
      ))}
    </main>
  )
}
