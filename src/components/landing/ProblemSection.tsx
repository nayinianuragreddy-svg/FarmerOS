'use client'

import { useEffect, useRef, useState } from 'react'

export default function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      style={{
        background: '#030508',
        padding: '120px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.9s ease, transform 0.9s ease',
        }}
      >
        {/* Big number */}
        <div
          style={{
            fontSize: 'clamp(80px, 12vw, 120px)',
            fontWeight: 700,
            fontFamily: 'JetBrains Mono, Courier New, monospace',
            color: '#FFFFFF',
            lineHeight: 1,
            letterSpacing: '-0.04em',
          }}
        >
          33 paise.
        </div>

        <div
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#FFFFFF',
            marginTop: '32px',
            letterSpacing: '-0.02em',
          }}
        >
          That&apos;s all a farmer gets.
        </div>

        <div
          style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.6)',
            marginTop: '16px',
            lineHeight: 1.6,
          }}
        >
          Of every rupee you spend on vegetables.
        </div>

        <div style={{ height: '32px' }} />

        <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
          The other 67 paise?
        </div>
        <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.5)', marginTop: '8px', lineHeight: 1.6 }}>
          Gone. Into a chain of middlemen, commission agents, and traders.
        </div>

        <div style={{ height: '48px' }} />

        <div
          style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.4)',
            fontStyle: 'italic',
            lineHeight: 1.65,
          }}
        >
          ₹300 billion market. 146 million farmers. Zero direct connections.
        </div>

        <div style={{ height: '64px' }} />

        <div
          style={{
            fontSize: 'clamp(36px, 5vw, 48px)',
            fontWeight: 700,
            color: '#00C97A',
            letterSpacing: '-0.03em',
          }}
        >
          Until now.
        </div>
      </div>
    </section>
  )
}
