'use client'

import Link from 'next/link'

export default function CTASection() {
  return (
    <section
      style={{
        background: '#0A0F0A',
        padding: '160px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,201,122,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            color: '#FFFFFF',
            marginBottom: '8px',
          }}
        >
          If you grow it — list it.
        </h2>
        <h2
          style={{
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            color: 'rgba(255,255,255,0.55)',
            marginBottom: '56px',
          }}
        >
          If you need it — find it.
        </h2>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '48px',
          }}
        >
          <Link
            href="/auth"
            style={{
              background: '#D4841A',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '17px',
              fontWeight: 700,
              padding: '16px 36px',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(212,132,26,0.4)',
              display: 'inline-block',
            }}
          >
            List Your First Crop — Free
          </Link>
          <Link
            href="/map"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '17px',
              fontWeight: 600,
              padding: '16px 36px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'inline-block',
            }}
          >
            Explore the Map
          </Link>
        </div>

        {/* Badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.45)',
            fontWeight: 500,
          }}
        >
          <span>🌾 Free for farmers</span>
          <span>🛒 Free for buyers</span>
          <span>🚫 No middlemen</span>
          <span>💰 No commission</span>
        </div>
      </div>
    </section>
  )
}
