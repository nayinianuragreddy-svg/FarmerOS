'use client'

import { useRef } from 'react'
import { CATEGORY_CONFIG } from '@/lib/constants'
import { CropCategory } from '@/lib/types'

interface CategoryPillsBarProps {
  activeCategories: CropCategory[]
  onCategoryChange: (cats: CropCategory[]) => void
  organicOnly: boolean
  onOrganicToggle: () => void
  totalPins?: number
}

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as CropCategory[]

export default function CategoryPillsBar({
  activeCategories,
  onCategoryChange,
  organicOnly,
  onOrganicToggle,
  totalPins = 0,
}: CategoryPillsBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const isAllActive = activeCategories.length === 0

  const toggleCategory = (cat: CropCategory) => {
    if (activeCategories.includes(cat)) {
      onCategoryChange(activeCategories.filter(c => c !== cat))
    } else {
      onCategoryChange([...activeCategories, cat])
    }
  }

  const clearAll = () => onCategoryChange([])

  return (
    <div
      style={{
        height: '52px',
        background: 'rgba(6,9,14,0.92)',
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
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="no-scrollbar"
      >
        {/* All Crops pill */}
        <button
          onClick={clearAll}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            border: `1px solid ${isAllActive ? 'rgba(0,201,122,0.5)' : 'rgba(255,255,255,0.1)'}`,
            background: isAllActive ? 'rgba(0,201,122,0.15)' : 'rgba(255,255,255,0.05)',
            color: isAllActive ? 'white' : 'rgba(255,255,255,0.5)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '14px' }}>🗺️</span>
          <span>All Crops</span>
          {totalPins > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '10px',
                background: isAllActive ? 'rgba(0,201,122,0.25)' : 'rgba(255,255,255,0.08)',
                color: isAllActive ? '#00C97A' : 'rgba(255,255,255,0.4)',
              }}
            >
              {totalPins}
            </span>
          )}
        </button>

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '24px',
            background: 'rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}
        />

        {/* Category pills */}
        {ALL_CATEGORIES.map(cat => {
          const config = CATEGORY_CONFIG[cat]
          const isActive = activeCategories.includes(cat)
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                borderRadius: '20px',
                border: `1px solid ${isActive ? `${config.mapColor}50` : 'rgba(255,255,255,0.1)'}`,
                background: isActive ? `${config.mapColor}25` : 'rgba(255,255,255,0.05)',
                color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '14px' }}>{config.emoji}</span>
              <span>{config.label}</span>
            </button>
          )
        })}

        {/* Divider before organic */}
        <div
          style={{
            width: '1px',
            height: '24px',
            background: 'rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}
        />

        {/* Organic toggle — always visible at the right */}
        <button
          onClick={onOrganicToggle}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 14px',
            borderRadius: '20px',
            border: `1px solid ${organicOnly ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)'}`,
            background: organicOnly ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
            color: organicOnly ? '#34d399' : 'rgba(255,255,255,0.5)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '14px' }}>🌿</span>
          <span>Organic</span>
        </button>
      </div>

      {/* Hide scrollbar for webkit */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
