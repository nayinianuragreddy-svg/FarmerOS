'use client'

import { X } from 'lucide-react'
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
  const toggle = (cat: CropCategory) => {
    onChange(
      activeCategories.includes(cat)
        ? activeCategories.filter(c => c !== cat)
        : [...activeCategories, cat],
    )
  }

  const clearAll = () => onChange([])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`absolute left-0 top-0 bottom-0 z-40 w-72 bg-[#0a0d12]/95 border-r border-white/10 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-white font-bold text-base">Filter Crops</h2>
            {activeCategories.length > 0 && (
              <p className="text-emerald-400 text-xs mt-0.5">{activeCategories.length} selected</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeCategories.length > 0 && (
              <button
                onClick={clearAll}
                className="text-white/40 hover:text-white/80 text-xs transition"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-thin">
          {ALL_CATEGORIES.map(cat => {
            const config = CATEGORY_CONFIG[cat]
            const active = activeCategories.includes(cat)
            return (
              <button
                key={cat}
                onClick={() => toggle(cat)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition text-left ${
                  active
                    ? 'border-transparent text-white'
                    : 'border-white/5 hover:border-white/15 text-white/60 hover:text-white/90 bg-white/5'
                }`}
                style={active ? { backgroundColor: config.mapColor + '22', borderColor: config.mapColor + '66' } : {}}
              >
                <span className="text-xl">{config.emoji}</span>
                <span className="text-sm font-medium flex-1">{config.label}</span>
                {active && (
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: config.mapColor }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 rounded-xl transition text-sm"
          >
            {activeCategories.length > 0 ? `Show ${activeCategories.length} filter${activeCategories.length > 1 ? 's' : ''}` : 'Show all crops'}
          </button>
        </div>
      </div>
    </>
  )
}
