'use client'

import { useEffect, useState } from 'react'
import { getPriceTickerData } from '@/lib/api'

type TickerItem = {
  crop: string
  emoji: string
  price: number
  unit: string
  change: number
}

const FALLBACK = getPriceTickerData()

export default function PriceTicker() {
  const [items, setItems] = useState<TickerItem[]>(FALLBACK)

  useEffect(() => {
    fetch('/api/mandi-prices')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setItems(data)
      })
      .catch(() => {})
  }, [])

  // Duplicate for seamless loop
  const tickerItems = [...items, ...items]

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
      {/* Fixed label */}
      <div
        style={{
          flexShrink: 0,
          padding: '0 20px',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: '#00C97A',
          borderRight: '1px solid rgba(0,201,122,0.2)',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          background: '#0A1409',
          zIndex: 1,
          position: 'relative',
          whiteSpace: 'nowrap',
          gap: '6px',
        }}
      >
        LIVE MANDI PRICES 📊
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

      {/* Scrolling content */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          animation: 'tickerScroll 40s linear infinite',
          whiteSpace: 'nowrap',
          willChange: 'transform',
        }}
      >
        {tickerItems.map((item, i) => {
          const up = item.change > 0
          const down = item.change < 0
          return (
            <div
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 28px',
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
                ₹{item.price}/{item.unit}
              </span>
              {item.change !== 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: up ? '#00C97A' : '#FF5252',
                    background: up ? 'rgba(0,201,122,0.1)' : 'rgba(255,82,82,0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {up ? '▲' : '▼'}{Math.abs(item.change)}%
                </span>
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
