import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Size Guide | Extreme Dept Kidz',
  description: 'Find the perfect fit for your child with our size guide.',
}

const SIZES = [
  { size: '3M', height: '58–64 cm', chest: '43 cm', waist: '43 cm', weight: '5–7 kg' },
  { size: '6M', height: '64–70 cm', chest: '45 cm', waist: '45 cm', weight: '7–8 kg' },
  { size: '9M', height: '70–76 cm', chest: '47 cm', waist: '46 cm', weight: '8–10 kg' },
  { size: '1Y', height: '76–82 cm', chest: '49 cm', waist: '47 cm', weight: '10–11 kg' },
  { size: '2Y', height: '82–90 cm', chest: '51 cm', waist: '49 cm', weight: '11–13 kg' },
  { size: '3Y', height: '90–98 cm', chest: '53 cm', waist: '51 cm', weight: '13–15 kg' },
  { size: '4Y', height: '98–104 cm', chest: '55 cm', waist: '52 cm', weight: '15–17 kg' },
  { size: '5Y', height: '104–110 cm', chest: '57 cm', waist: '53 cm', weight: '17–19 kg' },
  { size: '6Y', height: '110–116 cm', chest: '59 cm', waist: '54 cm', weight: '19–22 kg' },
  { size: '7Y', height: '116–122 cm', chest: '61 cm', waist: '55 cm', weight: '22–25 kg' },
  { size: '8Y', height: '122–128 cm', chest: '63 cm', waist: '56 cm', weight: '25–28 kg' },
  { size: '9Y', height: '128–134 cm', chest: '66 cm', waist: '57 cm', weight: '28–31 kg' },
  { size: '10Y', height: '134–140 cm', chest: '69 cm', waist: '58 cm', weight: '31–35 kg' },
  { size: '11Y', height: '140–146 cm', chest: '72 cm', waist: '60 cm', weight: '35–39 kg' },
  { size: '12Y', height: '146–152 cm', chest: '76 cm', waist: '62 cm', weight: '39–43 kg' },
]

export default function SizeGuidePage() {
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
        Sizing
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
        Size Guide
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 40 }}>
        All EDK garments are designed with generous, comfortable fits.
        We recommend measuring your child and comparing to the chart below.
        If your child is between sizes, we suggest sizing up.
      </p>

      <section style={{ marginBottom: 40 }}>
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
          How to measure
        </h2>
        {[
          ['Height', 'Stand your child against a wall, feet flat. Measure from floor to top of head.'],
          ['Chest', 'Measure around the fullest part of the chest, keeping the tape horizontal.'],
          ['Waist', 'Measure around the natural waistline, above the hip bones.'],
        ].map(([label, desc]) => (
          <div key={label} style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <span style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              minWidth: 52,
              paddingTop: 2,
            }}>
              {label}
            </span>
            <span style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {desc}
            </span>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{
          fontFamily: 'var(--font-montserrat)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
          marginBottom: 16,
          paddingBottom: 10,
          borderBottom: '1px solid var(--border-default)',
        }}>
          Size chart
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-default)' }}>
                {['Size', 'Height', 'Chest', 'Waist', 'Weight'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontFamily: 'var(--font-montserrat)',
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZES.map((row, i) => (
                <tr
                  key={row.size}
                  style={{
                    borderBottom: '1px solid var(--border-default)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--bg-surface)',
                  }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.size}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{row.height}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{row.chest}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{row.waist}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{row.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: 0 }}>
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
          Still unsure?
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)' }}>
          Message us on WhatsApp with your child&apos;s height and weight
          and we will recommend the right size personally.
          We want every piece to fit perfectly.
        </p>
      </section>
    </main>
  )
}
