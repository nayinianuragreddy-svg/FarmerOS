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

const ROADMAP = [
  { version: 'V1', text: 'Geo-first crop discovery', live: true, tag: 'Live now' },
  { version: 'V2', text: 'Pre-harvest buyer commitments', live: false, tag: 'Coming next' },
  { version: 'V3', text: 'Seed-to-sale journey tracking', live: false, tag: '' },
  { version: 'V4', text: 'FPO collective listings', live: false, tag: '' },
  { version: 'V5', text: 'Direct export linkage', live: false, tag: '' },
]

export default function VisionSection() {
  const { ref, visible } = useScrollReveal(0.1)

  return (
    <section
      id="about"
      style={{
        background: '#F5F1EA',
        padding: '72px 24px',
      }}
    >
      <div
        ref={ref}
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(32px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* Pull quote */}
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: '#0A0F0A',
            marginBottom: '20px',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          We&apos;re not building a marketplace.
        </h2>

        <p
          style={{
            fontSize: '22px',
            color: 'rgba(10,15,10,0.6)',
            lineHeight: 1.55,
            marginBottom: '60px',
            fontWeight: 400,
          }}
        >
          We&apos;re building digital infrastructure for Indian agriculture.
        </p>

        {/* Roadmap — left aligned */}
        <div style={{ textAlign: 'left', maxWidth: '480px', margin: '0 auto 56px' }}>
          {ROADMAP.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginBottom: '20px',
                opacity: item.live ? 1 : 0.4,
              }}
            >
              {/* Dot */}
              {item.live ? (
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#00C97A',
                    flexShrink: 0,
                    boxShadow: '0 0 0 3px rgba(0,201,122,0.2)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: '2px solid rgba(10,15,10,0.25)',
                    flexShrink: 0,
                  }}
                />
              )}

              {/* Version + text */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, Courier New, monospace',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: item.live ? '#00C97A' : '#0A0F0A',
                    minWidth: '22px',
                  }}
                >
                  {item.version}
                </span>
                <span
                  style={{
                    fontSize: '15px',
                    color: '#0A0F0A',
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  {item.text}
                </span>
                {item.tag && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: item.live ? '#00C97A' : 'rgba(10,15,10,0.5)',
                      background: item.live ? 'rgba(0,201,122,0.1)' : 'rgba(10,15,10,0.06)',
                      border: `1px solid ${item.live ? 'rgba(0,201,122,0.3)' : 'rgba(10,15,10,0.12)'}`,
                      borderRadius: '100px',
                      padding: '3px 9px',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.tag}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p
          style={{
            fontSize: '14px',
            color: 'rgba(10,15,10,0.4)',
            lineHeight: 1.65,
            maxWidth: '480px',
            margin: '0 auto',
            fontStyle: 'italic',
          }}
        >
          The data farmers generate today becomes their most powerful asset tomorrow.
        </p>
      </div>
    </section>
  )
}
