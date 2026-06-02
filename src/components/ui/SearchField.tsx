'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, X, MapPin, CornerDownLeft } from 'lucide-react'
import { CROP_TAXONOMY, CATEGORY_CONFIG } from '@/lib/constants'
import { CropCategory } from '@/lib/types'

const ALL_CROPS = Object.entries(CROP_TAXONOMY).flatMap(([cat, crops]) =>
  (crops as string[]).map(c => ({ name: c, category: cat as CropCategory })),
)

interface Props {
  value: string
  onChange: (q: string) => void
  /** Fired on Enter or when a suggestion / "search location" is chosen. */
  onSubmit?: (q: string) => void
  placeholder?: string
  size?: 'md' | 'lg'
  /** Show the "search this place on the map" affordance when no crop matches. */
  allowLocation?: boolean
}

export default function SearchField({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search crops or a place…',
  size = 'md',
  allowLocation = true,
}: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return []
    return ALL_CROPS.filter(c => c.name.toLowerCase().includes(q)).slice(0, 6)
  }, [value])

  const showLocation = allowLocation && value.trim().length >= 2

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const h = size === 'lg' ? 56 : 48
  const fontSize = size === 'lg' ? 16 : 15

  const submit = (q: string) => {
    onChange(q)
    onSubmit?.(q)
    setOpen(false)
    inputRef.current?.blur()
  }

  // rows = crop suggestions + optional location row
  const rowCount = suggestions.length + (showLocation ? 1 : 0)

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || rowCount === 0) {
      if (e.key === 'Enter' && value.trim()) submit(value.trim())
      return
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => (a + 1) % rowCount) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => (a - 1 + rowCount) % rowCount) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (active >= 0 && active < suggestions.length) submit(suggestions[active].name)
      else submit(value.trim())
    } else if (e.key === 'Escape') { setOpen(false) }
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          height: h,
          padding: '0 14px',
          background: 'rgba(255,255,255,0.045)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          transition: 'border-color .15s ease, box-shadow .15s ease, background .15s ease',
          ...(open
            ? {
                borderColor: 'rgba(0,201,122,0.55)',
                background: 'rgba(255,255,255,0.06)',
                boxShadow: '0 0 0 3px rgba(0,201,122,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
              }
            : {}),
        }}
      >
        <Search size={size === 'lg' ? 20 : 18} style={{ color: open ? '#00C97A' : 'rgba(255,255,255,0.55)', flexShrink: 0, transition: 'color .15s ease' }} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); setActive(-1) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          style={{
            flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontSize, fontFamily: 'inherit',
          }}
        />
        {value && (
          <button
            onClick={() => { onChange(''); onSubmit?.(''); inputRef.current?.focus() }}
            style={{ flexShrink: 0, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', padding: 2 }}
            aria-label="Clear"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {open && rowCount > 0 && (
        <div
          className="glass-panel"
          style={{ position: 'absolute', top: h + 8, left: 0, right: 0, padding: 6, zIndex: 60, overflow: 'hidden' }}
        >
          {suggestions.map((s, i) => {
            const cfg = CATEGORY_CONFIG[s.category]
            const isActive = i === active
            return (
              <button
                key={s.name}
                onMouseDown={() => submit(s.name)}
                onMouseEnter={() => setActive(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                  padding: '9px 10px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent', color: '#fff',
                }}
              >
                <span style={{ fontSize: 16 }}>{cfg.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{s.name}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{cfg.label}</span>
              </button>
            )
          })}
          {showLocation && (
            <button
              onMouseDown={() => submit(value.trim())}
              onMouseEnter={() => setActive(suggestions.length)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                padding: '9px 10px', borderRadius: 9, border: 'none', cursor: 'pointer',
                background: active === suggestions.length ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: '#fff', borderTop: suggestions.length ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              <MapPin size={16} style={{ color: '#00C97A' }} />
              <span style={{ fontSize: 14, flex: 1 }}>Go to <b>{value.trim()}</b> on the map</span>
              <CornerDownLeft size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
