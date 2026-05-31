'use client'

import Link from 'next/link'

const FEATURES = [
  'List a crop in under 3 minutes',
  'GPS auto-tags your exact farm location',
  'Buyers come to you — you don\'t chase them',
  'WhatsApp + SMS alerts in your language',
  'See today\'s mandi price before you price your crop',
  'Free forever. No commission. No catch.',
]

export default function ForFarmersSection() {
  return (
    <section
      id="for-farmers"
      style={{
        background: '#0A0F0A',
        padding: '120px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
        }}
      >
        {/* LEFT — Content */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#00C97A',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            For Farmers
          </div>

          <h2
            style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              color: '#FFFFFF',
              marginBottom: '40px',
            }}
          >
            Built for the farmer
            <br />
            in the field.
          </h2>

          {/* Feature list */}
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px' }}>
            {FEATURES.map((f, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <span
                  style={{
                    color: '#00C97A',
                    fontSize: '16px',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  ✓
                </span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', lineHeight: 1.55 }}>
                  {f}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/auth"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#D4841A',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 700,
              padding: '14px 28px',
              borderRadius: '10px',
              boxShadow: '0 4px 24px rgba(212,132,26,0.35)',
            }}
          >
            List Your First Crop →
          </Link>
        </div>

        {/* RIGHT — Visual sample listing card */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '340px',
              padding: '28px',
              border: '1px solid rgba(0,201,122,0.2)',
            }}
          >
            {/* Card header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#00C97A', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.06em' }}>
                  LIVE LISTING
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  🍅 Tomato
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(0,201,122,0.1)',
                  border: '1px solid rgba(0,201,122,0.3)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  color: '#00C97A',
                  fontWeight: 600,
                }}
              >
                Organic
              </div>
            </div>

            {/* Photo placeholder */}
            <div
              style={{
                width: '100%',
                height: '140px',
                background: 'rgba(0,201,122,0.05)',
                border: '1px dashed rgba(0,201,122,0.2)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                fontSize: '40px',
              }}
            >
              🍅
            </div>

            {/* Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Price', value: '₹18/kg' },
                { label: 'Quantity', value: '500 kg' },
                { label: 'Location', value: 'Rangareddy, TG' },
                { label: 'Listed', value: '2 hours ago' },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '2px', letterSpacing: '0.06em' }}>
                    {item.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 600 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* GPS tag */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(212,132,26,0.08)',
                border: '1px solid rgba(212,132,26,0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                color: '#D4841A',
              }}
            >
              📍 GPS verified · 17.3850° N, 78.4867° E
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
