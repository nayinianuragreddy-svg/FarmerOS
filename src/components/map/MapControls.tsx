'use client'

import type { CSSProperties } from 'react'
import { Flame, Locate } from 'lucide-react'

interface Props {
  showHeatmap: boolean
  onToggleHeatmap: () => void
  onReset: () => void
  mapStyle: 'dark' | 'satellite'
  onToggleStyle: () => void
}

export default function MapControls({
  showHeatmap,
  onToggleHeatmap,
  onReset,
  mapStyle,
  onToggleStyle,
}: Props) {
  const btnBase: CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(6,9,14,0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '18px',
    lineHeight: 1,
    color: 'rgba(255,255,255,0.7)',
    transition: 'all 0.15s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '80px',
        right: '16px',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Satellite / Dark toggle */}
      <button
        onClick={onToggleStyle}
        title={mapStyle === 'dark' ? 'Switch to Satellite' : 'Switch to Dark Map'}
        style={btnBase}
      >
        <span>{mapStyle === 'dark' ? '🛰️' : '🌑'}</span>
      </button>

      {/* Heatmap toggle */}
      <button
        onClick={onToggleHeatmap}
        title="Toggle heat map"
        style={{
          ...btnBase,
          border: showHeatmap ? '1px solid rgba(249,115,22,0.6)' : btnBase.border,
          background: showHeatmap ? 'rgba(249,115,22,0.25)' : btnBase.background,
          color: showHeatmap ? '#fb923c' : 'rgba(255,255,255,0.7)',
        }}
      >
        <Flame className="w-4 h-4" strokeWidth={2} />
      </button>

      {/* Reset to India */}
      <button
        onClick={onReset}
        title="Reset to India view"
        style={btnBase}
      >
        <Locate className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  )
}
