'use client'

import { useEffect, useState, useRef, type TouchEvent as ReactTouchEvent, type MouseEvent as ReactMouseEvent } from 'react'
import { MapPin as MapPinIcon, Scale, Star, Phone, Lock, Leaf, X } from 'lucide-react'
import { MapPin } from '@/lib/types'
import { CATEGORY_CONFIG } from '@/lib/constants'
import { getMandiPriceSync } from '@/lib/api'
import Link from 'next/link'

interface BottomSheetProps {
  pin: MapPin | null
  isLoggedIn: boolean
  onClose: () => void
  onSave?: (id: string) => void
  savedIds?: string[]
  totalPins?: number
}

const MOCK_MANDI_PRICES: Record<string, { price: number; market: string }> = {
  'Tomato':              { price: 17,  market: 'Azadpur, Delhi' },
  'Onion':              { price: 12,  market: 'Lasalgaon, Nashik' },
  'Potato':             { price: 15,  market: 'Agra, UP' },
  'Wheat - Sharbati':   { price: 23,  market: 'Bhopal, MP' },
  'Rice - Basmati':     { price: 38,  market: 'Karnal, Haryana' },
  'Chilli (Guntur)':    { price: 180, market: 'Guntur, AP' },
  'Turmeric':           { price: 145, market: 'Erode, TN' },
  'Groundnut':          { price: 65,  market: 'Rajkot, Gujarat' },
  'Soybean':            { price: 43,  market: 'Indore, MP' },
  'Cotton - Long Staple':{ price: 72, market: 'Surendranagar, Gujarat' },
}

function getMandiData(pin: MapPin): { price: number; market: string } | null {
  if (MOCK_MANDI_PRICES[pin.crop_name]) return MOCK_MANDI_PRICES[pin.crop_name]
  if (pin.expected_price) {
    return { price: Math.round(pin.expected_price * 0.85), market: 'Regional Mandi' }
  }
  return null
}

