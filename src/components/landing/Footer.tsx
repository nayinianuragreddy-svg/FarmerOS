'use client'

import Link from 'next/link'
import { Sprout } from 'lucide-react'

export default function Footer() {
  return (
    <footer
      style={{
        background: '#030508',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '64px 24px 32px',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Three columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '48px',
            marginBottom: '64px',
          }}
        >
          {/* Col 1 — Logo + tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(0,201,122,0.15)',
                  border: '1px solid rgba(0,201,122,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sprout style={{ width: '18px', height: '18px', color: '#00C97A' }} />
              </div>
              <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em' }}>
                FarmerOS
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', lineHeight: 1.65 }}>
              India&apos;s crop map.
              <br />
              Free forever.
            </p>
          </div>

          {/* Col 2 — Links */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>
              PLATFORM
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'For Farmers', href: '#for-farmers' },
                { label: 'For Buyers', href: '#for-buyers' },
                { label: 'List a Crop', href: '/auth' },
                { label: 'Explore Map', href: '/map' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    color: 'rgba(255,255,255,0.55)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3 — Built with */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>
              BUILT WITH
            </div>
            <p
              style={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: '14px',
                lineHeight: 1.65,
                marginBottom: '20px',
              }}
            >
              Built with ❤️ for 146 million farmers
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['MapLibre GL JS', 'Carto Dark Tiles', 'Supabase', 'ONDC Ready'].map((tech) => (
                <span
                  key={tech}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.35)',
                    fontFamily: 'JetBrains Mono, Courier New, monospace',
                  }}
                >
                  <span style={{ color: '#00C97A', fontSize: '10px' }}>▸</span> {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            © 2026 FarmerOS · Free for Indian farmers · MIT License
          </span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.2)' }}>
            Made in India 🇮🇳
          </span>
        </div>
      </div>
    </footer>
  )
}
