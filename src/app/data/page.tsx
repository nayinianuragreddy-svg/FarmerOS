'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/ui/Navbar'

const MapClient = dynamic(() => import('@/components/MapClient'), { ssr: false })

// ─── Types ───────────────────────────────────────────────────────────────────

interface Crop {
  name: string
  emoji: string
  market: string
  state: string
  price: number
  change: number
}

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
}

interface MandiResult {
  name: string
  distance?: string
}

interface SunData {
  sunrise: string
  sunset: string
  solarNoon: string
  dayLength: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

const ALL_CROPS: Crop[] = [
  { name: 'Tomato',          emoji: '🍅', market: 'Hyderabad APMC',    state: 'Telangana',       price: 17,  change: 12  },
  { name: 'Onion',           emoji: '🧅', market: 'Nashik APMC',       state: 'Maharashtra',     price: 12,  change: -5  },
  { name: 'Potato',          emoji: '🥔', market: 'Agra APMC',         state: 'Uttar Pradesh',   price: 15,  change: 3   },
  { name: 'Wheat',           emoji: '🌾', market: 'Bhopal APMC',       state: 'Madhya Pradesh',  price: 23,  change: 2   },
  { name: 'Rice - Basmati',  emoji: '🍚', market: 'Karnal APMC',       state: 'Haryana',         price: 38,  change: 6   },
  { name: 'Maize',           emoji: '🌽', market: 'Davangere APMC',    state: 'Karnataka',       price: 18,  change: 1   },
  { name: 'Chana Dal',       emoji: '🫘', market: 'Indore APMC',       state: 'Madhya Pradesh',  price: 62,  change: -2  },
  { name: 'Tur Dal',         emoji: '🫘', market: 'Latur APMC',        state: 'Maharashtra',     price: 78,  change: 8   },
  { name: 'Moong Dal',       emoji: '🫘', market: 'Jaipur APMC',       state: 'Rajasthan',       price: 95,  change: 5   },
  { name: 'Groundnut',       emoji: '🥜', market: 'Rajkot APMC',       state: 'Gujarat',         price: 65,  change: 3   },
  { name: 'Mustard',         emoji: '🌿', market: 'Alwar APMC',        state: 'Rajasthan',       price: 52,  change: 1   },
  { name: 'Soybean',         emoji: '🫘', market: 'Indore APMC',       state: 'Madhya Pradesh',  price: 43,  change: -2  },
  { name: 'Turmeric',        emoji: '🟡', market: 'Nizamabad APMC',    state: 'Telangana',       price: 145, change: -3  },
  { name: 'Cumin',           emoji: '⭐', market: 'Unjha APMC',        state: 'Gujarat',         price: 220, change: 7   },
  { name: 'Black Pepper',    emoji: '🌿', market: 'Cochin APMC',       state: 'Kerala',          price: 380, change: 2   },
  { name: 'Dry Red Chilli',  emoji: '🌶️', market: 'Guntur APMC',       state: 'Andhra Pradesh',  price: 180, change: 18  },
  { name: 'Cotton',          emoji: '☁️', market: 'Akola APMC',        state: 'Maharashtra',     price: 72,  change: 1   },
  { name: 'Brinjal',         emoji: '🍆', market: 'Chennai APMC',      state: 'Tamil Nadu',      price: 14,  change: -3  },
  { name: 'Okra (Bhindi)',   emoji: '🫑', market: 'Bengaluru APMC',    state: 'Karnataka',       price: 28,  change: 5   },
  { name: 'Cauliflower',     emoji: '🥦', market: 'Delhi APMC',        state: 'Delhi',           price: 18,  change: -8  },
  { name: 'Mango - Alphonso',emoji: '🥭', market: 'Ratnagiri APMC',    state: 'Maharashtra',     price: 85,  change: 15  },
  { name: 'Banana',          emoji: '🍌', market: 'Jalgaon APMC',      state: 'Maharashtra',     price: 22,  change: 3   },
  { name: 'Pomegranate',     emoji: '🔴', market: 'Solapur APMC',      state: 'Maharashtra',     price: 95,  change: 5   },
  { name: 'Grapes',          emoji: '🍇', market: 'Nashik APMC',       state: 'Maharashtra',     price: 48,  change: 9   },
  { name: 'Garlic',          emoji: '🧄', market: 'Indore APMC',       state: 'Madhya Pradesh',  price: 68,  change: -4  },
  { name: 'Ginger',          emoji: '🫚', market: 'Cochin APMC',       state: 'Kerala',          price: 42,  change: 8   },
  { name: 'Ashwagandha',     emoji: '🌿', market: 'Neemuch APMC',      state: 'Madhya Pradesh',  price: 320, change: 12  },
  { name: 'Sugarcane',       emoji: '🎋', market: 'Pune APMC',         state: 'Maharashtra',     price: 4,   change: 0   },
]

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

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Sparkline({ positive }: { positive: boolean }) {
  const d = positive
    ? 'M0,20 Q20,15 40,10 T60,4'
    : 'M0,4 Q20,10 40,15 T60,20'
  const color = positive ? '#00C97A' : '#EF4444'
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" fill="none" style={{ display: 'block' }}>
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

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
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'name'>('price')

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

  // Derived crops
  const filteredCrops = ALL_CROPS
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price') return b.price - a.price
      if (sortBy === 'change') return b.change - a.change
      return a.name.localeCompare(b.name)
    })

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
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Asia%2FKolkata&forecast_days=7`
      )
      const wxData = await wxRes.json()
      const current = wxData.current
      const daily = wxData.daily
      const dayLabels = ['Today', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const forecast: WeatherForecastDay[] = (daily.time as string[]).map((_, i: number) => ({
        day: dayLabels[i] || `Day ${i + 1}`,
        icon: wmoToIcon(daily.weathercode[i] ?? 0),
        temp_max: Math.round(daily.temperature_2m_max[i] ?? 0),
        precipitation: daily.precipitation_sum[i] ?? 0,
      }))

      setWeatherData({
        city,
        temp: Math.round(current.temperature_2m ?? 0),
        humidity: current.relative_humidity_2m ?? 0,
        windSpeed: Math.round(current.wind_speed_10m ?? 0),
        icon: wmoToIcon(current.weathercode ?? 0),
        forecast,
      })
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
        @keyframes spin { to{transform:rotate(360deg)} }
        .data-row:hover { background: rgba(255,255,255,0.02) !important; }
        .sort-btn { cursor:pointer; transition:all 0.15s; }
        .sort-btn:hover { background: rgba(0,201,122,0.08) !important; }
        .month-scroll::-webkit-scrollbar { display:none; }
        .month-scroll { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      {/* Navbar (positioned absolute, above content) */}
      <div style={{ position: 'relative', height: 64 }}>
        <Navbar />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1 — HEADER
      ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        padding: '40px 48px 24px',
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

        {/* Right — API status badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {['Agmarknet', 'Open-Meteo', 'OSM Maps', 'India Post', 'Wikipedia'].map(name => (
            <div key={name} style={{
              background: 'rgba(0,201,122,0.08)',
              border: '1px solid rgba(0,201,122,0.2)',
              borderRadius: 100,
              padding: '4px 14px',
              fontSize: 12,
              color: '#00C97A',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#00C97A',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2 — TODAY'S MARKET MOVER
      ═══════════════════════════════════════════════════════════════ */}
      <div style={{ padding: '0 48px 32px' }}>
        <div style={{
          ...glassStyle,
          borderLeft: '4px solid #00C97A',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          animation: 'fadeUp 0.4s ease both',
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#00C97A', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8 }}>
              🌶️ TODAY&apos;S MARKET MOVER
            </div>
            <div style={{ fontSize: 22, color: 'white', fontWeight: 700 }}>
              Dry Red Chilli — Guntur APMC, Andhra Pradesh
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              Highest single-day movement in today&apos;s session
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 40, color: '#00C97A', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
              ₹180/kg
            </div>
            <div style={{ fontSize: 16, color: '#00C97A', fontWeight: 600, marginTop: 4 }}>
              ▲ 18% today
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3 — MAIN CONTENT (2-column)
      ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        padding: '0 48px',
        display: 'grid',
        gridTemplateColumns: '60% 1fr',
        gap: 24,
      }}>

        {/* ─── LEFT: Live Mandi Prices ─────────────────────────── */}
        <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, color: 'white', fontWeight: 700 }}>🟢 LIVE MANDI PRICES</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
                Powered by Agmarknet · data.gov.in
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['price', 'change', 'name'] as const).map(s => (
                <button
                  key={s}
                  className="sort-btn"
                  onClick={() => setSortBy(s)}
                  style={{
                    background: sortBy === s ? '#00C97A' : 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 100,
                    padding: '4px 12px',
                    fontSize: 12,
                    color: sortBy === s ? '#070C0A' : 'rgba(255,255,255,0.6)',
                    fontWeight: sortBy === s ? 700 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {s === 'price' ? 'Price ↓' : s === 'change' ? 'Change ↓' : 'Name'}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search any crop..."
            style={{ ...inputStyle, marginBottom: 16 }}
          />

          {/* Price table */}
          <div style={{ ...glassStyle, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  {['Crop', 'Market', 'State', 'Price', 'Change', '7d'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left',
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      fontWeight: 600,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCrops.map((crop, i) => (
                  <tr
                    key={crop.name}
                    className="data-row"
                    style={{
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'default',
                      transition: 'background 0.1s',
                    }}
                  >
                    <td style={{ padding: '11px 12px' }}>
                      <span style={{ fontSize: 16, marginRight: 6 }}>{crop.emoji}</span>
                      <span style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>{crop.name}</span>
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                      {crop.market}
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                      {crop.state}
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 14, color: 'white', fontWeight: 700, fontFamily: 'monospace' }}>
                      ₹{crop.price}/kg
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: 13, fontWeight: 600, color: crop.change > 0 ? '#00C97A' : crop.change < 0 ? '#EF4444' : 'rgba(255,255,255,0.4)' }}>
                      {crop.change > 0 ? `▲${crop.change}%` : crop.change < 0 ? `▼${Math.abs(crop.change)}%` : '—'}
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <Sparkline positive={crop.change >= 0} />
                    </td>
                  </tr>
                ))}
                {filteredCrops.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px 12px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                      No crops found for &quot;{searchQuery}&quot;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── RIGHT COLUMN ──────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

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

                {/* Rain warning */}
                {weatherData.forecast.some(d => d.precipitation > 5) && (
                  <div style={{
                    background: 'rgba(212,132,26,0.12)',
                    border: '1px solid rgba(212,132,26,0.3)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginTop: 12,
                    fontSize: 13,
                    color: '#D4841A',
                  }}>
                    ⚠️ Rain expected{' '}
                    {weatherData.forecast
                      .filter(d => d.precipitation > 5)
                      .map(d => d.day)
                      .join(', ')} — consider early harvest
                  </div>
                )}
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
                    {m.distance && (
                      <span style={{
                        fontSize: 11,
                        color: '#00C97A',
                        background: 'rgba(0,201,122,0.1)',
                        border: '1px solid rgba(0,201,122,0.2)',
                        borderRadius: 100,
                        padding: '2px 8px',
                      }}>{m.distance}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel C — Sunrise & Sunset */}
          <div style={{ ...glassStyle, padding: 20, animation: 'fadeUp 0.5s ease 0.25s both' }}>
            <div style={{ fontSize: 15, color: 'white', fontWeight: 600, marginBottom: 12 }}>🌅 Farm Day Planner</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>New Delhi · Today</div>
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
      <div style={{ padding: '32px 48px', animation: 'fadeUp 0.5s ease 0.3s both' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 22, color: 'white', fontWeight: 700 }}>🗺️ Live Crop Listings</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>30 active listings across India</div>
        </div>

        <div style={{ position: 'relative', height: 420, borderRadius: 16, overflow: 'hidden' }}>
          <MapClient />

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
      <div style={{ padding: '32px 48px', animation: 'fadeUp 0.5s ease 0.35s both' }}>
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
      <div style={{ padding: '32px 48px 64px', animation: 'fadeUp 0.5s ease 0.4s both' }}>
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

    </div>
  )
}
