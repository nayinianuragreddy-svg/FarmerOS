'use client'

import Link from 'next/link'

const FEATURES = [
  'Search by crop, district, or radius',
  'See organic-certified listings highlighted',
  'Compare farmer prices vs. today\'s mandi rate',
  'Contact farmers directly — no intermediary',
  'Rate after your transaction. Build trust.',
  'Free to use. Always.',
]

export default function ForBuyersSection() {
  return (
    <section
      id="for-buyers"
      style={{
        background: '#F5F1EA',
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
        {/* LEFT — Visual / map preview */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              background: '#0A0F0A',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.12)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
            }}
          >
            {/* Fake map/search UI */}
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '13px',
                }}
              >
                🔍 tomatoes near Pune…
              </div>
            </div>

            {/* Fake result list */}
            {[
              { name: 'Tomato', farmer: 'Raju Patil', dist: '4.2 km', price: '₹16/kg', organic: false },
              { name: 'Tomato', farmer: 'Kaveri Farms', dist: '8.1 km', price: '₹22/kg', organic: true },
              { name: 'Tomato', farmer: 'Krishna Agro', dist: '12.4 km', price: '₹14/kg', organic: false },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>
                      🍅 {item.name}
                    </span>
                    {item.organic && (
                      <span
                        style={{
                          background: 'rgba(0,201,122,0.1)',
                          border: '1px solid rgba(0,201,122,0.3)',
                          borderRadius: '4px',
                          padding: '1px 6px',
                          fontSize: '9px',
                          color: '#00C97A',
                          fontWeight: 700,
                        }}
                      >
                        ORGANIC
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {item.farmer} · 📍 {item.dist}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, Courier New, monospace',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#D4841A',
                  }}
                >
                  {item.price}
                </div>
              </div>
            ))}

            <div
              style={{
                padding: '16px 20px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.3)',
                textAlign: 'center',
              }}
            >
              Showing 3 of 24 farms near you →
            </div>
          </div>
        </div>

        {/* RIGHT — Content */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#D4841A',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            For Buyers
          </div>

          <h2
            style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              color: '#0A0F0A',
              marginBottom: '40px',
            }}
          >
            Find what&apos;s growing
            <br />
            near you. Today.
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
                <span style={{ color: 'rgba(10,15,10,0.75)', fontSize: '16px', lineHeight: 1.55 }}>
                  {f}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/map"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#0A0F0A',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 700,
              padding: '14px 28px',
              borderRadius: '10px',
            }}
          >
            Explore the Map →
          </Link>
        </div>
      </div>
    </section>
  )
}
