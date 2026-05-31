'use client'

const MOCK_PRICES = [
  { crop: 'Tomato', emoji: '🍅', price: '₹18/kg', change: '+12%', up: true },
  { crop: 'Onion', emoji: '🧅', price: '₹12/kg', change: '-5%', up: false },
  { crop: 'Wheat', emoji: '🌾', price: '₹23/kg', change: '+2%', up: true },
  { crop: 'Chilli (Guntur)', emoji: '🌶️', price: '₹180/kg', change: '+8%', up: true },
  { crop: 'Groundnut', emoji: '🥜', price: '₹65/kg', change: '+3%', up: true },
  { crop: 'Turmeric', emoji: '🟡', price: '₹145/kg', change: '-2%', up: false },
  { crop: 'Cotton', emoji: '☁️', price: '₹7,200/qt', change: '+1%', up: true },
  { crop: 'Sugarcane', emoji: '🎋', price: '₹350/qt', change: '0%', up: true },
  { crop: 'Soybean', emoji: '🫘', price: '₹4,300/qt', change: '-3%', up: false },
  { crop: 'Rice (Basmati)', emoji: '🍚', price: '₹38/kg', change: '+6%', up: true },
]

// Duplicate for seamless loop
const TICKER_ITEMS = [...MOCK_PRICES, ...MOCK_PRICES]

export default function PriceTicker() {
  return (
    <div
      style={{
        background: '#0A0F0A',
        borderTop: '1px solid rgba(0,201,122,0.1)',
        borderBottom: '1px solid rgba(0,201,122,0.1)',
        boxShadow: '0 0 40px rgba(0,201,122,0.04)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        height: '48px',
        position: 'relative',
      }}
    >
      {/* Label */}
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
          background: '#0A0F0A',
          zIndex: 1,
          position: 'relative',
        }}
      >
        LIVE MANDI
        <br />
        PRICES
      </div>

      {/* Scrolling ticker */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          animation: 'ticker-scroll 40s linear infinite',
          whiteSpace: 'nowrap',
        }}
      >
        {TICKER_ITEMS.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 28px',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ fontSize: '14px' }}>{item.emoji}</span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 500 }}>
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
              {item.price}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: item.up ? '#00C97A' : '#FF5252',
                background: item.up ? 'rgba(0,201,122,0.1)' : 'rgba(255,82,82,0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {item.change}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
