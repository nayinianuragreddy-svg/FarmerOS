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
  'Search any crop within your chosen radius',
  'See which farms are organic-certified',
  'View the actual farm on satellite imagery',
  'Contact farmers directly — one tap',
  'Rate your experience to help others',
]

export default function ForBuyersSection() {
  const { ref, visible } = useScrollReveal(0.1)

  return (
    <section
      id="for-buyers"
      style={{
        background: '#F5F1EA',
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
        {/* LEFT — Mock buyer map view */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '100%',
              maxWidth: '340px',
              background: '#0D1A12',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            }}
          >
            {/* Search bar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: '13px',
                }}
              >
                🔍 Tomatoes near me…
              </div>
            </div>

            {/* Mock map area */}
            <div
              style={{
                height: '120px',
                background: 'linear-gradient(135deg, #0D2010 0%, #0A1A0D 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Fake map grid lines */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ position: 'absolute', left: `${i * 25}%`, top: 0, bottom: 0, width: '1px', background: '#00C97A' }} />
                ))}
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ position: 'absolute', top: `${i * 33}%`, left: 0, right: 0, height: '1px', background: '#00C97A' }} />
                ))}
              </div>
              {/* Map pins */}
              {[
                { x: '30%', y: '35%', color: '#00C97A' },
                { x: '55%', y: '60%', color: '#00C97A' },
                { x: '70%', y: '30%', color: '#D4841A' },
              ].map((pin, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: pin.x,
                    top: pin.y,
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: pin.color,
                    boxShadow: `0 0 0 3px ${pin.color}33`,
                  }}
                />
              ))}
              {/* Popup card */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(7,12,10,0.92)',
                  border: '1px solid rgba(0,201,122,0.3)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  whiteSpace: 'nowrap',
                  fontSize: '12px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  backdropFilter: 'blur(12px)',
                }}
              >
                🥬 Tomato · 500kg · ₹20/kg · 2km away · ★4.8
              </div>
            </div>

            {/* Result list */}
            {[
              { name: 'Tomato', farmer: 'Raju Patil', dist: '2.0 km', price: '₹20/kg', organic: true, rating: 4.8 },
              { name: 'Tomato', farmer: 'Kaveri Farms', dist: '5.3 km', price: '₹18/kg', organic: false, rating: 4.5 },
              { name: 'Tomato', farmer: 'Krishna Agro', dist: '8.1 km', price: '₹16/kg', organic: false, rating: 4.2 },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                    <span style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 600 }}>
                      🍅 {item.name}
                    </span>
                    {item.organic && (
                      <span
                        style={{
                          background: 'rgba(0,201,122,0.1)',
                          border: '1px solid rgba(0,201,122,0.3)',
                          borderRadius: '4px',
                          padding: '1px 5px',
                          fontSize: '9px',
                          color: '#00C97A',
                          fontWeight: 700,
                        }}
                      >
                        ORG
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                    {item.farmer} · 📍 {item.dist} · ★{item.rating}
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#00C97A' }}>
                  {item.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Content */}
        <div>
          {/* Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#D4841A',
              background: 'rgba(212,132,26,0.08)',
              border: '1px solid rgba(212,132,26,0.2)',
              borderRadius: '100px',
              padding: '5px 14px',
              marginBottom: '24px',
              width: 'fit-content',
            }}
          >
            🛒 For Buyers
          </div>

          <h2
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              color: '#0A0F0A',
              marginBottom: '36px',
              fontFamily: "'Inter', -apple-system, sans-serif",
            }}
          >
            Find what&apos;s growing
            <br />
            near you. Today.
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
                <span style={{ color: 'rgba(10,15,10,0.7)', fontSize: '16px', lineHeight: 1.55 }}>
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
              background: '#00C97A',
              color: '#000000',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 700,
              padding: '14px 28px',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(0,201,122,0.25)',
              letterSpacing: '-0.01em',
            }}
          >
            Explore the Map →
          </Link>
        </div>
      </div>
    </section>
  )
}
