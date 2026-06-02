'use client'

import { useEffect, useState } from 'react'
import { X, MapPin, TrendingUp, Store } from 'lucide-react'
import { commodityEmoji, prettyCommodity, getMSPFor, getBreakEvenFor } from '@/lib/mandi'
import { getCropDescription } from '@/lib/api'
import PriceSpectrum from './PriceSpectrum'

function Sparkline({ series }: { series: number[] }) {
  if (series.length < 2) return null
  const lo = Math.min(...series), hi = Math.max(...series), span = Math.max(1, hi - lo)
  const W = 100, H = 32
  const pts = series.map((v, i) => `${(i / (series.length - 1)) * W},${H - ((v - lo) / span) * H}`).join(' ')
  const up = series[series.length - 1] >= series[0]
  const color = up ? '#00C97A' : '#D4841A'
  const pct = Math.round(((series[series.length - 1] - series[0]) / series[0]) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ flex: 1, height: 36 }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'monospace' }}>{up ? '▲' : '▼'} {Math.abs(pct)}%</span>
    </div>
  )
}

interface MandiRow {
  market: string
  district: string
  state: string
  variety: string
  modalPrice: number
  minPrice: number
  maxPrice: number
}

interface StateAgg { state: string; avg: number; min: number; max: number; count: number }

interface Props {
  commodity: string | null
  onClose: () => void
}

