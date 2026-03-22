import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Track Your Order | Extreme Dept Kidz',
  description: 'Check the status of your Extreme Dept Kidz order.',
}

export default function TrackOrderPage() {
  const waPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '233000000000'
  const waHref = `https://wa.me/${waPhone}?text=${encodeURIComponent('Hi! I need help tracking my EDK order.')}`

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
        Your Order
      </p>
      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: 'clamp(32px, 7vw, 52px)',
        fontWeight: 400,
        color: 'var(--text-primary)',
        lineHeight: 1.1,
        marginBottom: 16,
        letterSpacing: '-0.01em',
      }}>
        Track Your Order
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 48 }}>
        We will contact you directly to confirm your delivery.
        Here is how to check your order status at any stage.
      </p>

      {[
        { n: '1', title: 'Check your order reference', body: 'When you placed your order, you received a reference number starting with EDK- (for example, EDK-1234567890). Keep this handy — you will need it when contacting us.' },
        { n: '2', title: 'We will call or WhatsApp you', body: 'After your order is placed, our team will contact you within 24 hours to confirm your delivery address and give you an estimated delivery window.' },
        { n: '3', title: 'Your order is on its way', body: 'Once dispatched, we will send you a WhatsApp message to let you know your order is out for delivery. Greater Accra deliveries typically arrive within 1–3 business days.' },
        { n: '4', title: 'Delivery and payment', body: 'Our rider will arrive at your address and collect payment in cash. If you are unavailable, we will reschedule at a time that suits you — no extra charge.' },
      ].map(({ n, title, body }) => (
        <div key={n} style={{ display: 'flex', gap: 20, marginBottom: 36 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--color-navy)',
            color: 'var(--color-cream)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-montserrat)',
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
            marginTop: 2,
          }}
          >
            {n}
          </div>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 6,
              letterSpacing: '0.02em',
            }}
            >
              {title}
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)', margin: 0 }}>
              {body}
            </p>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 16, padding: '24px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}>
        <p style={{
          fontFamily: 'var(--font-montserrat)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-tertiary)',
          marginBottom: 10,
        }}
        >
          Need help with your order?
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 20 }}>
          If you have not heard from us within 24 hours of placing your
          order, or if you have any concerns about your delivery,
          please reach out. We are here to help.
        </p>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: 48,
            padding: '0 24px',
            background: 'var(--color-navy)',
            color: 'var(--color-cream)',
            textDecoration: 'none',
            fontFamily: 'var(--font-montserrat)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          WhatsApp Us
        </a>
      </div>
    </main>
  )
}
