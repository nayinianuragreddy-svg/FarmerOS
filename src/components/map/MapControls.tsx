'use client'

import { Flame, SlidersHorizontal, Locate, Layers } from 'lucide-react'

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
    <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">

      {/* Filter button */}
      <button
        onClick={onToggleFilters}
        title="Filter by crop type"
        className={`relative group flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-xl border backdrop-blur-xl text-sm font-semibold transition-all duration-200 shadow-lg ${
          filterCount > 0
            ? 'bg-emerald-500/90 border-emerald-400/80 text-black shadow-emerald-500/30'
            : 'bg-black/60 border-white/10 text-white/80 hover:text-white hover:border-white/20 hover:bg-black/70'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" strokeWidth={2} />
        <span>Filters</span>
        {filterCount > 0 && (
          <span className="bg-black/25 text-black text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {filterCount}
          </span>
        )}
      </button>

      {/* Heatmap toggle */}
      <button
        onClick={onToggleHeatmap}
        title="Toggle heat map"
        className={`flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-xl border backdrop-blur-xl text-sm font-semibold transition-all duration-200 shadow-lg ${
          showHeatmap
            ? 'bg-orange-500/90 border-orange-400/80 text-white shadow-orange-500/30'
            : 'bg-black/60 border-white/10 text-white/80 hover:text-white hover:border-white/20 hover:bg-black/70'
        }`}
      >
        <Flame className="w-4 h-4" strokeWidth={2} />
        <span>Heat Map</span>
      </button>

      {/* Divider */}
      <div className="h-px bg-white/8 mx-1" />

      {/* Reset to India */}
      <button
        onClick={onReset}
        title="Reset to India view"
        className="flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl text-white/60 hover:text-white hover:border-white/20 hover:bg-black/70 text-sm font-medium transition-all duration-200 shadow-lg"
      >
        <Locate className="w-4 h-4" strokeWidth={2} />
        <span>India</span>
      </button>

      {/* Layer info */}
      <button
        className="flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl text-white/60 hover:text-white hover:border-white/20 hover:bg-black/70 text-sm font-medium transition-all duration-200 shadow-lg cursor-default"
        title="Map: CARTO dark (free)"
      >
        <Layers className="w-4 h-4" strokeWidth={2} />
        <span>Dark Map</span>
      </button>
    </div>
  )
}
