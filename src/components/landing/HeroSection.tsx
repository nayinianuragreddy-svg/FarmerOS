'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import HeroMap from './HeroMap'
import { fetchMandiSnapshot } from '@/lib/mandi'

export default function HeroSection() {
  const [line1, setLine1] = useState(false)
  const [line2, setLine2] = useState(false)
  const [line3, setLine3] = useState(false)
  const [cardVisible, setCardVisible] = useState(false)
  // Live national Tomato mandi average (₹/kg) for the showcase card
  const [mandiAvg, setMandiAvg] = useState<number | null>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setLine1(true), 100)
    const t2 = setTimeout(() => setLine2(true), 250)
    const t3 = setTimeout(() => setLine3(true), 400)
    const t4 = setTimeout(() => setCardVisible(true), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  useEffect(() => {
    fetchMandiSnapshot().then((s) => {
      const tomato = s.commodities?.find((c) => c.commodity.toLowerCase() === 'tomato')
      if (tomato) setMandiAvg(tomato.avgPerKg)
    })
  }, [])

  // Farm-direct price shown ~10% below today's mandi average (buyer saves, farmer skips markup)
  const farmPrice = mandiAvg ? Math.max(1, Math.round(mandiAvg * 0.9)) : null
  const savePct = mandiAvg && farmPrice ? Math.round(((mandiAvg - farmPrice) / mandiAvg) * 100) : 0

  const fade = (v: boolean, delay = '0s') => ({
    opacity: v ? 1 : 0,
    transform: v ? 'none' : 'translateY(14px)',
    transition: `opacity 0.6s ${delay} ease, transform 0.6s ${delay} ease`,
  })

  return (
    <section style={{ position: 'relative', height: '100vh', minHeight: 620, overflow: 'hidden', background: '#070C0A' }}>
      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes cardFloat { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-7px)} }
        @keyframes badgePop { from{opacity:0;transform:scale(0.8) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>

      {/* FULL-BLEED LIVE MAP */}
      <HeroMap />

      {/* LEFT — Content (floats over the map, blended seam) */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        height: '100%',
        paddingLeft: 'clamp(24px, 6vw, 80px)',
        paddingRight: '32px',
        width: 'min(560px, 50%)',
        pointerEvents: 'none',
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          {/* Tag pill */}
          <div style={{ ...fade(line1), display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(0,201,122,0.08)', border: '1px solid rgba(0,201,122,0.22)', borderRadius: 100, padding: '5px 14px', fontSize: 11, color: '#00C97A', fontWeight: 600, marginBottom: 24, width: 'fit-content', letterSpacing: '0.02em', backdropFilter: 'blur(8px)' }}>
            🌿 India&apos;s first geo-first crop map
          </div>

          {/* H1 */}
          <h1 style={{ fontSize: 'clamp(32px, 4.2vw, 58px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#FFFFFF', fontFamily: "'Inter', -apple-system, sans-serif", marginBottom: 18 }}>
            <span style={{ display: 'block', ...fade(line1) }}>Every crop.</span>
            <span style={{ display: 'block', ...fade(line2) }}>Every farmer.</span>
            <span style={{ display: 'block', ...fade(line3), background: 'linear-gradient(135deg, #00C97A 0%, #00A862 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              One map.
            </span>
          </h1>

          <p style={{ ...fade(line3), fontSize: 15, lineHeight: 1.65, color: 'rgba(255,255,255,0.5)', marginBottom: 32, maxWidth: 380 }}>
            Farmers list crops in 3 minutes. Buyers find them by location. Zero middlemen.
          </p>

          {/* CTAs */}
          <div style={{ ...fade(line3), display: 'flex', gap: 10, marginBottom: 36, flexWrap: 'wrap' }}>
            <Link href="/map" style={{ background: '#00C97A', color: '#000', textDecoration: 'none', fontSize: 14, fontWeight: 700, padding: '12px 22px', borderRadius: 11, display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: '-0.01em', boxShadow: '0 4px 18px rgba(0,201,122,0.28)' }}>
              Explore the Map →
            </Link>
            <Link href="/auth" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '12px 22px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.14)', display: 'inline-flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(8px)' }}>
              List as Farmer
            </Link>
          </div>

          {/* Stats */}
          <div style={{ ...fade(line3), display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 }}>
            {['146M Farmers', '₹300B Market', '₹0 Fees'].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{s}</span>
                {i < 2 && <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 10px' }}>·</span>}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 14, padding: '4px 11px', background: 'rgba(0,201,122,0.08)', border: '1px solid rgba(0,201,122,0.18)', borderRadius: 100, backdropFilter: 'blur(8px)' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00C97A', display: 'block', animation: 'livePulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 11, color: '#00C97A', fontWeight: 600 }}>Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING CROP CARD — real product UI over the live map */}
      <div style={{
        position: 'absolute', right: 'clamp(20px, 4vw, 56px)', bottom: 'clamp(40px, 8vh, 90px)',
        zIndex: 4, width: 280,
        opacity: cardVisible ? 1 : 0,
        transform: cardVisible ? 'none' : 'translateY(24px)',
        transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(.34,1.3,.64,1)',
        pointerEvents: 'none',
      }}>
        <div style={{
          background: 'rgba(10,18,12,0.82)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 18, padding: '16px',
          backdropFilter: 'blur(28px)',
          boxShadow: '0 36px 72px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,201,122,0.06)',
          animation: cardVisible ? 'cardFloat 7s ease-in-out 0.8s infinite' : 'none',
        }}>
          {/* Crop header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>🍅 Tomato</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)', marginTop: 2 }}>📍 Rangareddy, Telangana · 12km</div>
            </div>
            <div style={{ background: 'rgba(0,201,122,0.1)', border: '1px solid rgba(0,201,122,0.22)', borderRadius: 100, padding: '2px 9px', fontSize: 10, color: '#00C97A', fontWeight: 600 }}>🌿 Organic</div>
          </div>

          {/* Farmer row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '7px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 9 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #00C97A, #005533)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000', flexShrink: 0 }}>R</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Rajesh K.</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.42)' }}>⭐ 4.8 · 500 kg available</div>
            </div>
          </div>

          {/* Price compare — Agmarknet figure is live */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)' }}>Farm-direct price</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
              {farmPrice ? `₹${farmPrice}/kg` : '—'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 9px', background: 'rgba(0,201,122,0.08)', borderRadius: 7, marginBottom: 12 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>Mandi avg today</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#00C97A' }}>
              {mandiAvg ? `₹${mandiAvg}/kg${savePct > 0 ? ` · save ${savePct}%` : ''}` : 'syncing…'}
            </span>
          </div>

          {/* CTA */}
          <div style={{ background: '#00C97A', borderRadius: 11, padding: '10px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#000', letterSpacing: '-0.01em', boxShadow: '0 4px 14px rgba(0,201,122,0.28)' }}>
            📞 Contact Farmer
          </div>
        </div>
      </div>

      {/* Live data badge — bottom left over map */}
      <div style={{
        position: 'absolute', left: 'clamp(24px, 6vw, 80px)', bottom: 28, zIndex: 4,
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(8,15,10,0.7)', border: '1px solid rgba(0,201,122,0.18)',
        borderRadius: 100, padding: '6px 13px', backdropFilter: 'blur(12px)',
        opacity: cardVisible ? 1 : 0, transition: 'opacity 0.7s 0.2s ease',
        animation: cardVisible ? 'badgePop 0.5s ease both' : 'none',
        pointerEvents: 'none',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C97A', animation: 'livePulse 2s infinite' }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>30 live listings · Agmarknet prices syncing</span>
      </div>
    </section>
  )
}
