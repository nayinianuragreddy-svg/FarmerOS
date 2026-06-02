'use client'

import { useState, useEffect, useCallback } from 'react'
import { getMSPFor, fetchMandiSnapshot, commodityEmoji, prettyCommodity, stateDistanceKm, FREIGHT_PER_QTL_KM } from '@/lib/mandi'

interface Market {
  market: string
  state: string
  modalPrice: number // ₹/quintal
  pricePerKg: number
}

interface ApiRecord {
  market: string
  state: string
  modalPrice: number
  pricePerKg: number
}

export default function SellAdvisor() {
  const [crops, setCrops] = useState<string[]>([])      // every live commodity, most-active first
  const [statesList, setStatesList] = useState<string[]>([])
  const [crop, setCrop] = useState('')
  const [scope, setScope] = useState('All India')        // 'All India' or a state
  const [origin, setOrigin] = useState('')               // farmer's state → net-after-transport mode
  const [markets, setMarkets] = useState<Market[]>([])
  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(true)

  // Populate the dropdowns from the real national snapshot
  useEffect(() => {
    fetchMandiSnapshot().then(s => {
      const names = (s.commodities || []).map(c => c.commodity)
      setCrops(names)
      setStatesList((s.states || []).map(x => x.state))
      if (names.length && !crop) setCrop(names[0])
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const load = useCallback(async (cropName: string, sc: string) => {
    if (!cropName) return
    setLoading(true)
    try {
      const st = sc === 'All India' ? 'all' : sc
      const res = await fetch(`/api/mandi-prices?commodity=${encodeURIComponent(cropName)}&state=${encodeURIComponent(st)}&limit=80`)
      const data = await res.json()
      const recs: ApiRecord[] = (data?.records ?? []).filter((r: ApiRecord) => r.modalPrice > 0)
      const byMarket = new Map<string, Market>()
      for (const r of recs) {
        const prev = byMarket.get(r.market + r.state)
        if (!prev || r.modalPrice > prev.modalPrice) {
          byMarket.set(r.market + r.state, { market: r.market, state: r.state, modalPrice: r.modalPrice, pricePerKg: r.pricePerKg })
        }
      }
      const ranked = Array.from(byMarket.values()).sort((a, b) => b.modalPrice - a.modalPrice)
      setMarkets(ranked.slice(0, 8))
      setLive(ranked.length > 0)
    } catch {
      setMarkets([]); setLive(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (crop) load(crop, scope) }, [crop, scope, load])

  // Net-realization: subtract estimated freight from the farmer's origin state
  const netMode = !!origin
  const enriched = markets.map(m => {
    const dist = origin ? stateDistanceKm(origin, m.state) : null
    const freight = dist != null ? Math.round(dist * FREIGHT_PER_QTL_KM) : 0
    return { ...m, dist, freight, net: m.modalPrice - freight }
  })
  const view = netMode ? [...enriched].sort((a, b) => b.net - a.net) : enriched
  const valOf = (m: typeof enriched[number]) => (netMode ? m.net : m.modalPrice)
  const best = view[0]
  const worst = view[view.length - 1]
  const gainPct = best && worst && valOf(worst) > 0 ? Math.round(((valOf(best) - valOf(worst)) / valOf(worst)) * 100) : 0
  const gainRs = best && worst ? valOf(best) - valOf(worst) : 0
  const maxPrice = best ? Math.max(1, valOf(best)) : 1
  const label = crop ? prettyCommodity(crop) : ''

  const selectStyle: React.CSSProperties = {
    appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
    background: 'rgba(255,255,255,0.05) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2300C97A\' stroke-width=\'3\'><path d=\'M6 9l6 6 6-6\'/></svg>") no-repeat right 14px center',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, height: 48, color: 'white',
    fontSize: 14, fontWeight: 600, padding: '0 36px 0 14px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
  }

  return (
    <div style={{ padding: '0 48px 32px' }}>
      <div style={{ background: 'linear-gradient(135deg, rgba(0,201,122,0.07) 0%, rgba(255,255,255,0.03) 50%)', border: '1px solid rgba(0,201,122,0.18)', borderRadius: 20, padding: '26px 28px', animation: 'fadeUp 0.4s ease both' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: '#00C97A', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>🧭 SELL SMART</div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>Where should I sell today?</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
              Pick any of {crops.length || '200+'} crops — we rank every mandi {scope === 'All India' ? 'across India' : `in ${scope}`} by today&apos;s price.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: live ? 'rgba(0,201,122,0.1)' : 'rgba(255,255,255,0.06)', border: `1px solid ${live ? 'rgba(0,201,122,0.25)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 100, padding: '5px 12px', flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: live ? '#00C97A' : 'rgba(255,255,255,0.4)', animation: live ? 'pulse 2s infinite' : 'none' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: live ? '#00C97A' : 'rgba(255,255,255,0.5)' }}>{live ? 'LIVE · Agmarknet' : 'Agmarknet'}</span>
          </div>
        </div>

        {/* Controls — full live lists */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
          <select value={crop} onChange={e => setCrop(e.target.value)} style={{ ...selectStyle, minWidth: 200, maxWidth: 280 }}>
            {crops.map(c => (
              <option key={c} value={c} style={{ background: '#0D1410' }}>{commodityEmoji(c)}  {prettyCommodity(c)}</option>
            ))}
          </select>
          <select value={scope} onChange={e => setScope(e.target.value)} style={{ ...selectStyle, minWidth: 170 }}>
            <option value="All India" style={{ background: '#0D1410' }}>📍 All India</option>
            {statesList.map(s => <option key={s} value={s} style={{ background: '#0D1410' }}>{s}</option>)}
          </select>
          <select value={origin} onChange={e => setOrigin(e.target.value)} style={{ ...selectStyle, minWidth: 180 }} title="Your state — to net out transport cost">
            <option value="" style={{ background: '#0D1410' }}>🚚 Selling from… (gross)</option>
            {statesList.map(s => <option key={s} value={s} style={{ background: '#0D1410' }}>From {s} (net)</option>)}
          </select>
        </div>
        {netMode && (
          <div style={{ fontSize: 12, color: '#00C97A', marginTop: -10, marginBottom: 18 }}>
            🚚 Net-of-transport: ranking by what you <b>actually pocket</b> from <b>{origin}</b> after est. freight (~₹5/tonne/km).
          </div>
        )}

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Finding best prices…</div>
        ) : best ? (
          <div className="advisor-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) 1fr', gap: 24, alignItems: 'start' }}>
            {/* Recommendation */}
            <div style={{ background: 'rgba(0,201,122,0.1)', border: '1px solid rgba(0,201,122,0.28)', borderRadius: 16, padding: '20px' }}>
              <div style={{ fontSize: 11, color: '#00C97A', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 10 }}>✅ BEST PLACE TO SELL</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{best.market}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{best.state}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 16 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#00C97A', letterSpacing: '-0.03em', lineHeight: 1 }}>₹{valOf(best).toLocaleString('en-IN')}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>/quintal {netMode ? 'net' : ''}</span>
              </div>
              {netMode ? (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 6, lineHeight: 1.5 }}>
                  ₹{best.modalPrice.toLocaleString('en-IN')} price − ₹{best.freight.toLocaleString('en-IN')} transport{best.dist != null ? ` (~${best.dist} km)` : ''}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>₹{best.pricePerKg}/kg</div>
              )}
              {gainPct > 0 && (
                <div style={{ marginTop: 16, padding: '10px 12px', background: 'rgba(0,201,122,0.12)', borderRadius: 10 }}>
                  <div style={{ fontSize: 13, color: '#00C97A', fontWeight: 700 }}>▲ {gainPct}% more than the lowest mandi</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Earn <b style={{ color: 'white' }}>₹{gainRs.toLocaleString('en-IN')}</b> more per quintal by selling here</div>
                </div>
              )}
              {(() => {
                const msp = getMSPFor(crop)
                if (!msp) return null
                const above = best.modalPrice >= msp
                return (
                  <div style={{ marginTop: 10, padding: '9px 12px', background: above ? 'rgba(0,201,122,0.1)' : 'rgba(212,132,26,0.12)', border: `1px solid ${above ? 'rgba(0,201,122,0.25)' : 'rgba(212,132,26,0.3)'}`, borderRadius: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: above ? '#00C97A' : '#D4841A' }}>{above ? '✓ Above MSP' : '⚠ Below MSP'} · floor ₹{msp.toLocaleString('en-IN')}/qtl</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Govt minimum support price, 2025-26</div>
                  </div>
                )
              })()}
              <a href={`/map?q=${encodeURIComponent(label)}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                See {label} listings on the map →
              </a>
            </div>

            {/* Ranked list */}
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
                {commodityEmoji(crop)} {label} · {view.length} mandis {scope === 'All India' ? 'across India' : `in ${scope}`}{netMode ? ' · ranked by net price' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {view.map((m, i) => {
                  const isBest = i === 0
                  const w = Math.max(8, Math.round((valOf(m) / maxPrice) * 100))
                  return (
                    <div key={m.market + i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 18, fontSize: 12, fontWeight: 700, color: isBest ? '#00C97A' : 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: isBest ? 'white' : 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.market}{scope === 'All India' || netMode ? <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}> · {m.state}</span> : ''}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: isBest ? '#00C97A' : 'rgba(255,255,255,0.6)', fontFamily: 'monospace', flexShrink: 0, marginLeft: 10 }}>
                            ₹{valOf(m).toLocaleString('en-IN')}{netMode && m.freight > 0 ? <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}> (−₹{m.freight})</span> : ''}
                          </span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 100, overflow: 'hidden' }}>
                          <div style={{ width: `${w}%`, height: '100%', background: isBest ? 'linear-gradient(90deg, #00C97A, #00A862)' : 'rgba(255,255,255,0.18)', borderRadius: 100, transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 14, lineHeight: 1.5 }}>
                Live modal prices from Agmarknet (data.gov.in), today&apos;s session. Prices in ₹ per quintal (100 kg).{netMode ? ' Transport is an estimate from state centroids (~₹5/tonne/km).' : ''}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
            No live mandi data for {label}{scope !== 'All India' ? ` in ${scope}` : ''} today. Try another crop or all-India.
          </div>
        )}
      </div>
    </div>
  )
}
