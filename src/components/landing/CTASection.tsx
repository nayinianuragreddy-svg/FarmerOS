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

// A few decorative pins scattered behind the headline — ties to the map theme.
const PINS = [
  { top: '18%', left: '12%', c: '#10B981', d: 0 },
  { top: '30%', left: '84%', c: '#F59E0B', d: 0.3 },
  { top: '68%', left: '8%',  c: '#F43F5E', d: 0.6 },
  { top: '74%', left: '88%', c: '#8B5CF6', d: 0.2 },
  { top: '44%', left: '93%', c: '#06B6D4', d: 0.5 },
  { top: '52%', left: '4%',  c: '#EAB308', d: 0.4 },
]

const lineStyle: React.CSSProperties = {
  fontSize: 'clamp(28px, 4vw, 48px)',
  fontWeight: 800,
  letterSpacing: '-0.04em',
  lineHeight: 1.08,
  fontFamily: "'Inter', -apple-system, sans-serif",
}

export default function CTASection() {
  const { ref, visible } = useScrollReveal(0.15)

  return (
    <section
      style={{
        background: 'linear-gradient(180deg, #070C0A 0%, #0B1D14 60%, #0D2418 100%)',
        padding: '88px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dotted map texture */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,201,122,0.06) 1px, transparent 1px)', backgroundSize: '26px 26px', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, #000 30%, transparent 75%)', pointerEvents: 'none' }} />
      {/* Radial glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0,201,122,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Floating pins */}
      {PINS.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', top: p.top, left: p.left,
          width: 8, height: 8, borderRadius: '50%', background: p.c,
          boxShadow: `0 0 12px ${p.c}`,
          opacity: visible ? 0.7 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.4)',
          transition: `opacity 0.7s ${p.d}s ease, transform 0.7s ${p.d}s cubic-bezier(.34,1.56,.64,1)`,
          pointerEvents: 'none',
        }} />
      ))}

      <div
        ref={ref}
        style={{
          position: 'relative',
          maxWidth: '720px',
          margin: '0 auto',
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(28px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* Eyebrow */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(0,201,122,0.08)', border: '1px solid rgba(0,201,122,0.22)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#00C97A', fontWeight: 600, marginBottom: 22, letterSpacing: '0.02em' }}>
          🌿 Join the map
        </div>

        {/* Headline — tight two lines */}
        <h2 style={{ ...lineStyle, color: '#FFFFFF', marginBottom: 6 }}>
          If you grow it — <span style={{ color: '#00C97A' }}>list it.</span>
        </h2>
        <h2 style={{ ...lineStyle, color: '#FFFFFF', marginBottom: 18 }}>
          If you need it — <span style={{ color: '#00C97A' }}>find it.</span>
        </h2>

        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', maxWidth: 460, margin: '0 auto 34px' }}>
          One map for every farmer and every buyer in India. Free to list, free to find, no middlemen.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '26px' }}>
          <Link href="/auth" style={{ background: '#00C97A', color: '#000', textDecoration: 'none', fontSize: 15, fontWeight: 700, padding: '14px 30px', borderRadius: 13, boxShadow: '0 8px 28px rgba(0,201,122,0.35)', display: 'inline-flex', alignItems: 'center', gap: 7, letterSpacing: '-0.01em' }}>
            List Your First Crop — Free →
          </Link>
          <Link href="/map" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 600, padding: '14px 30px', borderRadius: 13, border: '1px solid rgba(255,255,255,0.15)', display: 'inline-flex', alignItems: 'center', letterSpacing: '-0.01em' }}>
            Explore the Map
          </Link>
        </div>

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500, letterSpacing: '0.01em' }}>
          🌾 Free for farmers · 🛒 Free for buyers · No commission · No catch
        </p>
      </div>
    </section>
  )
}
