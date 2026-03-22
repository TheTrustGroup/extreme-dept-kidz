import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Extreme Dept Kidz',
  description: 'How Extreme Dept Kidz collects, uses and protects your personal information.',
}

export default function PrivacyPolicyPage() {
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
        Privacy Policy
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 40 }}>
        Last updated: March 2026
      </p>

      {[
        {
          h: 'Who we are',
          p: 'Extreme Dept Kidz is a premium children\'s streetwear brand based in Accra, Ghana. We operate the website extremedeptkidz.com. When you shop with us, you trust us with your personal information — we take that responsibility seriously.',
        },
        {
          h: 'Information we collect',
          p: 'We collect information you give us directly: your name, phone number, delivery address, and email address when you place an order. We also collect basic usage data (pages visited, device type) to improve your experience. We do not collect payment card details — all card payments are handled securely by Paystack.',
        },
        {
          h: 'How we use your information',
          p: 'Your information is used to process and deliver your order, contact you about your delivery, send you order confirmations, and occasionally inform you of new arrivals or exclusive offers (only if you have subscribed). We do not sell, rent, or share your personal data with third parties for marketing purposes.',
        },
        {
          h: 'Delivery contact',
          p: 'Because we offer cash on delivery, our team may contact you via phone call or WhatsApp to confirm your delivery address and arrange a suitable delivery time. Your phone number is used solely for this purpose.',
        },
        {
          h: 'Data storage',
          p: 'Your order information is stored securely on our servers. We retain order records for up to 3 years for accounting and legal purposes. You may request deletion of your personal data at any time by contacting us.',
        },
        {
          h: 'Cookies',
          p: 'Our website uses essential cookies to keep your cart active and remember your preferences. We do not use advertising cookies or sell your browsing data to any third party.',
        },
        {
          h: 'Your rights',
          p: 'You have the right to access, correct, or delete the personal information we hold about you. To make a request, contact us via WhatsApp or email at info@extremedeptkidz.com and we will respond within 5 business days.',
        },
        {
          h: 'Contact',
          p: 'Questions about this policy? Reach us at info@extremedeptkidz.com or via WhatsApp. We are happy to explain anything in plain language.',
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
