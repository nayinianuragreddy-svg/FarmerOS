'use client'

import { useState } from 'react'

interface Dot { price: number; label: string }

interface Props {
  dots: Dot[]              // every mandi: price (₹/qtl) + name
  msp?: number | null      // MSP floor line
  breakEven?: number | null // estimated break-even line (Profit Lens)
  highlight?: number | null // a value to mark (e.g. national avg / "you")
  highlightLabel?: string
}

// The signature visualization: a crop's price reality as a distribution along a ₹ axis,
// with the MSP floor and break-even (cost) as reference lines. See the spread, the floor,
// the profit zone, and where each mandi sits — in one glance.
export default function PriceSpectrum({ dots, msp, breakEven, highlight, highlightLabel }: Props) {
  const [hover, setHover] = useState<{ x: number; label: string; price: number } | null>(null)
  if (!dots.length) return null

  const prices = dots.map(d => d.price)
  const refs = [msp, breakEven, highlight].filter((v): v is number => typeof v === 'number' && v > 0)
  const lo = Math.min(...prices, ...refs)
  const hi = Math.max(...prices, ...refs)
  const span = Math.max(1, hi - lo)
  const pad = span * 0.06
  const min = lo - pad
  const max = hi + pad
  const pct = (v: number) => ((v - min) / (max - min)) * 100

  const sorted = [...prices].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]

  // Color a dot by where it sits: below break-even = loss (amber→red), above = profit (greens)
  const dotColor = (p: number) => {
    if (breakEven && p < breakEven) return '#D4841A'
    if (msp && p < msp) return '#EAB308'
    return '#00C97A'
  }

  // Deterministic vertical jitter so overlapping mandis are visible
  const jitter = (i: number) => 12 + ((i * 37) % 56)

  return (
    <div style={{ width: '100%' }}>
      <div style={{ position: 'relative', height: 96, marginTop: 8 }}>
        {/* baseline */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(255,255,255,0.1)' }} />

        {/* profit zone shading (above break-even) */}
        {breakEven && (
          <div style={{ position: 'absolute', top: 8, bottom: 22, left: `${pct(breakEven)}%`, right: 0, background: 'linear-gradient(90deg, rgba(0,201,122,0.05), rgba(0,201,122,0.1))', borderRadius: 4 }} />
        )}

        {/* reference lines */}
        {breakEven && <RefLine x={pct(breakEven)} color="#D4841A" label={`Break-even ₹${breakEven.toLocaleString('en-IN')}`} top />}
        {msp && <RefLine x={pct(msp)} color="#00C97A" label={`MSP ₹${msp.toLocaleString('en-IN')}`} />}
        {highlight && <RefLine x={pct(highlight)} color="#ffffff" label={`${highlightLabel || 'Avg'} ₹${Math.round(highlight).toLocaleString('en-IN')}`} top dashed />}

        {/* dots */}
        {dots.map((d, i) => (
          <div
            key={i}
            onMouseEnter={() => setHover({ x: pct(d.price), label: d.label, price: d.price })}
            onMouseLeave={() => setHover(null)}
            style={{
              position: 'absolute', left: `${pct(d.price)}%`, top: jitter(i),
              width: 9, height: 9, borderRadius: '50%', marginLeft: -4.5,
              background: dotColor(d.price), opacity: 0.62,
              boxShadow: `0 0 6px ${dotColor(d.price)}66`, cursor: 'pointer',
              transition: 'transform .1s', transform: hover?.label === d.label ? 'scale(1.8)' : 'scale(1)',
            }}
          />
        ))}

        {/* hover tooltip */}
        {hover && (
          <div style={{ position: 'absolute', left: `${hover.x}%`, top: -6, transform: 'translateX(-50%)', background: '#0B120D', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '5px 9px', fontSize: 11, color: '#fff', whiteSpace: 'nowrap', zIndex: 5, pointerEvents: 'none' }}>
            <b>{hover.label}</b> · ₹{hover.price.toLocaleString('en-IN')}
          </div>
        )}
      </div>

      {/* axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', marginTop: 2 }}>
        <span>₹{Math.round(lo).toLocaleString('en-IN')}</span>
        <span>median ₹{median.toLocaleString('en-IN')}</span>
        <span>₹{Math.round(hi).toLocaleString('en-IN')}</span>
      </div>
    </div>
  )
}

function RefLine({ x, color, label, top, dashed }: { x: number; color: string; label: string; top?: boolean; dashed?: boolean }) {
  return (
    <div style={{ position: 'absolute', left: `${x}%`, top: 6, bottom: 6, width: 0, borderLeft: `1.5px ${dashed ? 'dashed' : 'solid'} ${color}`, zIndex: 2 }}>
      <span style={{ position: 'absolute', [top ? 'top' : 'bottom']: -4, left: 5, fontSize: 10, fontWeight: 700, color, whiteSpace: 'nowrap', background: 'rgba(7,12,10,0.7)', padding: '1px 4px', borderRadius: 4 } as React.CSSProperties}>
        {label}
      </span>
    </div>
  )
}
