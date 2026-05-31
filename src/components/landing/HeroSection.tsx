'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const INDIA_PINS = [
  { top: '11%', left: '41%', emoji: '❄️', label: 'Saffron', color: '#8B5CF6', delay: '0s' },
  { top: '19%', left: '33%', emoji: '🌾', label: 'Wheat', color: '#F59E0B', delay: '0.3s' },
  { top: '26%', left: '52%', emoji: '🍚', label: 'Rice', color: '#F59E0B', delay: '0.6s' },
  { top: '30%', left: '28%', emoji: '🌿', label: 'Mustard', color: '#10B981', delay: '0.9s' },
  { top: '36%', left: '22%', emoji: '☁️', label: 'Cotton', color: '#6366F1', delay: '1.2s' },
  { top: '34%', left: '62%', emoji: '🌾', label: 'Wheat', color: '#F59E0B', delay: '1.5s' },
  { top: '42%', left: '50%', emoji: '🫘', label: 'Soybean', color: '#10B981', delay: '1.8s' },
  { top: '47%', left: '36%', emoji: '🧅', label: 'Onion', color: '#EF4444', delay: '2.1s' },
  { top: '53%', left: '55%', emoji: '🍅', label: 'Tomato', color: '#EF4444', delay: '2.4s' },
  { top: '60%', left: '44%', emoji: '🟡', label: 'Turmeric', color: '#F59E0B', delay: '2.7s' },
  { top: '70%', left: '40%', emoji: '🌿', label: 'Pepper', color: '#10B981', delay: '3.0s' },
  { top: '66%', left: '57%', emoji: '🍌', label: 'Banana', color: '#F59E0B', delay: '3.3s' },
  { top: '30%', left: '74%', emoji: '🍵', label: 'Tea', color: '#10B981', delay: '3.6s' },
  { top: '22%', left: '66%', emoji: '🍚', label: 'Rice', color: '#10B981', delay: '3.9s' },
  { top: '48%', left: '26%', emoji: '🥜', label: 'Groundnut', color: '#F59E0B', delay: '4.2s' },
]

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
        display: 'flex',
      }}
    >
      <style>{`
        @keyframes pinDrop {
          from { opacity: 0; transform: translate(-50%, calc(-50% - 20px)); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes pingRing {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        @keyframes heroCountUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(0,201,122,0.25); }
          50% { box-shadow: 0 0 0 5px rgba(0,201,122,0.1); }
        }
      `}</style>

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
          flexShrink: 0,
          background: '#070C0A',
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
          <span style={{ ...lineStyle(line2), marginTop: '4px', display: 'block' }}>Every farmer.</span>
          <span
            style={{
              ...lineStyle(line3),
              marginTop: '4px',
              display: 'block',
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

      {/* RIGHT — Animated India Visualization */}
      <div
        style={{
          flex: 1,
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
          background: '#050A07',
          backgroundImage: 'radial-gradient(rgba(0,201,122,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      >
        {/* India SVG outline */}
        <svg
          viewBox="0 0 380 480"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-48%, -50%)',
            width: '75%',
            opacity: 0.6,
          }}
        >
          <path
            d="M155,28 L178,20 L218,24 L252,36 L288,58 L316,80 L328,108 L322,138 L336,160 L320,180 L296,196 L283,220 L293,244 L282,268 L263,290 L245,316 L228,348 L210,382 L194,418 L182,448 L170,418 L150,380 L128,348 L105,310 L85,278 L70,248 L66,218 L74,192 L60,164 L72,136 L88,116 L108,98 L122,80 L133,62 L143,44 Z"
            fill="rgba(0,201,122,0.04)"
            stroke="rgba(0,201,122,0.35)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Sri Lanka */}
          <ellipse cx="225" cy="460" rx="12" ry="18" fill="none" stroke="rgba(0,201,122,0.2)" strokeWidth="1" />
        </svg>

        {/* Crop pin dots */}
        {INDIA_PINS.map((pin, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: pin.top,
              left: pin.left,
              transform: 'translate(-50%, -50%)',
              animation: `pinDrop 0.6s ${pin.delay} cubic-bezier(0.34,1.56,0.64,1) both`,
              zIndex: 2,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ position: 'relative', width: 10, height: 10 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: pin.color,
                    position: 'relative',
                    zIndex: 2,
                    boxShadow: `0 0 8px ${pin.color}60`,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: -6,
                    borderRadius: '50%',
                    border: `1.5px solid ${pin.color}`,
                    animation: 'pingRing 2.5s ease-out infinite',
                    opacity: 0,
                  }}
                />
              </div>
              <span style={{ fontSize: 13, lineHeight: 1 }}>{pin.emoji}</span>
              <span
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.5)',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                {pin.label}
              </span>
            </div>
          </div>
        ))}

        {/* Floating stats card */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            right: 24,
            background: 'rgba(7,12,10,0.88)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '16px 20px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: '#00C97A',
              letterSpacing: '0.1em',
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            🟢 LIVE
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF' }}>30</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>active listings</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF' }}>12</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>crop categories</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
            Updated just now
          </div>
        </div>
      </div>
    </section>
  )
}
