'use client'

import { useRef, useState, useEffect } from 'react'

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

const STEPS = [
  {
    number: '01',
    emoji: '👨‍🌾',
    title: 'List your crop',
    description:
      'Open FarmerOS. Upload a photo, select your crop, GPS auto-tags your farm. Goes live on the map in under 3 minutes.',
    footer: 'Takes 3 minutes',
  },
  {
    number: '02',
    emoji: '🔍',
    title: 'Find crops near you',
    description:
      'Search by crop type, district, or radius. The map shows every available crop within kilometres of you — with prices and organic status.',
    footer: 'Works from any phone',
  },
  {
    number: '03',
    emoji: '📞',
    title: 'Talk directly',
    description:
      'One tap to call the farmer. No broker, no commission, no intermediary. Farmer gets the full price. Every time.',
    footer: 'Zero middlemen',
  },
]

export default function HowItWorksSection() {
  const { ref, visible } = useScrollReveal(0.1)

  return (
    <section
      style={{
        background: '#F5F1EA',
        padding: '72px 24px',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <h2
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            color: '#0A0F0A',
            textAlign: 'center',
            marginBottom: '64px',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          How it works
        </h2>

        {/* Cards */}
        <div
          ref={ref}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
        >
          {STEPS.map((step, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E0D8',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(30px)',
                transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Number badge */}
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#00C97A',
                  fontFamily: 'JetBrains Mono, Courier New, monospace',
                  letterSpacing: '0.08em',
                  marginBottom: '20px',
                }}
              >
                {step.number}
              </div>

              {/* Emoji */}
              <div style={{ fontSize: '44px', marginBottom: '20px', lineHeight: 1 }}>
                {step.emoji}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#0A0F0A',
                  letterSpacing: '-0.02em',
                  marginBottom: '12px',
                  lineHeight: 1.2,
                }}
              >
                {step.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: '15px',
                  color: 'rgba(10,15,10,0.6)',
                  lineHeight: 1.65,
                  flex: 1,
                  marginBottom: '24px',
                }}
              >
                {step.description}
              </p>

              {/* Footer tag */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#00C97A',
                  background: 'rgba(0,201,122,0.08)',
                  border: '1px solid rgba(0,201,122,0.2)',
                  borderRadius: '100px',
                  padding: '5px 12px',
                  width: 'fit-content',
                }}
              >
                ✓ {step.footer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
