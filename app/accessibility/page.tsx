import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility | Extreme Dept Kidz',
  description: 'Our commitment to an accessible shopping experience for everyone.',
}

export default function AccessibilityPage() {
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
        Accessibility
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
        Accessible for Everyone
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 40 }}>
        Last updated: March 2026
      </p>

      {[
        {
          h: 'Our commitment',
          p: 'Extreme Dept Kidz is committed to making our website usable by everyone, regardless of ability or technology. We believe every parent and child deserves a smooth, dignified shopping experience.',
        },
        {
          h: 'What we have done',
          p: 'Our website is built with semantic HTML, keyboard navigation support, and sufficient colour contrast throughout. All product images include descriptive alt text. Interactive elements have accessible labels. The site works with common screen readers on both mobile and desktop.',
        },
        {
          h: 'Ongoing work',
          p: 'Accessibility is not a one-time fix — it is ongoing. We regularly audit our site and address issues as they are found. If you encounter a barrier that prevents you from shopping with us, please tell us so we can fix it.',
        },
        {
          h: 'Alternative shopping',
          p: 'If you are unable to use the website, we are happy to take your order directly via WhatsApp. Simply message us with the items you want, your size, and your delivery address. We will process your order manually.',
        },
        {
          h: 'Feedback',
          p: 'If you experience any difficulty using our website, please contact us at info@extremedeptkidz.com or via WhatsApp. Describe the issue and the device or browser you are using, and we will respond within 2 business days.',
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
