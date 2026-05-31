'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'

function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

const FEATURES = [
  'List a crop in 3 minutes',
  'GPS auto-tags your farm location',
  'Buyers come to you — you don\'t chase them',
  'Get WhatsApp alerts when buyers contact you',
  'Free forever — no commissions, no subscriptions',
]

export default function ForFarmersSection() {
  const { ref, visible } = useScrollReveal(0.1)

  return (
    <section
      id="for-farmers"
      style={{
        background: '#070C0A',
        padding: '72px 24px',
      }}
    >
      <div
        ref={ref}
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(32px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* LEFT — Content */}
        <div>
          {/* Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#00C97A',
              background: 'rgba(0,201,122,0.08)',
              border: '1px solid rgba(0,201,122,0.2)',
              borderRadius: '100px',
              padding: '5px 14px',
              marginBottom: '24px',
              width: 'fit-content',
            }}
          >
            🌾 For Farmers
          </div>

          <h2
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: '#FFFFFF',
              marginBottom: '36px',
              fontFamily: "'Inter', -apple-system, sans-serif",
            }}
          >
            Built for the farmer
            <br />
            in the field.
          </h2>

          {/* Checklist */}
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
                    fontSize: '15px',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  ✓
                </span>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '16px', lineHeight: 1.55 }}>
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
              background: '#00C97A',
              color: '#000000',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 700,
              padding: '14px 28px',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(0,201,122,0.35)',
              letterSpacing: '-0.01em',
            }}
          >
            List Your First Crop →
          </Link>
        </div>

        {/* RIGHT — Mock phone listing card */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '100%',
              maxWidth: '320px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              padding: '28px',
              boxShadow: '0 0 60px rgba(0,201,122,0.08)',
              position: 'relative',
            }}
          >
            {/* Header */}
            <div
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              New Listing
            </div>

            {/* Fields */}
            {[
              { label: 'Crop', value: '🍅 Tomato' },
              { label: 'Quantity', value: '500 kg' },
              { label: 'Price', value: '₹20/kg' },
            ].map((field) => (
              <div
                key={field.label}
                style={{
                  marginBottom: '14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                  {field.label}
                </span>
                <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 600 }}>
                  {field.value}
                </span>
              </div>
            ))}

            {/* Location */}
            <div
              style={{
                marginBottom: '20px',
                background: 'rgba(212,132,26,0.08)',
                border: '1px solid rgba(212,132,26,0.2)',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '14px' }}>📍</span>
              <span style={{ fontSize: '13px', color: '#D4841A', fontWeight: 600 }}>
                Rangareddy, Telangana
              </span>
            </div>

            {/* Live badge */}
            <div
              style={{
                background: 'rgba(0,201,122,0.1)',
                border: '1px solid rgba(0,201,122,0.3)',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#00C97A',
                  boxShadow: '0 0 8px #00C97A',
                  display: 'block',
                }}
              />
              <span style={{ fontSize: '14px', color: '#00C97A', fontWeight: 700 }}>
                Listing Live ✓
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