export default function BottomSheet({
  pin,
  isLoggedIn,
  onClose,
  totalPins = 0,
}: BottomSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dragStartY = useRef<number>(0)
  const isDragging = useRef(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pin) {
      // Small delay to ensure transition plays
      requestAnimationFrame(() => setIsOpen(true))
    } else {
      setIsOpen(false)
    }
  }, [pin])

  const handleDragStart = (e: ReactTouchEvent | ReactMouseEvent) => {
    isDragging.current = true
    dragStartY.current = 'touches' in e ? e.touches[0].clientY : (e as ReactMouseEvent).clientY
  }

  const handleDragEnd = (e: ReactTouchEvent | ReactMouseEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    const endY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as ReactMouseEvent).clientY
    const delta = endY - dragStartY.current
    if (delta > 50) {
      onClose()
    }
  }

  const mandiData = pin ? getMandiData(pin) : null
  const priceVsMandi = pin?.expected_price && mandiData
    ? Math.round(((pin.expected_price - mandiData.price) / mandiData.price) * 100)
    : 0

  const config = pin ? CATEGORY_CONFIG[pin.crop_category] : null

  function generateSparkline(basePrice: number, isUp: boolean): number[] {
    const points: number[] = []
    let price = basePrice * (isUp ? 0.82 : 1.18)
    for (let i = 0; i < 7; i++) {
      const drift = isUp
        ? 1 + (Math.random() * 0.06 - 0.01)
        : 1 - (Math.random() * 0.06 - 0.01)
      price = price * drift
      points.push(Math.round(price))
    }
    return points
  }

  const mandiSync = pin ? getMandiPriceSync(pin.crop_name) : null
  const isUp = mandiSync && pin?.expected_price ? pin.expected_price >= mandiSync.price : true
  const sparkData = mandiSync ? generateSparkline(mandiSync.price, isUp) : null

  return (
    <>
      {/* Sheet */}
      <div
        ref={sheetRef}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transform: isOpen && pin ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          willChange: 'transform',
          maxHeight: '60vh',
          overflowY: 'auto',
          background: '#0D1810',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px 24px 0 0',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
          pointerEvents: isOpen && pin ? 'auto' : 'none',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '12px',
            paddingBottom: '8px',
            cursor: 'grab',
          }}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          <div
            style={{
              width: '40px',
              height: '4px',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.2)',
            }}
          />
        </div>

        {pin && config && (
          <div style={{ padding: '0 20px 20px' }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <h2
                    style={{
                      color: 'white',
                      fontSize: '22px',
                      fontWeight: 700,
                      fontFamily: 'Inter, sans-serif',
                      margin: 0,
                    }}
                  >
                    {config.emoji} {pin.crop_name}
                  </h2>
                  {pin.is_organic && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        background: 'rgba(16,185,129,0.2)',
                        border: '1px solid rgba(16,185,129,0.4)',
                        color: '#34d399',
                        fontSize: '12px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Leaf style={{ width: '12px', height: '12px' }} />
                      Organic
                    </span>
                  )}
                </div>
                {/* Location & rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>
                    <MapPinIcon style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                    {pin.district}, {pin.state}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>
                    <Star style={{ width: '12px', height: '12px', flexShrink: 0, fill: pin.rating_avg > 0 ? '#fbbf24' : 'none', color: pin.rating_avg > 0 ? '#fbbf24' : 'rgba(255,255,255,0.2)' }} />
                    {pin.rating_avg > 0 ? pin.rating_avg.toFixed(1) : 'New'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginLeft: '12px',
                }}
              >
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            {/* Quantity & availability row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 0',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                marginBottom: '14px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Scale style={{ width: '14px', height: '14px', color: '#10b981' }} />
                <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>
                  {pin.quantity.toLocaleString()} {pin.unit}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>available</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                Harvest:{' '}
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                  Ready now
                </span>
              </div>
            </div>

            {/* Price section */}
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                padding: '14px',
                marginBottom: '14px',
              }}
            >
              {pin.expected_price ? (
                <div style={{ marginBottom: mandiData ? '8px' : 0 }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    Farmer&apos;s price
                  </div>
                  <div style={{ color: 'white', fontSize: '22px', fontWeight: 700 }}>
                    ₹{pin.expected_price}
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 400 }}>/{pin.unit}</span>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', fontStyle: 'italic' }}>Price not set</div>
              )}

              {mandiData && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    paddingTop: '8px',
                    borderTop: pin.expected_price ? '1px solid rgba(255,255,255,0.07)' : 'none',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Today&apos;s mandi:</span>
                  <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 600 }}>
                    ₹{mandiData.price}/kg · {mandiData.market}
                  </span>
                  {pin.expected_price && (
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: priceVsMandi > 0 ? '#10b981' : '#f59e0b',
                      }}
                    >
                      {priceVsMandi > 0 ? '▲' : '▼'} {Math.abs(priceVsMandi)}% {priceVsMandi > 0 ? 'above' : 'below'} mandi
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Sparkline price trend */}
            {sparkData && (
              <div style={{ marginTop: 16, marginBottom: 14 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6, letterSpacing: '0.04em', margin: '0 0 6px' }}>7-DAY PRICE TREND</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', minWidth: 40 }}>₹{sparkData[0]}</span>
                  <svg viewBox="0 0 120 36" style={{ flex: 1, height: 36 }} preserveAspectRatio="none">
                    {(() => {
                      const min = Math.min(...sparkData)
                      const max = Math.max(...sparkData)
                      const range = max - min || 1
                      const points = sparkData.map((v, i) =>
                        `${(i / 6) * 120},${36 - ((v - min) / range) * 30}`
                      ).join(' ')
                      const color = isUp ? '#00C97A' : '#EF4444'
                      const areaPoints = `0,36 ${points} 120,36`
                      return (
                        <>
                          <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <polygon points={areaPoints} fill={color} fillOpacity="0.1" />
                        </>
                      )
                    })()}
                  </svg>
                  <span style={{ fontSize: 11, color: isUp ? '#00C97A' : '#EF4444', fontFamily: 'monospace', minWidth: 40, textAlign: 'right' }}>₹{sparkData[6]}</span>
                </div>
              </div>
            )}

            {/* Contact section */}
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              {isLoggedIn ? (
                <>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                    Farmer Contact
                  </div>
                  {pin.farmer_name && (
                    <div style={{ color: 'white', fontSize: '15px', fontWeight: 600 }}>
                      {pin.farmer_name}
                      {pin.farmer_village && (
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 400, marginLeft: '8px' }}>
                          {pin.farmer_village}
                        </span>
                      )}
                    </div>
                  )}
                  {pin.farmer_phone && (
                    <a
                      href={`tel:${pin.farmer_phone}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '14px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                        color: 'black',
                        fontWeight: 700,
                        fontSize: '15px',
                        textDecoration: 'none',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      <Phone style={{ width: '16px', height: '16px' }} />
                      {pin.farmer_phone}
                    </a>
                  )}
                </>
              ) : (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.07)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        flexShrink: 0,
                      }}
                    >
                      👨‍🌾
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Farmer contact hidden</div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Login to see name &amp; phone</div>
                    </div>
                  </div>
                  <Link
                    href="/auth"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '14px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08))',
                      border: '1px solid rgba(16,185,129,0.3)',
                      color: '#34d399',
                      fontWeight: 700,
                      fontSize: '15px',
                      textDecoration: 'none',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <Lock style={{ width: '14px', height: '14px' }} />
                    Login to contact farmer
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* No pin — show hint row */}
        {!pin && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 20px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px #10b981',
                  flexShrink: 0,
                  display: 'inline-block',
                }}
              />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                {totalPins} live crops on map
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
