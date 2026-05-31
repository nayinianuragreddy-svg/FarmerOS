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

export default function CTASection() {
  const { ref, visible } = useScrollReveal(0.15)

  return (
    <section
      style={{
        background: 'linear-gradient(180deg, #070C0A 0%, #0D2418 100%)',
        padding: '120px 24px',
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
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,201,122,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        ref={ref}
        style={{
          position: 'relative',
          maxWidth: '800px',
          margin: '0 auto',
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(32px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* Headline */}
        <div
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            color: '#FFFFFF',
            marginBottom: '4px',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          If you grow it —
        </div>
        <div
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: '48px',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>list </span>
          <span style={{ color: '#00C97A' }}>it.</span>
        </div>

        <div
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            color: '#FFFFFF',
            marginBottom: '4px',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          If you need it —
        </div>
        <div
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: '64px',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>find </span>
          <span style={{ color: '#00C97A' }}>it.</span>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '40px',
          }}
        >
          <Link
            href="/auth"
            style={{
              background: '#00C97A',
              color: '#000000',
              textDecoration: 'none',
              fontSize: '17px',
              fontWeight: 700,
              padding: '16px 36px',
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(0,201,122,0.4)',
              display: 'inline-block',
              letterSpacing: '-0.01em',
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
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'inline-block',
              letterSpacing: '-0.01em',
            }}
          >
            Explore the Map
          </Link>
        </div>

        {/* Small print */}
        <p
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.4)',
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}
        >
          🌾 Free for farmers · 🛒 Free for buyers · No commission · No catch
        </p>
      </div>
    </section>
  )
}
