'use client'

import Link from 'next/link'
import { Sprout } from 'lucide-react'

export default function Footer() {
  return (
    <footer
      style={{
        background: '#040806',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 24px',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Row 1 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
            paddingBottom: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                background: 'rgba(0,201,122,0.12)',
                border: '1px solid rgba(0,201,122,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sprout style={{ width: '15px', height: '15px', color: '#00C97A' }} />
            </div>
            <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em' }}>
              FarmerOS
            </span>
          </Link>

          {/* Tagline */}
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
            India&apos;s crop discovery map
          </span>

          {/* Social icons (placeholder) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {['𝕏', 'in', '▷'].map((icon, i) => (
              <a
                key={i}
                href="#"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.4)',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'rgba(255,255,255,0.1)'
                  el.style.color = 'rgba(255,255,255,0.8)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'rgba(255,255,255,0.05)'
                  el.style.color = 'rgba(255,255,255,0.4)'
                }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'For Farmers', href: '#for-farmers' },
              { label: 'For Buyers', href: '#for-buyers' },
              { label: 'About', href: '#about' },
              { label: 'Privacy', href: '#' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.75)')}
                onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)')}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
            © 2026 FarmerOS. Free forever.
          </span>
        </div>
      </div>
    </footer>
  )
}
