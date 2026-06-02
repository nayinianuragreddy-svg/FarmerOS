'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import AppNav from '@/components/ui/AppNav'
import SearchField from '@/components/ui/SearchField'
import SellAdvisor from '@/components/data/SellAdvisor'
import CommodityDetail from '@/components/data/CommodityDetail'
import { fetchMandiSnapshot, CommoditySnapshot, StateFacet, commodityEmoji, prettyCommodity, getMSPFor, commodityCategory, CATEGORIES } from '@/lib/mandi'
import { MOCK_PINS } from '@/lib/mock-data'

// Compact map preview — just the map (no nav / pills), unlike the full /map page.
const FarmerOSMap = dynamic(() => import('@/components/map/FarmerOSMap'), { ssr: false })

// ─── Types ───────────────────────────────────────────────────────────────────

interface WeatherForecastDay {
  day: string
  icon: string
  temp_max: number
  precipitation: number
}

interface WeatherResult {
  city: string
  temp: number
  humidity: number
  windSpeed: number
  icon: string
  forecast: WeatherForecastDay[]
  soilMoisture: number | null   // m³/m³ at 0–1cm
  soilTemp: number | null        // °C at 6cm
  rainProb3d: number | null      // max precip probability next 3 days (%)
  advisory: { tone: 'rain' | 'dry' | 'ok'; text: string } | null
}

interface MandiResult {
  name: string
  distance?: number
}

