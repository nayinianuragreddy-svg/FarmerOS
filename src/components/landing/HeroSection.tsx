'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function HeroSection() {
  const [line1, setLine1] = useState(false)
  const [line2, setLine2] = useState(false)
  const [line3, setLine3] = useState(false)
  const [cardVisible, setCardVisible] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setLine1(true), 100)
    const t2 = setTimeout(() => setLine2(true), 250)
    const t3 = setTimeout(() => setLine3(true), 400)
    const t4 = setTimeout(() => setCardVisible(true), 650)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  const fade = (v: boolean, delay = '0s') => ({
    opacity: v ? 1 : 0,
    transform: v ? 'none' : 'translateY(14px)',
    transition: `opacity 0.6s ${delay} ease, transform 0.6s ${delay} ease`,
  })

  return (
    <section style={{ position: 'relative', height: '100vh', overflow: 'hidden', background: '#070C0A', display: 'flex' }}>
      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes cardFloat { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-7px)} }
        @keyframes badgePop { from{opacity:0;transform:scale(0.8) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>

      {/* LEFT — Content */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        height: '100%',
        paddingLeft: 'clamp(24px, 6vw, 80px)',
        paddingRight: '32px',
        width: '48%', flexShrink: 0,
        background: '#070C0A',
      }}>
        {/* Tag pill */}
        <div style={{ ...fade(line1), display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(0,201,122,0.08)', border: '1px solid rgba(0,201,122,0.22)', borderRadius: 100, padding: '5px 14px', fontSize: 11, color: '#00C97A', fontWeight: 600, marginBottom: 24, width: 'fit-content', letterSpacing: '0.02em' }}>
          🌿 India&apos;s first geo-first crop map
        </div>

        {/* H1 — pulled back from 96px → 58px max */}
        <h1 style={{ fontSize: 'clamp(32px, 4.2vw, 58px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#FFFFFF', fontFamily: "'Inter', -apple-system, sans-serif", marginBottom: 18 }}>
          <span style={{ display: 'block', ...fade(line1) }}>Every crop.</span>
          <span style={{ display: 'block', ...fade(line2) }}>Every farmer.</span>
          <span style={{ display: 'block', ...fade(line3), background: 'linear-gradient(135deg, #00C97A 0%, #00A862 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            One map.
          </span>
        </h1>

        <p style={{ ...fade(line3), fontSize: 15, lineHeight: 1.65, color: 'rgba(255,255,255,0.42)', marginBottom: 32, maxWidth: 360 }}>
          Farmers list crops in 3 minutes. Buyers find them by location. Zero middlemen.
        </p>

        {/* CTAs */}
        <div style={{ ...fade(line3), display: 'flex', gap: 10, marginBottom: 36, flexWrap: 'wrap' }}>
          <Link href="/map" style={{ background: '#00C97A', color: '#000', textDecoration: 'none', fontSize: 14, fontWeight: 700, padding: '12px 22px', borderRadius: 11, display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: '-0.01em', boxShadow: '0 4px 18px rgba(0,201,122,0.28)' }}>
            Explore the Map →
          </Link>
          <Link href="/auth" style={{ background: 'transparent', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '12px 22px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.14)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            List as Farmer
          </Link>
        </div>

        {/* Stats */}
        <div style={{ ...fade(line3), display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 }}>
          {['146M Farmers', '₹300B Market', '₹0 Fees'].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{s}</span>
              {i < 2 && <span style={{ color: 'rgba(255,255,255,0.18)', margin: '0 10px' }}>·</span>}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 14, padding: '4px 11px', background: 'rgba(0,201,122,0.08)', border: '1px solid rgba(0,201,122,0.18)', borderRadius: 100 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00C97A', display: 'block', animation: 'livePulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: '#00C97A', fontWeight: 600 }}>Live</span>
          </div>
        </div>
      </div>

      {/* RIGHT — Product UI mockup (Stripe-style — show the real thing) */}
      <div style={{
        flex: 1, height: '100vh', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(150deg, #060A07 0%, #050809 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '38%', left: '42%', transform: 'translate(-50%,-50%)', width: 360, height: 280, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,201,122,0.1) 0%, transparent 65%)', filter: 'blur(48px)', pointerEvents: 'none' }} />

        {/* Card stack */}
        <div style={{
          position: 'relative', width: 300,
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? 'none' : 'translateY(20px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>

          {/* BACK CARD — mini map preview */}
          <div style={{
            position: 'absolute', top: -40, right: -28,
            width: 188,
            background: 'rgba(8,15,10,0.92)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '11px 13px',
            backdropFilter: 'blur(16px)',
            zIndex: 1,
            boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 7 }}>🗺️ LIVE MAP</div>
            <div style={{ position: 'relative', height: 58, background: 'rgba(0,0,0,0.35)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,201,122,0.05) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
              {[
                { top: '22%', left: '32%', color: '#EF4444' },
                { top: '55%', left: '58%', color: '#EF4444' },
                { top: '28%', left: '68%', color: '#F59E0B' },
                { top: '68%', left: '28%', color: '#F59E0B' },
                { top: '42%', left: '47%', color: '#10B981' },
                { top: '18%', left: '55%', color: '#8B5CF6' },
              ].map((d, i) => (
                <div key={i} style={{ position: 'absolute', top: d.top, left: d.left, width: 5, height: 5, borderRadius: '50%', background: d.color, boxShadow: `0 0 5px ${d.color}90` }} />
              ))}
            </div>
            <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#00C97A', animation: 'livePulse 2s infinite' }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>30 active listings</span>
            </div>
          </div>

          {/* MAIN CARD — crop detail (the actual product) */}
          <div style={{
            position: 'relative', zIndex: 2,
            background: 'rgba(10,18,12,0.96)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 20, padding: '18px',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 36px 72px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,201,122,0.05)',
            animation: 'cardFloat 7s ease-in-out 0.8s infinite',
          }}>
            {/* Handle */}
            <div style={{ width: 28, height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 100, margin: '0 auto 14px' }} />

            {/* Crop header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>🍅 Tomato</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>📍 Rangareddy, Telangana · 12km</div>
              </div>
              <div style={{ background: 'rgba(0,201,122,0.1)', border: '1px solid rgba(0,201,122,0.22)', borderRadius: 100, padding: '2px 9px', fontSize: 10, color: '#00C97A', fontWeight: 600 }}>🌿 Organic</div>
            </div>

            {/* Farmer row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '7px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 9 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #00C97A, #005533)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>R</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Rajesh K.</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)' }}>⭐ 4.8 · 500 kg available</div>
              </div>
            </div>

            {/* Price section */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>Farmer&apos;s price</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>₹20/kg</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 9px', background: 'rgba(0,201,122,0.08)', borderRadius: 7 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Agmarknet · today</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#00C97A' }}>₹17/kg · ▲18%</span>
              </div>
            </div>

            {/* Sparkline */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', marginBottom: 4, letterSpacing: '0.05em' }}>7-DAY PRICE TREND</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>₹14</span>
                <svg viewBox="0 0 100 24" style={{ flex: 1, height: 24 }} preserveAspectRatio="none">
                  <polygon points="0,24 0,20 17,18 33,15 50,13 67,9 83,6 100,3 100,24" fill="rgba(0,201,122,0.12)" />
                  <polyline points="0,20 17,18 33,15 50,13 67,9 83,6 100,3" fill="none" stroke="#00C97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 9, color: '#00C97A', fontFamily: 'monospace' }}>₹20</span>
              </div>
            </div>

            {/* CTA */}
            <div style={{ background: '#00C97A', borderRadius: 11, padding: '11px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#000', letterSpacing: '-0.01em', boxShadow: '0 4px 14px rgba(0,201,122,0.28)' }}>
              📞 Contact Farmer
            </div>
          </div>

          {/* BADGE — Agmarknet live */}
          <div style={{
            position: 'absolute', bottom: -24, left: -20,
            background: 'rgba(8,15,10,0.94)',
            border: '1px solid rgba(0,201,122,0.18)',
            borderRadius: 11, padding: '7px 12px',
            backdropFilter: 'blur(16px)',
            zIndex: 3,
            display: 'flex', alignItems: 'center', gap: 7,
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            animation: 'badgePop 0.5s 1.1s ease both',
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00C97A', animation: 'livePulse 2s infinite' }} />
            <div>
              <div style={{ fontSize: 9, color: '#00C97A', fontWeight: 700, letterSpacing: '0.05em' }}>AGMARKNET · LIVE</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>Tomato ₹17/kg · Hyderabad</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
