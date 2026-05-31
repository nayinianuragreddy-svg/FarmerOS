'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sprout } from 'lucide-react'

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease',
        background: scrolled
          ? 'rgba(7,12,10,0.88)'
          : 'rgba(7,12,10,0.2)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid transparent',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'rgba(0,201,122,0.12)',
              border: '1px solid rgba(0,201,122,0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sprout style={{ width: '16px', height: '16px', color: '#00C97A' }} />
          </div>
          <span
            style={{
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '17px',
              letterSpacing: '-0.025em',
              fontFamily: "'Inter', -apple-system, sans-serif",
            }}
          >
            FarmerOS
          </span>
        </Link>

        {/* Center nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          {[
            { label: 'For Buyers', href: '#for-buyers' },
            { label: 'For Farmers', href: '#for-farmers' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'color 0.2s',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = '#FFFFFF')}
              onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)')}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <Link
          href="/auth"
          style={{
            background: '#00C97A',
            color: '#000000',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 700,
            padding: '9px 20px',
            borderRadius: '9px',
            letterSpacing: '-0.01em',
            transition: 'background 0.2s, transform 0.15s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.background = '#00b36b'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.background = '#00C97A'
          }}
        >
          Join Free →
        </Link>
      </div>
    </header>
  )
}
