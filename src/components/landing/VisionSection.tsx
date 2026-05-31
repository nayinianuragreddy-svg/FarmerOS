'use client'

const ROADMAP = [
  { version: 'V1', arrow: '→', text: 'Geo-first crop discovery', live: true },
  { version: 'V2', arrow: '→', text: 'Pre-harvest buyer commitments', live: false },
  { version: 'V3', arrow: '→', text: 'Seed-to-sale journey tracking', live: false },
  { version: 'V4', arrow: '→', text: 'FPO collective listings', live: false },
  { version: 'V5', arrow: '→', text: 'Direct export linkage', live: false },
]

export default function VisionSection() {
  return (
    <section
      id="about"
      style={{
        background: '#F5F1EA',
        padding: '120px 24px',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#0A0F0A',
            lineHeight: 1.2,
            marginBottom: '24px',
          }}
        >
          We&apos;re not building a marketplace.
        </h2>
        <p
          style={{
            fontSize: '24px',
            color: 'rgba(10,15,10,0.7)',
            lineHeight: 1.55,
            marginBottom: '64px',
          }}
        >
          We&apos;re building the digital infrastructure for Indian agriculture.
        </p>

        {/* Divider */}
        <hr
          style={{
            border: 'none',
            borderTop: '1px solid rgba(10,15,10,0.12)',
            marginBottom: '64px',
          }}
        />

        {/* Roadmap */}
        <div style={{ textAlign: 'left', maxWidth: '480px', margin: '0 auto' }}>
          {ROADMAP.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px',
                opacity: item.live ? 1 : 0.4,
              }}
            >
              {/* Live indicator */}
              {item.live ? (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#00C97A',
                    flexShrink: 0,
                    boxShadow: '0 0 0 3px rgba(0,201,122,0.2)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'rgba(10,15,10,0.2)',
                    flexShrink: 0,
                  }}
                />
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: 'JetBrains Mono, Courier New, monospace',
                  fontSize: '15px',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: item.live ? '#00C97A' : '#0A0F0A',
                    minWidth: '24px',
                  }}
                >
                  {item.version}
                </span>
                <span style={{ color: 'rgba(10,15,10,0.4)' }}>{item.arrow}</span>
                <span style={{ color: '#0A0F0A', fontFamily: 'inherit' }}>{item.text}</span>
                {item.live && (
                  <span
                    style={{
                      background: 'rgba(0,201,122,0.1)',
                      border: '1px solid rgba(0,201,122,0.3)',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#00C97A',
                      letterSpacing: '0.08em',
                    }}
                  >
                    LIVE
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
