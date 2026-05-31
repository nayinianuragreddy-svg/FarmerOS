'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { MOCK_PINS } from '@/lib/mock-data'

const FarmerOSMap = dynamic(() => import('@/components/map/FarmerOSMap'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: '#070C0A' }} />,
})

export default function HeroSection() {
  const [line1, setLine1] = useState(false)
  const [line2, setLine2] = useState(false)
  const [line3, setLine3] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setLine1(true), 100)
    const t2 = setTimeout(() => setLine2(true), 200)
    const t3 = setTimeout(() => setLine3(true), 300)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const lineStyle = (visible: boolean) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(20px)',
    transition: 'opacity 0.7s ease, transform 0.7s ease',
  })

  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
        background: '#070C0A',
      }}
    >
      {/* RIGHT — Full height map */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '55%',
          zIndex: 0,
        }}
      >
        <FarmerOSMap
          pins={MOCK_PINS}
          isLoggedIn={false}
          searchQuery=""
          compact={true}
        />
      </div>

      {/* Gradient overlay — left edge of map fading to dark */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '35%',
          width: '220px',
          background: 'linear-gradient(to right, #070C0A 0%, transparent 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Bottom gradient — section transition */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '180px',
          background: 'linear-gradient(to top, #070C0A 0%, transparent 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Top gradient — navbar blend */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(to bottom, rgba(7,12,10,0.7) 0%, transparent 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Left solid bg so content reads clearly */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '50%',
          background: '#070C0A',
          zIndex: 0,
        }}
      />

      {/* LEFT — Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100%',
          paddingLeft: 'clamp(24px, 7vw, 96px)',
          paddingRight: '40px',
          maxWidth: '580px',
        }}
      >
        {/* Pill tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0,201,122,0.08)',
            border: '1px solid rgba(0,201,122,0.25)',
            borderRadius: '100px',
            padding: '6px 16px',
            fontSize: '12px',
            color: '#00C97A',
            fontWeight: 600,
            marginBottom: '32px',
            width: 'fit-content',
            letterSpacing: '0.01em',
            ...lineStyle(line1),
          }}
        >
          🌿 India&apos;s first geo-first crop map
        </div>

        {/* H1 — 3 lines, each animates */}
        <h1
          style={{
            fontSize: 'clamp(48px, 7vw, 96px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            color: '#FFFFFF',
            fontFamily: "'Inter', -apple-system, sans-serif",
            marginBottom: '28px',
          }}
        >
          <span style={lineStyle(line1)}>Every crop.</span>
          <span style={{ ...lineStyle(line2), marginTop: '4px' }}>Every farmer.</span>
          <span
            style={{
              ...lineStyle(line3),
              marginTop: '4px',
              background: 'linear-gradient(135deg, #00C97A 0%, #00A862 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            One map.
          </span>
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: '18px',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '40px',
            maxWidth: '420px',
            ...lineStyle(line3),
          }}
        >
          Farmers list crops in 3 minutes. Buyers find them by location. Zero middlemen.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '48px',
            flexWrap: 'wrap',
            ...lineStyle(line3),
          }}
        >
          <Link
            href="/map"
            style={{
              background: '#00C97A',
              color: '#000000',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 700,
              padding: '14px 28px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '-0.01em',
              boxShadow: '0 4px 24px rgba(0,201,122,0.35)',
            }}
          >
            Explore the Map →
          </Link>
          <Link
            href="/auth"
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 600,
              padding: '14px 28px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.18)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '-0.01em',
            }}
          >
            List as Farmer
          </Link>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0',
            flexWrap: 'wrap',
            ...lineStyle(line3),
          }}
        >
          {[
            { value: '146M Farmers' },
            { value: '₹300B Market' },
            { value: '₹0 Fees' },
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.55)',
                  padding: '6px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '100px',
                  whiteSpace: 'nowrap',
                }}
              >
                {stat.value}
              </span>
              {i < 2 && (
                <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 8px', fontSize: '12px' }}>·</span>
              )}
            </div>
          ))}

          {/* LIVE badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: '16px',
              padding: '6px 14px',
              background: 'rgba(0,201,122,0.08)',
              border: '1px solid rgba(0,201,122,0.2)',
              borderRadius: '100px',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#00C97A',
                display: 'block',
                boxShadow: '0 0 0 3px rgba(0,201,122,0.25)',
                animation: 'livePulse 2s ease-in-out infinite',
              }}
            />
            <span style={{ fontSize: '12px', color: '#00C97A', fontWeight: 600 }}>30 active listings</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(0,201,122,0.25); }
          50% { box-shadow: 0 0 0 5px rgba(0,201,122,0.1); }
        }
      `}</style>
    </section>
  )
}