interface SunData {
  sunrise: string
  sunset: string
  solarNoon: string
  dayLength: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

const MONTHS = [
  { month: 'Jan', season: 'Rabi Harvest',   emoji: '🌾', crops: ['Wheat', 'Mustard']         },
  { month: 'Feb', season: 'Rabi Peak',      emoji: '🌾', crops: ['Wheat harvest peak']        },
  { month: 'Mar', season: 'Zaid Sowing',    emoji: '🌱', crops: ['Watermelon', 'Cucumber']    },
  { month: 'Apr', season: 'Mango Season',   emoji: '🥭', crops: ['Alphonso', 'Banganapalli']  },
  { month: 'May', season: 'Kharif Prep',    emoji: '🌧️', crops: ['Pre-monsoon prep']          },
  { month: 'Jun', season: 'Kharif Sowing',  emoji: '🌧️', crops: ['Rice', 'Cotton', 'Soybean']},
  { month: 'Jul', season: 'Kharif Growing', emoji: '🌱', crops: ['Rice', 'Maize', 'Cotton']   },
  { month: 'Aug', season: 'Monsoon Crops',  emoji: '🌱', crops: ['Vegetables', 'Gourds']      },
  { month: 'Sep', season: 'Kharif Harvest', emoji: '🌾', crops: ['Maize', 'Soybean']          },
  { month: 'Oct', season: 'Major Harvest',  emoji: '🌾', crops: ['Rice', 'Cotton']            },
  { month: 'Nov', season: 'Rabi Sowing',    emoji: '🌱', crops: ['Wheat', 'Mustard', 'Chickpea']},
  { month: 'Dec', season: 'Rabi Growing',   emoji: '❄️', crops: ['Wheat', 'Barley']           },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function wmoToIcon(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '🌤️'
  if (code === 45 || code === 48) return '🌫️'
  if (code >= 51 && code <= 57) return '🌦️'
  if (code >= 61 && code <= 67) return '🌧️'
  if (code >= 80 && code <= 82) return '🌦️'
  if (code >= 95 && code <= 99) return '⛈️'
  return '🌡️'
}

function calcDayLength(sunrise: string, sunset: string): string {
  try {
    const parse = (t: string) => {
      const [time, period] = t.split(' ')
      const [h, m] = time.split(':').map(Number)
      const hours = period === 'PM' && h !== 12 ? h + 12 : period === 'AM' && h === 12 ? 0 : h
      return hours * 60 + m
    }
    const diff = parse(sunset) - parse(sunrise)
    const h = Math.floor(diff / 60)
    const m = diff % 60
    return `${h}h ${m}m`
  } catch {
    return '—'
  }
}


function Spinner() {
  return (
    <div style={{
      width: 18, height: 18,
      border: '2px solid rgba(255,255,255,0.1)',
      borderTopColor: '#00C97A',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      display: 'inline-block',
    }} />
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DataPage() {
  // Mandi prices state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'price' | 'mandis' | 'msp' | 'name'>('mandis')
  const [selectedState, setSelectedState] = useState('India')
  const [category, setCategory] = useState<string>('All')
  const [compare, setCompare] = useState<string[]>([])

  // Live mandi snapshot (real Agmarknet data — national or state-scoped)
  const [snapshot, setSnapshot] = useState<CommoditySnapshot[]>([])
  const [statesFacet, setStatesFacet] = useState<StateFacet[]>([])
  const [snapshotDate, setSnapshotDate] = useState('')
  const [snapshotLoading, setSnapshotLoading] = useState(true)
  const [natMandis, setNatMandis] = useState(0)        // distinct mandis nationally
  const [natCommodities, setNatCommodities] = useState(0)

  // Weather state
  const [locationQuery, setLocationQuery] = useState('')
  const [weatherData, setWeatherData] = useState<WeatherResult | null>(null)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const [weatherError, setWeatherError] = useState('')

  // Mandis state
  const [mandiQuery, setMandiQuery] = useState('')
  const [mandiResults, setMandiResults] = useState<MandiResult[]>([])
  const [isLoadingMandis, setIsLoadingMandis] = useState(false)
  const [mandiError, setMandiError] = useState('')

  // Sun state
  const [sunData, setSunData] = useState<SunData | null>(null)

  // Derived crops — from the live snapshot, filtered by search + category, sorted
  const mspGap = (c: CommoditySnapshot) => { const m = getMSPFor(c.commodity); return m ? (c.avgModal - m) / m : -Infinity }
  const filteredCrops = snapshot
    .filter(c => c.commodity.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(c => category === 'All' || commodityCategory(c.commodity) === category)
    .sort((a, b) => {
      if (sortBy === 'price') return b.avgPerKg - a.avgPerKg
      if (sortBy === 'mandis') return b.count - a.count
      if (sortBy === 'msp') return mspGap(b) - mspGap(a)
      return a.commodity.localeCompare(b.commodity)
    })

  const toggleCompare = (name: string) =>
    setCompare(prev => prev.includes(name) ? prev.filter(n => n !== name) : prev.length >= 4 ? prev : [...prev, name])
  const compareItems = compare.map(n => snapshot.find(c => c.commodity === n)).filter((c): c is CommoditySnapshot => !!c)

  // Category facet counts (within current state scope)
  const categoryCounts = snapshot.reduce<Record<string, number>>((acc, c) => {
    const cat = commodityCategory(c.commodity); acc[cat] = (acc[cat] ?? 0) + 1; return acc
  }, {})

  // Live overview metrics (all derived from the real snapshot)
  const mspTracked = snapshot.filter(c => getMSPFor(c.commodity) !== null)
  const aboveMspCount = mspTracked.filter(c => { const m = getMSPFor(c.commodity); return m !== null && c.avgModal >= m }).length
  const widestSpread = snapshot.reduce<CommoditySnapshot | null>(
    (best, c) => (!best || (c.maxModal - c.minModal) > (best.maxModal - best.minModal) ? c : best), null,
  )

  // Daily Mandi Report — an auto-written briefing from today's live data
  const mostActive = snapshot[0] || null   // snapshot arrives sorted by mandi count desc
  const highestValue = snapshot.reduce<CommoditySnapshot | null>((b, c) => (!b || c.avgModal > b.avgModal ? c : b), null)
  const spreadMult = widestSpread ? (widestSpread.maxModal / Math.max(1, widestSpread.minModal)) : 0
  const reportLines = [
    mostActive && `📊 ${prettyCommodity(mostActive.commodity)} led trading — reported in ${mostActive.count} mandis at ~₹${mostActive.avgModal.toLocaleString('en-IN')}/qtl.`,
    widestSpread && spreadMult >= 2 && `↔️ Biggest gap: ${prettyCommodity(widestSpread.commodity)} ranges ₹${widestSpread.minModal.toLocaleString('en-IN')}–₹${widestSpread.maxModal.toLocaleString('en-IN')} (${spreadMult.toFixed(1)}×) — big arbitrage between mandis.`,
    highestValue && `💰 Priciest crop today: ${prettyCommodity(highestValue.commodity)} at ~₹${highestValue.avgModal.toLocaleString('en-IN')}/qtl.`,
    mspTracked.length > 0 && `🏛️ ${aboveMspCount} of ${mspTracked.length} MSP-mandated crops are trading above their support floor.`,
  ].filter(Boolean) as string[]
  const reportText = `🌾 FarmerOS Mandi Report · ${snapshotDate || 'today'}\n${natCommodities} crops · ${natMandis} mandis · ${statesFacet.length} states\n\n${reportLines.join('\n')}\n\nLive at farmeros — India's open agri-data terminal.`

  // Commodity drill-down panel
  const [detailCommodity, setDetailCommodity] = useState<string | null>(null)

  // Ask-anything — natural query resolved deterministically against the live snapshot
  const [ask, setAsk] = useState('')
  const askResult = useMemo(() => {
    const q = ask.trim().toLowerCase()
    if (!q || !snapshot.length) return null
    let match: CommoditySnapshot | null = null, matchLen = 0
    for (const c of snapshot) {
      for (const w of prettyCommodity(c.commodity).toLowerCase().split(/[\s/()-]+/)) {
        if (w.length >= 3 && q.includes(w) && w.length > matchLen) { match = c; matchLen = w.length }
      }
    }
    const stateHit = statesFacet.find(s => q.includes(s.state.toLowerCase()))?.state || null
    const intent: 'cheap' | 'dear' | 'msp' | 'default' =
      /cheap|lowest|\blow\b/.test(q) ? 'cheap' :
      /dear|highest|expensive|priciest/.test(q) ? 'dear' :
      /msp|support|floor|profit|cost/.test(q) ? 'msp' : 'default'
    return { match, stateHit, intent }
  }, [ask, snapshot, statesFacet])

  // Fetch sunrise/sunset for New Delhi on mount
  useEffect(() => {
    fetch('https://api.sunrisesunset.io/json?lat=28.6139&lng=77.2090&timezone=Asia/Kolkata')
      .then(r => r.json())
      .then(d => {
        const res = d?.results
        if (res) {
          setSunData({
            sunrise: res.sunrise,
            sunset: res.sunset,
            solarNoon: res.solar_noon,
            dayLength: calcDayLength(res.sunrise, res.sunset),
          })
        }
      })
      .catch(() => {})
  }, [])

  // Fetch the live mandi snapshot — refetches instantly when the place changes
  useEffect(() => {
    setSnapshotLoading(true)
    fetchMandiSnapshot(selectedState).then(s => {
      setSnapshot(s.commodities || [])
      setSnapshotDate(s.date || '')
      if (s.states?.length) setStatesFacet(s.states)
      if (s.mandiCount) setNatMandis(s.mandiCount)
      if (s.commodityCount) setNatCommodities(s.commodityCount)
      setSnapshotLoading(false)
    })
  }, [selectedState])

  // Weather search
  const handleWeatherSearch = useCallback(async () => {
    const query = locationQuery.trim()
    if (!query) return
    setIsLoadingWeather(true)
    setWeatherError('')
    setWeatherData(null)
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' India')}&format=json&limit=1&countrycodes=in`,
        { headers: { 'User-Agent': 'FarmerOS/1.0', 'Accept-Language': 'en' } }
      )
      const geoData = await geoRes.json()
      if (!geoData || geoData.length === 0) {
        setWeatherError('Location not found. Try a nearby city.')
        setIsLoadingWeather(false)
        return
      }
      const lat = parseFloat(geoData[0].lat)
      const lng = parseFloat(geoData[0].lon)
      const cityParts: string[] = (geoData[0].display_name || query).split(',')
      const city = cityParts.slice(0, 2).join(',').trim()

      const wxRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode` +
        `&hourly=soil_moisture_0_to_1cm,soil_temperature_6cm` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode` +
        `&timezone=Asia%2FKolkata&forecast_days=7`
      )
      const wxData = await wxRes.json()
      const current = wxData.current
      const daily = wxData.daily
      const hourly = wxData.hourly
      const forecast: WeatherForecastDay[] = (daily.time as string[]).map((t: string, i: number) => ({
        day: i === 0 ? 'Today' : new Date(t).toLocaleDateString('en-IN', { weekday: 'short' }),
        icon: wmoToIcon(daily.weathercode[i] ?? 0),
        temp_max: Math.round(daily.temperature_2m_max[i] ?? 0),
        precipitation: daily.precipitation_sum[i] ?? 0,
      }))

      // Soil — pick the value at the current hour
      let soilMoisture: number | null = null
      let soilTemp: number | null = null
      if (hourly?.time?.length) {
        let idx = hourly.time.indexOf(current?.time)
        if (idx < 0) idx = 0
        soilMoisture = hourly.soil_moisture_0_to_1cm?.[idx] ?? null
        soilTemp = hourly.soil_temperature_6cm?.[idx] != null ? Math.round(hourly.soil_temperature_6cm[idx]) : null
      }
      const probs: number[] = (daily.precipitation_probability_max ?? []).slice(0, 3)
      const rainProb3d = probs.length ? Math.max(...probs) : null

      // Agro-advisory (real, from soil + rain outlook)
      let advisory: WeatherResult['advisory'] = null
      if (rainProb3d !== null && rainProb3d >= 60) {
        advisory = { tone: 'rain', text: `Rain likely (${rainProb3d}% in 3 days) — hold irrigation and protect any harvested produce.` }
      } else if (soilMoisture !== null && soilMoisture < 0.15) {
        advisory = { tone: 'dry', text: `Topsoil is dry${rainProb3d !== null ? ` and little rain expected (${rainProb3d}%)` : ''} — consider irrigating soon.` }
      } else if (soilMoisture !== null) {
        advisory = { tone: 'ok', text: 'Soil moisture looks adequate — no urgent irrigation needed.' }
      }

      setWeatherData({
        city,
        temp: Math.round(current.temperature_2m ?? 0),
        humidity: current.relative_humidity_2m ?? 0,
        windSpeed: Math.round(current.wind_speed_10m ?? 0),
        icon: wmoToIcon(current.weathercode ?? 0),
        forecast,
        soilMoisture,
        soilTemp,
        rainProb3d,
        advisory,
      })

      // One location drives the whole Conditions section — sun + nearby mandis follow
      setMandiQuery(city)
      fetch(`https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&timezone=Asia/Kolkata`)
        .then(r => r.json())
        .then(d => { const res = d?.results; if (res) setSunData({ sunrise: res.sunrise, sunset: res.sunset, solarNoon: res.solar_noon, dayLength: calcDayLength(res.sunrise, res.sunset) }) })
        .catch(() => {})
      fetch(`/api/nearby-mandis?lat=${lat}&lng=${lng}&radius=100`)
        .then(r => (r.ok ? r.json() : null))
        .then(d => { if (d) setMandiResults((d.mandis || []).slice(0, 6)) })
        .catch(() => {})
    } catch {
      setWeatherError('Unable to fetch weather. Please try again.')
    }
    setIsLoadingWeather(false)
  }, [locationQuery])

  // Nearest mandis search
  const handleMandiSearch = useCallback(async () => {
    const query = mandiQuery.trim()
    if (!query) return
    setIsLoadingMandis(true)
    setMandiError('')
    setMandiResults([])
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' India')}&format=json&limit=1&countrycodes=in`,
        { headers: { 'User-Agent': 'FarmerOS/1.0', 'Accept-Language': 'en' } }
      )
      const geoData = await geoRes.json()
      if (!geoData || geoData.length === 0) {
        setMandiError('Location not found.')
        setIsLoadingMandis(false)
        return
      }
      const lat = parseFloat(geoData[0].lat)
      const lng = parseFloat(geoData[0].lon)
      const res = await fetch(`/api/nearby-mandis?lat=${lat}&lng=${lng}&radius=100`)
      if (res.ok) {
        const data = await res.json()
        setMandiResults((data.mandis || []).slice(0, 5))
      } else {
        setMandiError('No mandis found nearby.')
      }
    } catch {
      setMandiError('Unable to fetch nearby mandis.')
    }
    setIsLoadingMandis(false)
  }, [mandiQuery])

  const currentMonthIdx = new Date().getMonth() // 0-based

  const glassStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '10px 16px',
    color: 'white',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    fontFamily: 'Inter, -apple-system, sans-serif',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#070C0A',
      color: 'white',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'relative',
    }}>

      {/* Animations */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .skel { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 37%, rgba(255,255,255,0.04) 63%); background-size:800px 100%; animation: shimmer 1.4s infinite linear; border-radius:6px; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .data-row:hover { background: rgba(255,255,255,0.02) !important; }
        .sort-btn { cursor:pointer; transition:all 0.15s; }
        .sort-btn:hover { background: rgba(0,201,122,0.08) !important; }
        .month-scroll::-webkit-scrollbar { display:none; }
        .month-scroll { -ms-overflow-style:none; scrollbar-width:none; }
        .data-subnav::-webkit-scrollbar { display:none; }
        .data-subnav { -ms-overflow-style:none; scrollbar-width:none; }
        @media (max-width: 1000px) { .conditions-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 760px) { .advisor-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 720px) {
          .conditions-grid { grid-template-columns: 1fr !important; }
          #overview, #prices, #conditions, #calendar, #sources, .data-subnav { padding-left: 20px !important; padding-right: 20px !important; }
        }
        .price-scroll { overflow-x: auto; }
      `}</style>

      {/* Unified navbar — search filters the live price table */}
      <AppNav
        variant="solid"
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={setSearchQuery}
        searchPlaceholder="Search any crop — tomato, wheat…"
      />

      {/* Sticky section nav — orientation: every section, one click away */}
      <nav style={{ position: 'sticky', top: 64, zIndex: 50, background: 'rgba(7,12,10,0.82)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 48px' }}>
        <div className="data-subnav" style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'prices', label: 'Prices' },
            { id: 'sell-smart', label: 'Sell Smart' },
            { id: 'conditions', label: 'Weather & Soil' },
            { id: 'calendar', label: 'In Season' },
            { id: 'sources', label: 'Sources' },
          ].map(s => (
            <a key={s.id} href={`#${s.id}`} style={{ padding: '13px 14px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', whiteSpace: 'nowrap', borderBottom: '2px solid transparent' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — HEADER / OVERVIEW
      ═══════════════════════════════════════════════════════════════ */}
      <div id="overview" style={{
        padding: '36px 48px 24px',
        scrollMarginTop: 116,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 24,
      }}>
        {/* Left */}
        <div>
          <h1 style={{
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'white',
            lineHeight: 1.1,
          }}>
            India&apos;s Agricultural Data
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 16,
            marginTop: 6,
          }}>
            Live government data. Free. No login required.
          </p>
        </div>

        {/* Right — LIVE overview metrics, all from the real snapshot */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'stretch' }}>
          {[
            { label: 'Commodities', value: natCommodities ? String(natCommodities) : '—' },
            { label: 'Mandis reporting', value: natMandis ? natMandis.toLocaleString('en-IN') : '—' },
            { label: 'States/UTs', value: statesFacet.length ? String(statesFacet.length) : '—' },
            { label: 'Above MSP', value: mspTracked.length ? `${aboveMspCount}/${mspTracked.length}` : '—', accent: true },
            { label: 'Widest spread', value: widestSpread ? prettyCommodity(widestSpread.commodity) : '—', small: true },
          ].map(m => (
            <div key={m.label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${m.accent ? 'rgba(0,201,122,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '10px 14px', minWidth: 92 }}>
              <div style={{ fontSize: m.small ? 14 : 20, fontWeight: 800, color: m.accent ? '#00C97A' : '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{m.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{m.label}</div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: snapshotLoading ? '#D4841A' : '#00C97A', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{snapshotLoading ? 'Syncing…' : snapshotDate || 'Agmarknet'}</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ASK ANYTHING — natural query over the live data
      ═══════════════════════════════════════════════════════════════ */}
      <div style={{ padding: '0 48px 8px' }}>
        <div style={{ maxWidth: 720 }}>
          <SearchField value={ask} onChange={setAsk} allowLocation={false}
            placeholder="Ask anything — “tomato price”, “cheapest onion”, “wheat vs MSP”…" size="lg" />
        </div>
        {ask.trim() && askResult && (
          <div style={{ marginTop: 12, maxWidth: 720, background: 'rgba(0,201,122,0.06)', border: '1px solid rgba(0,201,122,0.2)', borderRadius: 16, padding: '18px 20px', animation: 'fadeUp 0.3s ease both' }}>
            {askResult.match ? (() => {
              const c = askResult.match
              const msp = getMSPFor(c.commodity)
              const lines = [
                { k: 'cheap', t: `🪙 Cheapest: ${c.worstMarket}, ${c.worstState}`, v: `₹${c.minModal.toLocaleString('en-IN')}` },
                { k: 'dear', t: `💰 Dearest: ${c.bestMarket}, ${c.bestState}`, v: `₹${c.bestModal.toLocaleString('en-IN')}` },
                { k: 'msp', t: msp ? (c.avgModal >= msp ? '✓ Trading above MSP' : '⚠ Below MSP') : 'No MSP for this crop', v: msp ? `floor ₹${msp.toLocaleString('en-IN')}` : '' },
              ]
              const ordered = askResult.intent === 'default' ? lines : [...lines].sort(a => a.k === askResult.intent ? -1 : 1)
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 24 }}>{commodityEmoji(c.commodity)}</span>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{prettyCommodity(c.commodity)} · ₹{c.avgModal.toLocaleString('en-IN')}/qtl <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>avg (₹{c.avgPerKg}/kg)</span></div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{c.count} mandis reporting today{askResult.stateHit ? ` · for ${askResult.stateHit}, open the explorer below` : ''}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {ordered.map(l => (
                      <div key={l.k} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px', fontSize: 12.5, color: 'rgba(255,255,255,0.8)' }}>
                        {l.t} {l.v && <b style={{ color: '#00C97A' }}>{l.v}</b>}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => setDetailCommodity(c.commodity)} className="app-btn-primary" style={{ padding: '9px 16px', fontSize: 13 }}>Full breakdown →</button>
                    {askResult.stateHit && (
                      <button onClick={() => { setSelectedState(askResult.stateHit!); document.getElementById('prices')?.scrollIntoView({ behavior: 'smooth' }) }} className="app-btn-ghost" style={{ padding: '9px 16px', fontSize: 13 }}>See {askResult.stateHit} prices</button>
                    )}
                  </div>
                </>
              )
            })() : (
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>
                Couldn&apos;t find a crop matching “{ask.trim()}”. Try a crop name like <b style={{ color: '#fff' }}>tomato</b>, <b style={{ color: '#fff' }}>onion</b>, or <b style={{ color: '#fff' }}>wheat</b> — optionally with a state or “cheapest”.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — TODAY'S MARKET MOVER
      ═══════════════════════════════════════════════════════════════ */}
      <div style={{ padding: '0 48px 32px' }}>
        <div style={{ ...glassStyle, borderLeft: '4px solid #00C97A', padding: '20px 24px', animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: '#00C97A', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>📰 TODAY&apos;S MANDI REPORT</div>
              <div style={{ fontSize: 20, color: 'white', fontWeight: 800, letterSpacing: '-0.02em' }}>India&apos;s markets today {snapshotDate ? `· ${snapshotDate}` : ''}</div>
            </div>
            {reportLines.length > 0 && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigator.clipboard?.writeText(reportText)} className="app-btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>Copy</button>
                <a href={`https://wa.me/?text=${encodeURIComponent(reportText)}`} target="_blank" rel="noopener noreferrer" className="app-btn-primary" style={{ padding: '8px 14px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>Share 🟢</a>
              </div>
            )}
          </div>
          {reportLines.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {reportLines.map((l, i) => (
                <div key={i} style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.45 }}>{l}</div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{snapshotLoading ? 'Compiling today’s report…' : 'Awaiting today’s data.'}</div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2.5 — SELL ADVISOR (where should I sell today?)
      ═══════════════════════════════════════════════════════════════ */}
      <div id="sell-smart" style={{ scrollMarginTop: 116 }}>
        <SellAdvisor />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — PRICE EXPLORER (full-width centerpiece)
      ═══════════════════════════════════════════════════════════════ */}
      <div id="prices" style={{ padding: '0 48px', scrollMarginTop: 80 }}>

        {/* ─── Live Mandi Prices ─────────────────────────── */}
        <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 20, color: 'white', fontWeight: 800, letterSpacing: '-0.02em' }}>🟢 Mandi Price Explorer</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
                {snapshotLoading ? 'Loading…' : `${filteredCrops.length} commodities · ${selectedState === 'India' ? 'all India' : selectedState}${snapshotDate ? ` · ${snapshotDate}` : ''}`} · <span style={{ color: '#00C97A' }}>click any crop for the full breakdown</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Place selector */}
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                className="app-field"
                style={{ height: 38, width: 'auto', minWidth: 150, fontSize: 13, fontWeight: 600, borderRadius: 100, padding: '0 34px 0 14px' }}
              >
                <option value="India" style={{ background: '#0D1410' }}>📍 All India</option>
                {statesFacet.map(s => (
                  <option key={s.state} value={s.state} style={{ background: '#0D1410' }}>{s.state} ({s.count})</option>
                ))}
              </select>
              {(['mandis', 'price', 'msp', 'name'] as const).map(s => (
                <button
                  key={s}
                  className="sort-btn"
                  onClick={() => setSortBy(s)}
                  style={{
                    background: sortBy === s ? '#00C97A' : 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '6px 12px',
                    fontSize: 12, color: sortBy === s ? '#070C0A' : 'rgba(255,255,255,0.6)',
                    fontWeight: sortBy === s ? 700 : 400, cursor: 'pointer',
                  }}
                >
                  {s === 'price' ? 'Price' : s === 'mandis' ? 'Most active' : s === 'msp' ? 'vs MSP' : 'A–Z'}
                </button>
              ))}
            </div>
          </div>

          {/* Search — shared premium field, filters the table */}
          <div style={{ marginBottom: 12 }}>
            <SearchField value={searchQuery} onChange={setSearchQuery} allowLocation={false} placeholder={`Filter ${selectedState === 'India' ? '' : selectedState + ' '}crops — tomato, onion, wheat…`} />
          </div>

          {/* Category chips */}
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
            {(['All', ...CATEGORIES] as const).map(cat => {
              const n = cat === 'All' ? snapshot.length : (categoryCounts[cat] ?? 0)
              if (cat !== 'All' && n === 0) return null
              const active = category === cat
              return (
                <button key={cat} onClick={() => setCategory(cat)}
                  style={{ background: active ? 'rgba(0,201,122,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? 'rgba(0,201,122,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 100, padding: '5px 12px', fontSize: 12, color: active ? '#00C97A' : 'rgba(255,255,255,0.6)', fontWeight: active ? 700 : 500, cursor: 'pointer' }}>
                  {cat} <span style={{ opacity: 0.5 }}>{n}</span>
                </button>
              )
            })}
          </div>

          {/* Compare bar */}
          {compareItems.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14, padding: '12px 14px', background: 'rgba(0,201,122,0.06)', border: '1px solid rgba(0,201,122,0.2)', borderRadius: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#00C97A' }}>Comparing {compareItems.length}:</span>
              {compareItems.map(c => {
                const msp = getMSPFor(c.commodity)
                return (
                  <div key={c.commodity} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 9, padding: '6px 10px' }}>
                    <span style={{ fontSize: 14 }}>{commodityEmoji(c.commodity)}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{prettyCommodity(c.commodity)}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>₹{c.avgModal.toLocaleString('en-IN')}/qtl{msp ? ` · ${c.avgModal >= msp ? '✓ MSP' : '⚠ MSP'}` : ''}</div>
                    </div>
                    <button onClick={() => toggleCompare(c.commodity)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14 }}>×</button>
                  </div>
                )
              })}
              <button onClick={() => setCompare([])} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}>Clear</button>
            </div>
          )}

          {/* Price table */}
          <div style={{ ...glassStyle, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  {['', 'Crop', 'Avg Price', 'Mandis', 'vs MSP', 'Dearest mandi', 'Cheapest mandi', 'Range (₹/qtl)', ''].map((h, hi) => (
                    <th key={hi} title={
                      h === 'vs MSP' ? 'MSP = Minimum Support Price: the government-guaranteed floor price for the crop.' :
                      h === 'Range (₹/qtl)' ? 'Lowest to highest mandi price today. ₹ per quintal = ₹ per 100 kg.' :
                      h === 'Avg Price' ? 'Average modal (most-common) price across all reporting mandis, shown per kg.' :
                      h === 'Mandis' ? 'Number of mandis (APMC markets) that reported a price for this crop today.' : undefined
                    } style={{
                      textAlign: 'left',
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      fontWeight: 600,
                      cursor: ['vs MSP', 'Range (₹/qtl)', 'Avg Price', 'Mandis'].includes(h) ? 'help' : 'default',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCrops.map((crop, i) => (
                  <tr
                    key={crop.commodity}
                    className="data-row"
                    onClick={() => setDetailCommodity(crop.commodity)}
                    style={{
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                  >
                    <td style={{ padding: '11px 8px 11px 12px' }} onClick={e => { e.stopPropagation(); toggleCompare(crop.commodity) }}>
                      <input type="checkbox" checked={compare.includes(crop.commodity)} readOnly title="Compare" style={{ accentColor: '#00C97A', cursor: 'pointer', width: 14, height: 14 }} />
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontSize: 16, marginRight: 6 }}>{commodityEmoji(crop.commodity)}</span>
                      <span style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>{prettyCommodity(crop.commodity)}</span>
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 14, color: 'white', fontWeight: 700, fontFamily: 'monospace' }}>
                      ₹{crop.avgPerKg}<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>/kg</span>
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 13, color: '#00C97A', fontWeight: 600 }}>
                      {crop.count}
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 12 }}>
                      {(() => {
                        const msp = getMSPFor(crop.commodity)
                        if (!msp) return <span style={{ color: 'rgba(255,255,255,0.25)' }}>—</span>
                        const above = crop.avgModal >= msp
                        return <span style={{ color: above ? '#00C97A' : '#D4841A', fontWeight: 600 }}>{above ? '✓' : '⚠'} ₹{msp.toLocaleString('en-IN')}</span>
                      })()}
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                      {crop.bestMarket}, {crop.bestState} <span style={{ color: '#00C97A', fontFamily: 'monospace' }}>₹{crop.maxModal.toLocaleString('en-IN')}</span>
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                      {crop.worstMarket}, {crop.worstState} <span style={{ color: '#D4841A', fontFamily: 'monospace' }}>₹{crop.minModal.toLocaleString('en-IN')}</span>
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                      ₹{crop.minModal.toLocaleString('en-IN')}–{crop.maxModal.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>›</td>
                  </tr>
                ))}
                {!snapshotLoading && filteredCrops.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ padding: '24px 12px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                      {snapshot.length === 0 ? 'Live mandi data is loading or temporarily unavailable.' : `No crops found for "${searchQuery}"${selectedState !== 'India' ? ` in ${selectedState}` : ''}`}
                    </td>
                  </tr>
                )}
                {snapshotLoading && Array.from({ length: 8 }).map((_, i) => (
                  <tr key={`skel${i}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {[14, 90, 60, 40, 70, 120, 120, 90, 12].map((w, j) => (
                      <td key={j} style={{ padding: '13px 12px' }}><div className="skel" style={{ height: 12, width: w }} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3.5 — CONDITIONS (weather · soil · mandis · sun for your area)
      ═══════════════════════════════════════════════════════════════ */}
      <div id="conditions" style={{ padding: '44px 48px 0', scrollMarginTop: 80 }}>
        <div style={{ fontSize: 22, color: 'white', fontWeight: 700, marginBottom: 4 }}>🌦️ Conditions for your area</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Live weather, soil & nearby mandis — type any village, city or pincode.</div>
        <div className="conditions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

          {/* Panel A — Farm Weather */}
          <div style={{ ...glassStyle, padding: 20, animation: 'fadeUp 0.5s ease 0.15s both' }}>
            <div style={{ fontSize: 15, color: 'white', fontWeight: 600, marginBottom: 12 }}>🌦️ Farm Weather</div>

            {/* Input row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                value={locationQuery}
                onChange={e => setLocationQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleWeatherSearch()}
                placeholder="Village, city or pincode..."
                style={{ ...inputStyle, width: 'auto', flexGrow: 1 }}
              />
              <button
                onClick={handleWeatherSearch}
                style={{
                  background: '#00C97A',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: '#070C0A',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Search
              </button>
            </div>

            {isLoadingWeather && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                <Spinner />
              </div>
            )}

            {weatherError && !isLoadingWeather && (
              <div style={{ fontSize: 13, color: '#EF4444', padding: '8px 0' }}>{weatherError}</div>
            )}

            {!weatherData && !isLoadingWeather && !weatherError && (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                Enter your farm location to check weather and get harvest advisories
              </div>
            )}

            {weatherData && !isLoadingWeather && (
              <div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                  📍 {weatherData.city}
                </div>
                <div style={{ fontSize: 32, color: 'white', fontWeight: 700, lineHeight: 1.1 }}>
                  {weatherData.icon} {weatherData.temp}°C
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  <span>💧 {weatherData.humidity}%</span>
                  <span>🌬️ {weatherData.windSpeed} km/h</span>
                </div>

                {/* Soil + rain outlook — the part farmers actually need */}
                {(weatherData.soilMoisture !== null || weatherData.soilTemp !== null || weatherData.rainProb3d !== null) && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {weatherData.soilMoisture !== null && (
                      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>🌱 Soil moisture <b style={{ color: '#fff' }}>{Math.round(weatherData.soilMoisture * 100)}%</b></div>
                    )}
                    {weatherData.soilTemp !== null && (
                      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>🌡️ Soil temp <b style={{ color: '#fff' }}>{weatherData.soilTemp}°C</b></div>
                    )}
                    {weatherData.rainProb3d !== null && (
                      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>🌧️ Rain (3d) <b style={{ color: '#fff' }}>{weatherData.rainProb3d}%</b></div>
                    )}
                  </div>
                )}

                {/* 7-day forecast */}
                <div style={{ display: 'flex', gap: 4, marginTop: 12, flexWrap: 'wrap' }}>
                  {weatherData.forecast.map((day, i) => (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 6,
                      padding: '6px 4px',
                      textAlign: 'center',
                      minWidth: 36,
                      fontSize: 11,
                    }}>
                      <div style={{ color: 'rgba(255,255,255,0.4)' }}>{day.day}</div>
                      <div style={{ fontSize: 16, margin: '2px 0' }}>{day.icon}</div>
                      <div style={{ color: 'white', fontWeight: 600 }}>{day.temp_max}°</div>
                    </div>
                  ))}
                </div>

                {/* Agro-advisory — derived from soil moisture + rain outlook */}
                {weatherData.advisory && (() => {
                  const tone = weatherData.advisory.tone
                  const c = tone === 'rain' ? '#3B82F6' : tone === 'dry' ? '#D4841A' : '#00C97A'
                  const icon = tone === 'rain' ? '🌧️' : tone === 'dry' ? '🚱' : '✅'
                  return (
                    <div style={{ background: `${c}1A`, border: `1px solid ${c}55`, borderRadius: 8, padding: '10px 14px', marginTop: 12, fontSize: 13, color: '#fff', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span>{icon}</span>
                      <div><b style={{ color: c }}>Advisory:</b> {weatherData.advisory.text}</div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Panel B — Nearest Mandis */}
          <div style={{ ...glassStyle, padding: 20, animation: 'fadeUp 0.5s ease 0.2s both' }}>
            <div style={{ fontSize: 15, color: 'white', fontWeight: 600, marginBottom: 12 }}>🏪 Nearest Mandis</div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                value={mandiQuery}
                onChange={e => setMandiQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleMandiSearch()}
                placeholder="Village, city or pincode..."
                style={{ ...inputStyle, width: 'auto', flexGrow: 1 }}
              />
              <button
                onClick={handleMandiSearch}
                style={{
                  background: '#00C97A',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: '#070C0A',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Search
              </button>
            </div>

            {isLoadingMandis && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
                <Spinner />
              </div>
            )}

            {mandiError && !isLoadingMandis && (
              <div style={{ fontSize: 13, color: '#EF4444' }}>{mandiError}</div>
            )}

            {!isLoadingMandis && !mandiError && mandiResults.length === 0 && !mandiQuery && (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                Enter a location to find nearby agricultural markets
              </div>
            )}

            {mandiResults.length > 0 && !isLoadingMandis && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {mandiResults.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <span style={{ fontSize: 13, color: 'white' }}>🏪 {m.name}</span>
                    {typeof m.distance === 'number' && (
                      <span style={{
                        fontSize: 11,
                        color: '#00C97A',
                        background: 'rgba(0,201,122,0.1)',
                        border: '1px solid rgba(0,201,122,0.2)',
                        borderRadius: 100,
                        padding: '2px 8px',
                        flexShrink: 0,
                      }}>{m.distance} km</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel C — Sunrise & Sunset */}
          <div style={{ ...glassStyle, padding: 20, animation: 'fadeUp 0.5s ease 0.25s both' }}>
            <div style={{ fontSize: 15, color: 'white', fontWeight: 600, marginBottom: 12 }}>🌅 Farm Day Planner</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>{weatherData?.city || 'New Delhi (default — search a location)'} · Today</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { emoji: '🌅', label: 'Sunrise',    value: sunData?.sunrise    ?? '—' },
                { emoji: '☀️', label: 'Solar Noon', value: sunData?.solarNoon  ?? '—' },
                { emoji: '🌇', label: 'Sunset',     value: sunData?.sunset     ?? '—' },
                { emoji: '⏱️', label: 'Day Length', value: sunData?.dayLength  ?? '—' },
              ].map(item => (
                <div key={item.label} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                  padding: '10px 8px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 18 }}>{item.emoji}</div>
                  <div style={{ fontSize: 12, color: 'white', fontWeight: 600, marginTop: 4, lineHeight: 1.2 }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4 — CROP MAP PREVIEW
      ═══════════════════════════════════════════════════════════════ */}
      <div style={{ padding: '32px 48px 56px', animation: 'fadeUp 0.5s ease 0.3s both' }}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 22, color: 'white', fontWeight: 700 }}>🗺️ Crop Listings Map</div>
          <span style={{ fontSize: 11, color: '#D4841A', fontWeight: 700, background: 'rgba(212,132,26,0.12)', border: '1px solid rgba(212,132,26,0.3)', borderRadius: 100, padding: '3px 10px' }}>Sample listings</span>
          <a href="/map" style={{ marginLeft: 'auto', fontSize: 13, color: '#00C97A', fontWeight: 600, textDecoration: 'none' }}>Open full map →</a>
        </div>

        <div style={{ position: 'relative', height: 420, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <FarmerOSMap pins={MOCK_PINS} compact isLoggedIn={false} />

          {/* Bottom overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(7,12,10,0.95))',
            padding: '32px 32px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <div style={{ fontSize: 16, color: 'white' }}>
              Login to list your crops or contact farmers directly
            </div>
            <a href="/auth" style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#00C97A',
              color: '#070C0A',
              fontWeight: 700,
              fontSize: 14,
              padding: '10px 20px',
              borderRadius: 10,
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}>
              Get Started Free →
            </a>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5 — SEASONAL CALENDAR
      ═══════════════════════════════════════════════════════════════ */}
      <div id="calendar" style={{ padding: '32px 48px', scrollMarginTop: 116, animation: 'fadeUp 0.5s ease 0.35s both' }}>
        <div style={{ fontSize: 22, color: 'white', fontWeight: 700, marginBottom: 20 }}>
          📅 India&apos;s Crop Calendar
        </div>
        <div
          className="month-scroll"
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 8,
          }}
        >
          {MONTHS.map((m, i) => {
            const isNow = i === currentMonthIdx
            return (
              <div key={m.month} style={{
                position: 'relative',
                minWidth: 120,
                ...glassStyle,
                borderRadius: 12,
                padding: 12,
                textAlign: 'center',
                flexShrink: 0,
                ...(isNow ? {
                  border: '1px solid rgba(0,201,122,0.4)',
                  background: 'rgba(0,201,122,0.06)',
                } : {}),
              }}>
                {isNow && (
                  <div style={{
                    position: 'absolute',
                    top: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#00C97A',
                    color: '#070C0A',
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    padding: '2px 8px',
                    borderRadius: 100,
                  }}>NOW</div>
                )}
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{m.month}</div>
                <div style={{ fontSize: 13, color: 'white', fontWeight: 700, marginTop: 4 }}>{m.season}</div>
                <div style={{ fontSize: 24, margin: '8px 0 6px' }}>{m.emoji}</div>
                {m.crops.slice(0, 2).map(c => (
                  <div key={c} style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>{c}</div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6 — DATA SOURCES
      ═══════════════════════════════════════════════════════════════ */}
      <div id="sources" style={{ padding: '32px 48px 64px', scrollMarginTop: 116, animation: 'fadeUp 0.5s ease 0.4s both' }}>
        <div style={{ fontSize: 22, color: 'white', fontWeight: 700, marginBottom: 8 }}>Open Data Sources</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
          All data is sourced from free government and open APIs. No login. No paywall.
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}>
          {[
            {
              icon: '📊',
              name: 'Agmarknet',
              desc: 'Daily mandi prices from 3,000+ markets. India\'s official agricultural price database.',
              url: 'data.gov.in',
            },
            {
              icon: '🌦️',
              name: 'Open-Meteo',
              desc: 'Real-time weather + soil data for any GPS location. No API key required.',
              url: 'open-meteo.com',
            },
            {
              icon: '🗺️',
              name: 'OSM Overpass',
              desc: 'Find nearest agricultural markets and mandis from OpenStreetMap data.',
              url: 'openstreetmap.org',
            },
            {
              icon: '📮',
              name: 'India Post',
              desc: 'Auto-fill district and state from any 6-digit Indian pincode instantly.',
              url: 'postalpincode.in',
            },
            {
              icon: '📖',
              name: 'Wikipedia',
              desc: 'Crop information and agricultural descriptions in multiple languages.',
              url: 'en.wikipedia.org',
            },
            {
              icon: '🌅',
              name: 'Sunrise-Sunset',
              desc: 'Farm day planning based on GPS coordinates. Sunrise, sunset, solar noon.',
              url: 'sunrisesunset.io',
            },
          ].map(card => (
            <div key={card.name} style={{
              ...glassStyle,
              borderRadius: 14,
              padding: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 28 }}>{card.icon}</span>
                <span style={{ fontSize: 16, color: 'white', fontWeight: 700 }}>{card.name}</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: 14 }}>
                {card.desc}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(0,201,122,0.1)',
                  border: '1px solid rgba(0,201,122,0.2)',
                  color: '#00C97A',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 10px',
                  borderRadius: 100,
                }}>🟢 Live</span>
                <span style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 11,
                  padding: '2px 10px',
                  borderRadius: 100,
                }}>Free</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>{card.url}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commodity drill-down panel */}
      <CommodityDetail commodity={detailCommodity} onClose={() => setDetailCommodity(null)} />

    </div>
  )
}
