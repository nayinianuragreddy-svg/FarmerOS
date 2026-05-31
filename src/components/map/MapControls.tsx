'use client'

import type { CSSProperties } from 'react'

interface Props {
  showHeatmap: boolean
  onToggleHeatmap: () => void
  onReset: () => void
  mapStyle: 'dark' | 'satellite'
  onToggleStyle: () => void
  isMandis: boolean
  onToggleMandis: () => void
}

export default function MapControls({
  showHeatmap,
  onToggleHeatmap,
  onReset,
  mapStyle,
  onToggleStyle,
  isMandis,
  onToggleMandis,
}: Props) {
  const btnBase: CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(7,12,10,0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '18px',
    lineHeight: 1,
    color: 'rgba(255,255,255,0.7)',
    transition: 'border-color 0.15s ease, background 0.15s ease, color 0.15s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    flexShrink: 0,
  }

  const activeStyle: CSSProperties = {
    ...btnBase,
    border: '1px solid rgba(255,255,255,0.25)',
    color: 'white',
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
      {/* Reset to India */}
      <button
        onClick={onReset}
        title="Reset to India view"
        style={btnBase}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
      >
        📍
      </button>

      {/* Satellite / Dark toggle */}
      <button
        onClick={onToggleStyle}
        title={mapStyle === 'dark' ? 'Switch to Satellite' : 'Switch to Dark Map'}
        style={btnBase}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
      >
        {mapStyle === 'dark' ? '🛰️' : '🌑'}
      </button>

      {/* Heatmap toggle */}
      <button
        onClick={onToggleHeatmap}
        title="Toggle heatmap"
        style={{
          ...btnBase,
          border: showHeatmap ? '1px solid rgba(249,115,22,0.7)' : btnBase.border,
          background: showHeatmap ? 'rgba(249,115,22,0.2)' : btnBase.background,
          color: showHeatmap ? '#fb923c' : 'rgba(255,255,255,0.7)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = showHeatmap ? 'rgba(249,115,22,0.7)' : 'rgba(255,255,255,0.12)'
        }}
      >
        🔥
      </button>

      {/* Mandis toggle */}
      <button
        onClick={onToggleMandis}
        title="Toggle nearby mandis"
        style={{
          ...(isMandis ? activeStyle : btnBase),
          border: isMandis ? '1px solid rgba(249,115,22,0.7)' : btnBase.border,
          background: isMandis ? 'rgba(249,115,22,0.2)' : btnBase.background,
          color: isMandis ? '#fb923c' : 'rgba(255,255,255,0.7)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = isMandis ? 'rgba(249,115,22,0.7)' : 'rgba(255,255,255,0.12)'
        }}
      >
        🏪
      </button>
    </div>
  )
}
