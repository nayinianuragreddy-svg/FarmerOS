'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { MOCK_PINS } from '@/lib/mock-data'

const FarmerOSMap = dynamic(() => import('@/components/map/FarmerOSMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#060914',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          className="animate-spin"
          style={{
            width: '40px',
            height: '40px',
            border: '2px solid rgba(0,201,122,0.2)',
            borderTopColor: '#00C97A',
            borderRadius: '50%',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Loading India&apos;s Crop Map…</p>
      </div>
    </div>
  ),
})

export default function HeroSection() {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#0A0F0A',
        paddingTop: '64px', // account for fixed navbar
      }}
    >
      {/* LEFT — Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 64px',
          position: 'relative',
        }}
      >
        {/* Green tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0,201,122,0.08)',
            border: '1px solid rgba(0,201,122,0.25)',
            borderRadius: '100px',
            padding: '6px 14px',
            fontSize: '13px',
            color: '#00C97A',
            fontWeight: 600,
            marginBottom: '32px',
            width: 'fit-content',
          }}
        >
          🌾 India&apos;s First Geo-First Crop Platform
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(52px, 5vw, 80px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            color: '#FFFFFF',
            marginBottom: '24px',
          }}
        >
          Every crop.
          <br />
          Every farmer.
          <br />
          <span style={{ color: '#00C97A' }}>One map.</span>
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: '18px',
            lineHeight: 1.65,
            color: '#9E9E7A',
            marginBottom: '40px',
            maxWidth: '420px',
          }}
        >
          Farmers list in 3 minutes. Buyers discover by location. Zero middlemen.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '48px', flexWrap: 'wrap' }}>
          <Link
            href="/map"
            style={{
              background: '#D4841A',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 700,
              padding: '14px 28px',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 24px rgba(212,132,26,0.35)',
              transition: 'all 0.2s',
            }}
          >
            Explore the Map →
          </Link>
          <Link
            href="/auth"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 600,
              padding: '14px 28px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            List as a Farmer
          </Link>
        </div>

        {/* Micro-stats */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          {[
            { value: '146M', label: 'Farmers' },
            { value: '₹300B', label: 'Market' },
            { value: '0', label: 'Fees' },
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  fontFamily: 'JetBrains Mono, Courier New, monospace',
                  letterSpacing: '-0.02em',
                }}
              >
                {stat.value}
              </span>
              <span style={{ fontSize: '13px', color: '#9E9E7A', fontWeight: 500 }}>
                {stat.label}
              </span>
              {i < 2 && (
                <span style={{ color: 'rgba(255,255,255,0.15)', marginLeft: '8px' }}>·</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Live Map */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          minHeight: 'calc(100vh - 64px)',
          overflow: 'hidden',
        }}
      >
        <FarmerOSMap
          pins={MOCK_PINS}
          isLoggedIn={false}
          searchQuery=""
          compact={true}
        />
      </div>
    </section>
  )
}
