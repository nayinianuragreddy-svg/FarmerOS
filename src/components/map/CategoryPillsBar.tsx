'use client'

import { useRef } from 'react'
import type { CSSProperties } from 'react'
import { CATEGORY_CONFIG } from '@/lib/constants'
import { CropCategory } from '@/lib/types'

interface CategoryPillsBarProps {
  activeCategory: CropCategory | null
  onCategoryChange: (cat: CropCategory | null) => void
  organicOnly: boolean
  onOrganicToggle: () => void
  totalPins?: number
}

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as CropCategory[]

export default function CategoryPillsBar({
  activeCategory,
  onCategoryChange,
  organicOnly,
  onOrganicToggle,
  totalPins = 0,
}: CategoryPillsBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const isAllActive = activeCategory === null

  return (
    <div
      style={{
        height: '56px',
        background: 'rgba(7,12,10,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingLeft: '16px',
          paddingRight: '16px',
          height: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        } as CSSProperties}
        className="no-scrollbar"
      >
        {/* All pill */}
        <button
          onClick={() => onCategoryChange(null)}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '9999px',
            border: isAllActive
              ? '1px solid rgba(16,185,129,0.7)'
              : '1px solid rgba(255,255,255,0.12)',
            background: isAllActive ? '#10b981' : 'transparent',
            color: isAllActive ? 'white' : 'rgba(255,255,255,0.5)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.12s ease',
            whiteSpace: 'nowrap',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span style={{ fontSize: '14px' }}>🌾</span>
          <span>All</span>
          {totalPins > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '10px',
                background: isAllActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                color: isAllActive ? 'white' : 'rgba(255,255,255,0.4)',
              }}
            >
              {totalPins}
            </span>
          )}
        </button>

        {/* Category pills */}
        {ALL_CATEGORIES.map(cat => {
          const config = CATEGORY_CONFIG[cat]
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(isActive ? null : cat)}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 16px',
                borderRadius: '9999px',
                border: isActive
                  ? `1px solid ${config.mapColor}`
                  : '1px solid rgba(255,255,255,0.12)',
                background: isActive ? config.mapColor : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                whiteSpace: 'nowrap',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <span style={{ fontSize: '14px' }}>{config.emoji}</span>
              <span>{config.label}</span>
            </button>
          )
        })}

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '24px',
            background: 'rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}
        />

        {/* Organic toggle */}
        <button
          onClick={onOrganicToggle}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '8px 16px',
            borderRadius: '9999px',
            border: organicOnly
              ? '1px solid #10b981'
              : '1px solid rgba(255,255,255,0.12)',
            background: organicOnly ? '#10b981' : 'transparent',
            color: organicOnly ? 'white' : 'rgba(255,255,255,0.5)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.12s ease',
            whiteSpace: 'nowrap',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span style={{ fontSize: '14px' }}>🌿</span>
          <span>Organic</span>
        </button>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
