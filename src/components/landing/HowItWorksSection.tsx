'use client'

import { useEffect, useRef, useState } from 'react'

const STEPS = [
  {
    number: '01',
    icon: '🌾',
    title: 'List in 3 minutes',
    act: 'ACT 1: FARMER',
    text: 'Farmer opens FarmerOS. Uploads crop photo. GPS auto-tags the farm. Crop goes live on the map instantly.',
  },
  {
    number: '02',
    icon: '🔍',
    title: 'Buyers discover nearby',
    act: 'ACT 2: DISCOVERY',
    text: "Buyer searches 'tomatoes near me.' The map shows farms within their radius. Prices visible. Organic badges marked.",
  },
  {
    number: '03',
    icon: '📞',
    title: 'Direct connection. Full price.',
    act: 'ACT 3: CONNECTION',
    text: 'They connect directly. No broker. No commission. The farmer gets the full price. The buyer gets farm-fresh quality.',
  },
]

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      style={{
        background: '#F5F1EA',
        padding: '120px 24px',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '64px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#D4841A',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            How it works
          </div>
          <h2
            style={{
              fontSize: 'clamp(36px, 4vw, 52px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              color: '#0A0F0A',
            }}
          >
            Three steps.
            <br />
            No middlemen.
          </h2>
        </div>

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
                background: '#1A1A0F',
                border: '1px solid rgba(212,132,26,0.15)',
                borderRadius: '16px',
                padding: '40px 32px',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s ease ${i * 0.15}s`,
              }}
            >
              {/* Act label */}
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: 'rgba(212,132,26,0.6)',
                  marginBottom: '24px',
                  fontFamily: 'JetBrains Mono, Courier New, monospace',
                }}
              >
                {step.act}
              </div>

              {/* Number */}
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, Courier New, monospace',
                  color: '#D4841A',
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  marginBottom: '16px',
                }}
              >
                {step.number}
              </div>

              {/* Icon */}
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>{step.icon}</div>

              {/* Title */}
              <h3
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF',
                  marginBottom: '16px',
                  lineHeight: 1.2,
                }}
              >
                {step.title}
              </h3>

              {/* Text */}
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
