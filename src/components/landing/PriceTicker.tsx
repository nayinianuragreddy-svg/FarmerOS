'use client'

import { useEffect, useState } from 'react'
import { fetchMandiSnapshot, commodityEmoji, prettyCommodity } from '@/lib/mandi'

type TickerItem = {
  crop: string
  emoji: string
  price: number
  mandis: number
}

export default function PriceTicker() {
  const [items, setItems] = useState<TickerItem[]>([])

  useEffect(() => {
    fetchMandiSnapshot().then((s) => {
      if (s.commodities?.length) {
        // Most widely-traded commodities today, real national average price.
        setItems(
          s.commodities.slice(0, 20).map((c) => ({
            crop: prettyCommodity(c.commodity),
            emoji: commodityEmoji(c.commodity),
            price: c.avgPerKg,
            mandis: c.count,
          })),
        )
      }
    })
  }, [])

  // Duplicate for seamless loop
  const tickerItems = items.length ? [...items, ...items] : []

  return (
    <div
      style={{
        background: '#0A1409',
        borderTop: '1px solid rgba(0,201,122,0.15)',
        borderBottom: '1px solid rgba(0,201,122,0.15)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        height: '48px',
        position: 'relative',
      }}
    >
      {/* Fixed left panel */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 160,
          zIndex: 2,
          background: 'linear-gradient(90deg, #0A1409 0%, #0A1409 85%, transparent 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingLeft: 16,
          paddingRight: 24,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#00C97A',
              animation: 'tickerPulse 2s ease-in-out infinite',
            }}
          />
          <span style={{ fontSize: 11, color: '#00C97A', fontWeight: 700, letterSpacing: '0.06em' }}>LIVE</span>
        </div>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)' }} />
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.04em' }}>MANDI PRICES</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>Agmarknet</div>
        </div>
      </div>

      {/* Fade edges */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '80px',
          background: 'linear-gradient(to right, transparent, #0A1409)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {tickerItems.length === 0 ? (
        <div style={{ paddingLeft: 176, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          Loading live mandi prices from Agmarknet…
        </div>
      ) : (
        /* Scrolling content */
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            animation: 'tickerScroll 60s linear infinite',
            whiteSpace: 'nowrap',
            willChange: 'transform',
            paddingLeft: '160px',
          }}
        >
          {tickerItems.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 24px',
                borderRight: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span style={{ fontSize: '14px' }}>{item.emoji}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 500 }}>
                {item.crop}
              </span>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, Courier New, monospace',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                ₹{item.price}/kg
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(0,201,122,0.7)', fontWeight: 600 }}>
                {item.mandis} mandis
              </span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes tickerPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
