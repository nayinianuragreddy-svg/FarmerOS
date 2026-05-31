'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { MapPin, Scale, Star, Leaf, TrendingUp } from 'lucide-react'
import { MOCK_PINS } from '@/lib/mock-data'
import { CATEGORY_CONFIG } from '@/lib/constants'
import { getPriceTickerData } from '@/lib/api'

const FarmerOSMap = dynamic(() => import('@/components/map/FarmerOSMap'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', background: '#0A0F0A' }} />
  ),
})

// Sample pin to show as the floating card — Tomato in Rangareddy
const FEATURED_PIN = MOCK_PINS[0]
const MANDI_PRICES: Record<string, number> = {
  'Tomato': 17, 'Tur / Arhar (Pigeon Pea)': 78, 'Chilli (Guntur)': 175,
  'Grapes - Green': 45, 'Rose': 280, 'Coffee - Arabica': 390,
}

export default function HeroSection() {
  const config = CATEGORY_CONFIG[FEATURED_PIN.crop_category]
  const mandiPrice = MANDI_PRICES[FEATURED_PIN.crop_name] ?? 15
  const priceVsMandi = FEATURED_PIN.expected_price
    ? Math.round(((FEATURED_PIN.expected_price - mandiPrice) / mandiPrice) * 100)
    : 18
  const tickerData = getPriceTickerData().slice(0, 3)

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#0A0F0A',
        paddingTop: '72px',
      }}
    >
      {/* ── MAP — Full right side, bleeds left ────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '65%',
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

      {/* ── SEAMLESS GRADIENT — erases the hard line ──────────────────── */}
      {/* Left-to-right: solid dark → partial dark → transparent */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(
              to right,
              #0A0F0A 0%,
              #0A0F0A 32%,
              rgba(10,15,10,0.92) 44%,
              rgba(10,15,10,0.65) 54%,
              rgba(10,15,10,0.15) 68%,
              transparent 80%
            )
          `,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      {/* Top gradient — content navbar transition */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: '160px',
          background: 'linear-gradient(to bottom, rgba(10,15,10,0.8) 0%, transparent 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      {/* Bottom gradient — section transition */}
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0, height: '200px',
          background: 'linear-gradient(to top, #0A0F0A 0%, transparent 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* ── LEFT CONTENT — floats over gradient ───────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 72px)',
          padding: '80px 0 80px 7vw',
          maxWidth: '560px',
        }}
      >
        {/* Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            background: 'rgba(0,201,122,0.1)',
            border: '1px solid rgba(0,201,122,0.28)',
            borderRadius: '100px',
            padding: '6px 16px',
            fontSize: '13px',
            color: '#00C97A',
            fontWeight: 600,
            marginBottom: '28px',
            width: 'fit-content',
            letterSpacing: '0.01em',
          }}
        >
          🌾 India&apos;s First Geo-First Crop Platform
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(48px, 5.5vw, 84px)',
            fontWeight: 800,
            letterSpacing: '-0.045em',
            lineHeight: 1.0,
            color: '#FFFFFF',
            marginBottom: '24px',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          Every crop.
          <br />
          Every farmer.
          <br />
          <span
            style={{
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
            lineHeight: 1.7,
            color: 'rgba(200,200,180,0.7)',
            marginBottom: '36px',
            maxWidth: '400px',
          }}
        >
          Farmers list crops in 3 minutes. Buyers discover by location.
          No middlemen. No fees.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '48px', flexWrap: 'wrap' }}>
          <Link
            href="/map"
            style={{
              background: 'linear-gradient(135deg, #D4841A 0%, #B86E10 100%)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 700,
              padding: '14px 28px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(212,132,26,0.4), 0 1px 0 rgba(255,255,255,0.15) inset',
              letterSpacing: '-0.01em',
            }}
          >
            Explore the Map →
          </Link>
          <Link
            href="/auth"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 600,
              padding: '14px 28px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.14)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '-0.01em',
            }}
          >
            List as a Farmer
          </Link>
        </div>

        {/* Micro-stats */}
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          {[
            { value: '146M', label: 'Farmers in India' },
            { value: '₹300B', label: 'Market size' },
            { value: '₹0', label: 'Platform fee' },
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
              <span style={{ fontSize: '12px', color: 'rgba(180,180,160,0.55)', fontWeight: 500 }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FLOATING CROP CARD — shows live API data ──────────────────── */}
      {/* Positioned at the gradient-map transition zone */}
      <div
        style={{
          position: 'absolute',
          bottom: '14%',
          left: '36%',
          zIndex: 3,
          width: '280px',
          animation: 'floatCard 4s ease-in-out infinite',
        }}
      >
        <style>{`
          @keyframes floatCard {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
        <div className="crop-float-card" style={{ padding: '16px', overflow: 'hidden' }}>
          {/* Live badge */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(0,201,122,0.12)',
              border: '1px solid rgba(0,201,122,0.25)',
              borderRadius: '100px',
              padding: '3px 8px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00C97A', boxShadow: '0 0 6px #00C97A', display: 'block' }} />
            <span style={{ fontSize: '11px', color: '#00C97A', fontWeight: 600 }}>LIVE</span>
          </div>

          {/* Category chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'white',
                padding: '3px 8px',
                borderRadius: '100px',
                background: `${config.mapColor}cc`,
              }}
            >
              {config.emoji} {config.label}
            </span>
            {FEATURED_PIN.is_organic && (
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#00C97A', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Leaf style={{ width: '10px', height: '10px' }} /> Organic
              </span>
            )}
          </div>

          {/* Crop name */}
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '16px', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            {FEATURED_PIN.crop_name}
          </h3>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '12px' }}>
            <MapPin style={{ width: '11px', height: '11px' }} />
            {FEATURED_PIN.district}, {FEATURED_PIN.state}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Scale style={{ width: '12px', height: '12px', color: '#00C97A' }} />
              <span style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{FEATURED_PIN.quantity} {FEATURED_PIN.unit}</span>
            </div>
            {FEATURED_PIN.expected_price && (
              <span style={{ color: '#00C97A', fontWeight: 700, fontSize: '13px' }}>
                ₹{FEATURED_PIN.expected_price}/{FEATURED_PIN.unit}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}>
              <Star style={{ width: '11px', height: '11px', fill: '#F59E0B', color: '#F59E0B' }} />
              <span style={{ color: '#F59E0B', fontSize: '12px', fontWeight: 600 }}>
                {FEATURED_PIN.rating_avg.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '10px' }} />

          {/* ★ THE API DATA — Mandi price comparison */}
          <div
            style={{
              background: 'rgba(0,201,122,0.07)',
              border: '1px solid rgba(0,201,122,0.15)',
              borderRadius: '10px',
              padding: '8px 10px',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
              <TrendingUp style={{ width: '11px', height: '11px', color: '#00C97A' }} />
              <span style={{ fontSize: '10px', color: 'rgba(0,201,122,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Agmarknet Live Price
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                Today&apos;s mandi: ₹{mandiPrice}/kg
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: priceVsMandi > 0 ? '#00C97A' : '#ef4444',
                  background: priceVsMandi > 0 ? 'rgba(0,201,122,0.12)' : 'rgba(239,68,68,0.12)',
                  padding: '2px 7px',
                  borderRadius: '100px',
                }}
              >
                {priceVsMandi > 0 ? '+' : ''}{priceVsMandi}% above mandi
              </span>
            </div>
          </div>

          {/* Login gate */}
          <Link
            href="/auth"
            style={{
              display: 'block',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '9px',
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            🔒 Login to see farmer contact
          </Link>
        </div>
      </div>

      {/* ── LIVE PRICES STRIP — floats at bottom of hero ─────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          right: '5%',
          zIndex: 3,
          display: 'flex',
          gap: '8px',
        }}
      >
        {tickerData.map((item, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(14,20,30,0.92)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '100px',
              padding: '6px 12px',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '14px' }}>{item.emoji}</span>
            <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>
              {item.crop}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: item.change > 0 ? '#00C97A' : '#ef4444',
              }}
            >
              ₹{item.price} {item.change > 0 ? '↑' : '↓'}
            </span>
          </div>
        ))}
        <div
          style={{
            background: 'rgba(0,201,122,0.1)',
            border: '1px solid rgba(0,201,122,0.2)',
            borderRadius: '100px',
            padding: '6px 12px',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00C97A', display: 'block', boxShadow: '0 0 6px #00C97A' }} />
          <span style={{ fontSize: '11px', color: '#00C97A', fontWeight: 600 }}>Agmarknet · Live</span>
        </div>
      </div>
    </section>
  )
}