export default function CommodityDetail({ commodity, onClose }: Props) {
  const [rows, setRows] = useState<MandiRow[]>([])
  const [loading, setLoading] = useState(false)
  const [live, setLive] = useState(false)
  const [desc, setDesc] = useState<string | null>(null)
  const [trend, setTrend] = useState<{ date: string; avg_modal: number }[]>([])

  useEffect(() => {
    if (!commodity) return
    setLoading(true); setRows([]); setDesc(null); setLive(false); setTrend([])
    let active = true

    fetch(`/api/mandi-history?commodity=${encodeURIComponent(commodity)}`)
      .then(r => r.json())
      .then(d => { if (active && d?.series) setTrend(d.series) })
      .catch(() => {})

    fetch(`/api/mandi-prices?commodity=${encodeURIComponent(commodity)}&state=all&limit=2000`)
      .then(r => r.json())
      .then(d => {
        if (!active) return
        const recs: MandiRow[] = (d?.records ?? [])
          .filter((r: MandiRow) => r.modalPrice > 0)
          .map((r: MandiRow) => ({ market: r.market, district: r.district, state: r.state, variety: r.variety, modalPrice: r.modalPrice, minPrice: r.minPrice, maxPrice: r.maxPrice }))
        setRows(recs)
        setLive(recs.length > 0)
        setLoading(false)
      })
      .catch(() => { if (active) setLoading(false) })

    getCropDescription(prettyCommodity(commodity)).then(t => { if (active) setDesc(t) }).catch(() => {})
    return () => { active = false }
  }, [commodity])

  if (!commodity) return null

  const sorted = [...rows].sort((a, b) => b.modalPrice - a.modalPrice)
  const dearest = sorted[0]
  const cheapest = sorted[sorted.length - 1]
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.modalPrice, 0) / rows.length) : 0
  const msp = getMSPFor(commodity)
  const breakEven = getBreakEvenFor(commodity)
  const aboveMsp = msp ? rows.filter(r => r.modalPrice >= msp).length : 0
  const margin = breakEven ? Math.round(((avg - breakEven) / breakEven) * 100) : null

  // State-level aggregation (price geography)
  const stateMap = new Map<string, { sum: number; n: number; min: number; max: number }>()
  for (const r of rows) {
    const s = r.state || '—'
    const cur = stateMap.get(s)
    if (!cur) stateMap.set(s, { sum: r.modalPrice, n: 1, min: r.modalPrice, max: r.modalPrice })
    else { cur.sum += r.modalPrice; cur.n++; cur.min = Math.min(cur.min, r.modalPrice); cur.max = Math.max(cur.max, r.modalPrice) }
  }
  const states: StateAgg[] = Array.from(stateMap.entries())
    .map(([state, v]) => ({ state, avg: Math.round(v.sum / v.n), min: v.min, max: v.max, count: v.n }))
    .sort((a, b) => a.avg - b.avg)

  // Variety breakdown
  const varMap = new Map<string, { sum: number; n: number }>()
  for (const r of rows) { const k = r.variety || 'Other'; const c = varMap.get(k); if (!c) varMap.set(k, { sum: r.modalPrice, n: 1 }); else { c.sum += r.modalPrice; c.n++ } }
  const varieties = Array.from(varMap.entries()).map(([variety, v]) => ({ variety, avg: Math.round(v.sum / v.n), count: v.n })).sort((a, b) => b.count - a.count).slice(0, 6)

  const maxStateAvg = states.length ? Math.max(...states.map(s => s.avg)) : 1
  const name = prettyCommodity(commodity)

  const Stat = ({ label, value, sub, color = '#fff' }: { label: string; value: string; sub?: string; color?: string }) => (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{sub}</div>}
    </div>
  )

  return (
    <>
      {/* Scrim */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)', zIndex: 200 }} />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(560px, 100vw)', zIndex: 201,
        background: '#0B120D', borderLeft: '1px solid rgba(255,255,255,0.1)', boxShadow: '-24px 0 64px rgba(0,0,0,0.6)',
        overflowY: 'auto', animation: 'detailIn 0.32s cubic-bezier(.32,.72,0,1)',
      }}>
        <style>{`@keyframes detailIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

        {/* Header */}
        <div style={{ position: 'sticky', top: 0, background: 'rgba(11,18,13,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 2 }}>
          <span style={{ fontSize: 26 }}>{commodityEmoji(commodity)}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              {loading ? 'Loading mandis…' : `${rows.length} mandis reporting today · ${live ? 'Live · Agmarknet' : 'No data'}`}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: 7, cursor: 'pointer', color: '#fff', display: 'flex' }}><X size={18} /></button>
        </div>

        <div style={{ padding: 20 }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>Fetching every mandi for {name}…</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>No live mandi data for {name} today.</div>
          ) : (
            <>
              {/* Stat grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                <Stat label="National avg" value={`₹${avg.toLocaleString('en-IN')}`} sub="per quintal" color="#00C97A" />
                <Stat label="Spread today" value={`₹${cheapest.modalPrice.toLocaleString('en-IN')}–${dearest.modalPrice.toLocaleString('en-IN')}`} sub={`${rows.length} mandis`} />
                <Stat label="💰 Dearest" value={dearest.market} sub={`₹${dearest.modalPrice.toLocaleString('en-IN')} · ${dearest.state}`} color="#00C97A" />
                <Stat label="🪙 Cheapest" value={cheapest.market} sub={`₹${cheapest.modalPrice.toLocaleString('en-IN')} · ${cheapest.state}`} color="#D4841A" />
              </div>

              {/* MSP */}
              {msp && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12, marginBottom: 18, background: avg >= msp ? 'rgba(0,201,122,0.1)' : 'rgba(212,132,26,0.12)', border: `1px solid ${avg >= msp ? 'rgba(0,201,122,0.25)' : 'rgba(212,132,26,0.3)'}` }}>
                  <span style={{ fontSize: 18 }}>{avg >= msp ? '✓' : '⚠'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: avg >= msp ? '#00C97A' : '#D4841A' }}>MSP floor ₹{msp.toLocaleString('en-IN')}/qtl · {aboveMsp}/{rows.length} mandis above</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Govt minimum support price, 2025-26</div>
                  </div>
                </div>
              )}

              {/* Profit Lens — margin vs estimated break-even */}
              {breakEven && margin !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12, marginBottom: 18, background: margin >= 0 ? 'rgba(0,201,122,0.08)' : 'rgba(212,132,26,0.1)', border: `1px solid ${margin >= 0 ? 'rgba(0,201,122,0.22)' : 'rgba(212,132,26,0.28)'}` }}>
                  <span style={{ fontSize: 18 }}>{margin >= 0 ? '📈' : '📉'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: margin >= 0 ? '#00C97A' : '#D4841A' }}>
                      {margin >= 0 ? `+${margin}% over cost` : `${margin}% below cost`} · break-even ≈ ₹{breakEven.toLocaleString('en-IN')}/qtl
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Est. A2+FL cost (MSP ÷ 1.5, the govt formula) — today&apos;s avg ₹{avg.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              )}

              {/* Price Spectrum — the signature distribution viz */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Price spectrum · every mandi today</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Each dot is a mandi. Lines show the MSP floor and break-even cost.</div>
                <PriceSpectrum
                  dots={rows.map(r => ({ price: r.modalPrice, label: `${r.market}, ${r.state}` }))}
                  msp={msp}
                  breakEven={breakEven}
                  highlight={avg}
                  highlightLabel="Avg"
                />
              </div>

              {/* Price trend (history clock) */}
              {trend.length >= 2 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 8 }}>📈 Price trend ({trend.length}-day)</div>
                  <Sparkline series={trend.map(t => t.avg_modal)} />
                </div>
              )}
              {trend.length === 1 && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 18 }}>
                  📈 Trend builds daily — we started recording today. Check back tomorrow for movement.
                </div>
              )}

              {/* Price geography — states cheapest → dearest */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                  <MapPin size={15} style={{ color: '#00C97A' }} /> Where it&apos;s cheapest → dearest
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {states.slice(0, 10).map(s => (
                    <div key={s.state} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 120, fontSize: 12, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>{s.state}</span>
                      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(6, Math.round((s.avg / maxStateAvg) * 100))}%`, height: '100%', background: 'linear-gradient(90deg,#00C97A,#00A862)', borderRadius: 100 }} />
                      </div>
                      <span style={{ width: 64, textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'monospace', flexShrink: 0 }}>₹{s.avg.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variety breakdown */}
              {varieties.length > 1 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                    <TrendingUp size={15} style={{ color: '#00C97A' }} /> By variety
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {varieties.map(v => (
                      <div key={v.variety} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px' }}>
                        <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{v.variety}</div>
                        <div style={{ fontSize: 12, color: '#00C97A', fontWeight: 700 }}>₹{v.avg.toLocaleString('en-IN')} <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>· {v.count}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All mandis ranked */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                  <Store size={15} style={{ color: '#00C97A' }} /> Top mandis today
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {sorted.slice(0, 25).map((m, i) => (
                    <div key={m.market + i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ width: 20, fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.market}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{m.district ? `${m.district}, ` : ''}{m.state}</div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'monospace', flexShrink: 0 }}>₹{m.modalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crop intelligence */}
              {desc && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 6 }}>ABOUT {name.toUpperCase()}</div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.65)' }}>{desc}</p>
                </div>
              )}

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 10 }}>
                <a href={`/map?q=${encodeURIComponent(name)}`} style={{ flex: 1, textAlign: 'center', padding: '11px', borderRadius: 11, background: '#00C97A', color: '#00190E', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>See on map →</a>
              </div>

              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 14, lineHeight: 1.5 }}>
                Live modal prices from Agmarknet (data.gov.in), ₹ per quintal (100 kg), today&apos;s session.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
