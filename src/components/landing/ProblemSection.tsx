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

export default function ProblemSection() {
  const { ref, visible } = useScrollReveal(0.12)

  return (
    <section
      style={{
        background: '#070C0A',
        padding: '140px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        ref={ref}
        style={{
          maxWidth: '800px',
          width: '100%',
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(32px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* Hero number */}
        <div
          style={{
            fontSize: 'clamp(100px, 15vw, 160px)',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.05em',
            lineHeight: 1,
          }}
        >
          33¢
        </div>

        <div
          style={{
            fontSize: '28px',
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 600,
            marginTop: '8px',
            letterSpacing: '-0.02em',
          }}
        >
          That&apos;s all a farmer gets.
        </div>

        <div
          style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.4)',
            marginTop: '12px',
          }}
        >
          Of every rupee you pay for vegetables.
        </div>

        <div style={{ height: '32px' }} />

        <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
          The other 67¢ disappears into a chain of middlemen,
        </div>
        <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
          commission agents, and traders.
        </div>

        <div style={{ height: '40px' }} />

        {/* Thin line */}
        <div
          style={{
            width: '60px',
            height: '1px',
            background: 'rgba(255,255,255,0.15)',
            margin: '0 auto',
          }}
        />

        <div style={{ height: '40px' }} />

        <div
          style={{
            fontSize: '26px',
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          ₹300 billion market. 146 million farmers.
        </div>

        <div style={{ height: '24px' }} />

        <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.4)' }}>
          For 70 years, they had no map.
        </div>

        <div style={{ height: '32px' }} />

        <div
          style={{
            fontSize: '36px',
            color: '#00C97A',
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}
        >
          Until now.
        </div>
      </div>
    </section>
  )
}
