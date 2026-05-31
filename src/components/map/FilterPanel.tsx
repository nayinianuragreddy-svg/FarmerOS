'use client'

import { X, Search } from 'lucide-react'
import { useState } from 'react'
import { CATEGORY_CONFIG } from '@/lib/constants'
import { CropCategory } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  activeCategories: CropCategory[]
  onChange: (cats: CropCategory[]) => void
}

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as CropCategory[]

export default function FilterPanel({ open, onClose, activeCategories, onChange }: Props) {
  const [search, setSearch] = useState('')

  const toggle = (cat: CropCategory) => {
    onChange(
      activeCategories.includes(cat)
        ? activeCategories.filter(c => c !== cat)
        : [...activeCategories, cat],
    )
  }

  const clearAll = () => onChange([])

  const filtered = ALL_CATEGORIES.filter(cat =>
    CATEGORY_CONFIG[cat].label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="absolute inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`absolute left-0 top-0 bottom-0 z-40 w-80 flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'rgba(6, 9, 14, 0.96)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/8">
          <div>
            <h2 className="text-white font-bold text-lg">Crop Filters</h2>
            <p className="text-white/35 text-xs mt-0.5">
              {activeCategories.length === 0
                ? 'Showing all crop types'
                : `${activeCategories.length} of ${ALL_CATEGORIES.length} selected`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeCategories.length > 0 && (
              <button
                onClick={clearAll}
                className="text-white/35 hover:text-white/70 text-xs transition font-medium"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search within categories */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
            <Search className="w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Find category…"
              className="flex-1 bg-transparent text-white/80 text-sm placeholder:text-white/25 outline-none"
            />
          </div>
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-thin">
          {filtered.map(cat => {
            const config = CATEGORY_CONFIG[cat]
            const active = activeCategories.includes(cat)
            return (
              <button
                key={cat}
                onClick={() => toggle(cat)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all duration-150 text-left group ${
                  active
                    ? 'border-transparent'
                    : 'border-white/6 hover:border-white/12 hover:bg-white/3'
                }`}
                style={
                  active
                    ? {
                        background: `${config.mapColor}15`,
                        borderColor: `${config.mapColor}40`,
                      }
                    : {}
                }
              >
                {/* Emoji */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 transition"
                  style={{
                    background: active ? `${config.mapColor}25` : 'rgba(255,255,255,0.05)',
                  }}
                >
                  {config.emoji}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm font-medium transition ${
                      active ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                    }`}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Active dot */}
                {active && (
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: config.mapColor }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Footer CTA */}
        <div className="px-4 pt-3 pb-5 border-t border-white/8">
          <button
            onClick={onClose}
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-black font-bold py-3 rounded-xl transition-all duration-150 text-sm shadow-lg shadow-emerald-500/20"
          >
            {activeCategories.length > 0
              ? `Apply ${activeCategories.length} filter${activeCategories.length > 1 ? 's' : ''}`
              : 'Show all crops'}
          </button>
        </div>
      </div>
    </>
  )
}
