import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

// Full-day national snapshot of live Agmarknet mandi prices.
// Raw rows (~10k/day) are memoized once; each request re-aggregates from that memo,
// optionally filtered by ?state= — so switching place is instant and 100% real data.

const RESOURCE = '9ef84268-d588-465a-a308-a864a43d0070'
const PAGE = 5000
const MAX_PAGES = 3
const TTL_MS = 60 * 60 * 1000

interface RawRow {
  commodity?: string
  state?: string
  district?: string
  market?: string
  variety?: string
  grade?: string
  modal_price?: number | string
  min_price?: number | string
  max_price?: number | string
  arrival_date?: string
}

export interface CommoditySnapshot {
  commodity: string
  count: number          // # of mandis reporting
  avgModal: number       // ₹/quintal national/scoped average
  avgPerKg: number
  minModal: number       // cheapest mandi
  maxModal: number       // priciest mandi
  bestMarket: string     // mandi paying the most
  bestState: string
  bestModal: number
  worstMarket: string    // cheapest mandi
  worstState: string
}

let rawMemo: { at: number; rows: RawRow[]; date: string } | null = null

// ── History clock: record today's national prices once per day ───────────────
let lastStoredDate = ''
async function recordHistory(date: string, commodities: CommoditySnapshot[]) {
  if (!date || !commodities.length || lastStoredDate === date) return
  lastStoredDate = date
  try {
    const supabase = createAdminClient()
    const rows = commodities.map(c => ({
      date,
      commodity: c.commodity,
      avg_modal: Math.round(c.avgModal),
      min_modal: Math.round(c.minModal),
      max_modal: Math.round(c.maxModal),
      mandi_count: c.count,
    }))
    const { error } = await supabase.from('mandi_history').upsert(rows, { onConflict: 'date,commodity', ignoreDuplicates: true })
    if (error) { console.error('[history] upsert error:', error.message); lastStoredDate = '' }
    else console.log(`[history] recorded ${rows.length} commodities for ${date}`)
  } catch (e) {
    console.error('[history] threw:', (e as Error).message)
    lastStoredDate = '' // allow retry on next call
  }
}

async function getRaw(apiKey: string): Promise<{ rows: RawRow[]; date: string }> {
  if (rawMemo && Date.now() - rawMemo.at < TTL_MS) return rawMemo
  const all: RawRow[] = []
  let date = ''
  for (let p = 0; p < MAX_PAGES; p++) {
    const url = new URL(`https://api.data.gov.in/resource/${RESOURCE}`)
    url.searchParams.set('api-key', apiKey)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', String(PAGE))
    url.searchParams.set('offset', String(p * PAGE))
    const res = await fetch(url.toString(), { headers: { Accept: 'application/json' }, cache: 'no-store' })
    if (!res.ok) break
    const data = await res.json()
    const rows: RawRow[] = data?.records ?? []
    if (!rows.length) break
    if (!date && rows[0]?.arrival_date) date = rows[0].arrival_date
    all.push(...rows)
    if (rows.length < PAGE) break
  }
  rawMemo = { at: Date.now(), rows: all, date }
  return rawMemo
}

export async function GET(request: NextRequest) {
  const stateFilter = request.nextUrl.searchParams.get('state')
  const apiKey =
    process.env.AGMARKNET_KEY ||
    process.env.NEXT_PUBLIC_AGMARKNET_KEY ||
    '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b'

  try {
    const { rows, date } = await getRaw(apiKey)
    if (!rows.length) return NextResponse.json({ ok: false, date: '', commodities: [], states: [] })

    // States facet + national totals (always from the full set)
    const stateCounts = new Map<string, number>()
    const mandiSet = new Set<string>()
    const commoditySet = new Set<string>()
    for (const r of rows) {
      const s = (r.state ?? '').trim()
      if (s) stateCounts.set(s, (stateCounts.get(s) ?? 0) + 1)
      const m = (r.market ?? '').trim()
      if (m) mandiSet.add(m + '|' + s)
      const c = (r.commodity ?? '').trim()
      if (c) commoditySet.add(c)
    }
    const states = Array.from(stateCounts.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => a.state.localeCompare(b.state))
    const mandiCount = mandiSet.size
    const commodityCount = commoditySet.size

    // Scope rows by state if requested
    const useState = stateFilter && stateFilter !== 'all' && stateFilter !== 'India'
    const scoped = useState ? rows.filter(r => (r.state ?? '').trim() === stateFilter) : rows

    // Aggregate per commodity (tracks both dearest and cheapest mandi)
    const agg = new Map<string, { sum: number; n: number; min: number; max: number; bestModal: number; bestMarket: string; bestState: string; worstMarket: string; worstState: string }>()
    for (const r of scoped) {
      const name = (r.commodity ?? '').trim()
      const modal = Number(r.modal_price) || 0
      if (!name || modal <= 0) continue
      const cur = agg.get(name)
      if (!cur) {
        agg.set(name, { sum: modal, n: 1, min: modal, max: modal, bestModal: modal, bestMarket: r.market ?? '', bestState: r.state ?? '', worstMarket: r.market ?? '', worstState: r.state ?? '' })
      } else {
        cur.sum += modal; cur.n += 1
        if (modal < cur.min) { cur.min = modal; cur.worstMarket = r.market ?? ''; cur.worstState = r.state ?? '' }
        if (modal > cur.max) { cur.max = modal; cur.bestModal = modal; cur.bestMarket = r.market ?? ''; cur.bestState = r.state ?? '' }
      }
    }

    const commodities: CommoditySnapshot[] = Array.from(agg.entries())
      .map(([commodity, v]) => {
        const avgModal = Math.round(v.sum / v.n)
        return {
          commodity, count: v.n, avgModal, avgPerKg: +(avgModal / 100).toFixed(2),
          minModal: v.min, maxModal: v.max,
          bestMarket: v.bestMarket, bestState: v.bestState, bestModal: v.bestModal,
          worstMarket: v.worstMarket, worstState: v.worstState,
        }
      })
      .sort((a, b) => b.count - a.count)

    // Record the national daily snapshot (history clock) — await so it persists
    if (!useState) await recordHistory(date, commodities)

    return NextResponse.json({
      ok: true,
      date,
      scope: useState ? stateFilter : 'India',
      total: scoped.length,
      totalAll: rows.length,
      mandiCount,        // distinct mandis nationally
      commodityCount,    // distinct commodities nationally
      states,
      commodities,
    })
  } catch {
    return NextResponse.json({ ok: false, date: '', commodities: [], states: [] })
  }
}
