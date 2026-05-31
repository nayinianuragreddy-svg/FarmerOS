'use client'

import { Flame, SlidersHorizontal, Locate } from 'lucide-react'

interface Props {
  showHeatmap: boolean
  onToggleHeatmap: () => void
  onToggleFilters: () => void
  onReset: () => void
  filterCount: number
}

export default function MapControls({
  showHeatmap,
  onToggleHeatmap,
  onToggleFilters,
  onReset,
  filterCount,
}: Props) {
  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
      {/* Filter toggle */}
      <button
        onClick={onToggleFilters}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-sm text-sm font-medium transition shadow-lg ${
          filterCount > 0
            ? 'bg-emerald-500 border-emerald-400 text-black'
            : 'bg-black/70 border-white/10 text-white/80 hover:text-white hover:border-white/20'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>Filters</span>
        {filterCount > 0 && (
          <span className="bg-black/30 text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {filterCount}
          </span>
        )}
      </button>

      {/* Heatmap toggle */}
      <button
        onClick={onToggleHeatmap}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-sm text-sm font-medium transition shadow-lg ${
          showHeatmap
            ? 'bg-orange-500/90 border-orange-400 text-white'
            : 'bg-black/70 border-white/10 text-white/80 hover:text-white hover:border-white/20'
        }`}
      >
        <Flame className="w-4 h-4" />
        <span>Heat Map</span>
      </button>

      {/* Reset to India */}
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-black/70 backdrop-blur-sm text-white/70 hover:text-white hover:border-white/20 text-sm font-medium transition shadow-lg"
      >
        <Locate className="w-4 h-4" />
        <span>India</span>
      </button>
    </div>
  )
}
