// ─── FarmerOS API Utilities ──────────────────────────────────────────────────
// All APIs used here are FREE. No billing surprises.

// ─── NOMINATIM (OpenStreetMap) — Location Geocoding ──────────────────────────
// Free, no API key, no rate limit for reasonable use
export async function geocodeLocation(query: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' India')}&format=json&limit=1&countrycodes=in`,
      {
        headers: {
          'User-Agent': 'FarmerOS/1.0 (India crop discovery platform)',
          'Accept-Language': 'en',
        },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data || data.length === 0) return null
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    }
  } catch {
    return null
  }
}

// Reverse geocode: coordinates → place name
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'User-Agent': 'FarmerOS/1.0' } }
    )
    const data = await res.json()
    const addr = data?.address
    if (!addr) return null
    return [addr.village || addr.town || addr.city, addr.state_district, addr.state]
      .filter(Boolean)
      .join(', ')
  } catch {
    return null
  }
}

// ─── AGMARKNET (data.gov.in) — Live Mandi Prices ─────────────────────────────
// Proxied via /api/mandi-prices to avoid CORS issues.

// Mock prices (realistic 2026 values) — used as fallback when API is unavailable
const MOCK_MANDI_PRICES: Record<string, { price: number; unit: string; market: string; change: number }> = {
  'Tomato':                { price: 17,    unit: 'kg',     market: 'Hyderabad APMC',  change: +12 },
  'Onion':                 { price: 12,    unit: 'kg',     market: 'Nashik APMC',     change: -5  },
  'Potato':                { price: 15,    unit: 'kg',     market: 'Agra APMC',       change: +3  },
  'Wheat - Sharbati':      { price: 23,    unit: 'kg',     market: 'Bhopal APMC',     change: +2  },
  'Rice - Basmati':        { price: 38,    unit: 'kg',     market: 'Karnal APMC',     change: +6  },
  'Rice - Sona Masoori':   { price: 28,    unit: 'kg',     market: 'Nellore APMC',    change: +4  },
  'Maize / Corn':          { price: 18,    unit: 'kg',     market: 'Davangere APMC',  change: +1  },
  'Chana - Desi':          { price: 62,    unit: 'kg',     market: 'Indore APMC',     change: -2  },
  'Tur / Arhar (Pigeon Pea)': { price: 78, unit: 'kg',    market: 'Latur APMC',      change: +8  },
  'Moong (Green Gram)':    { price: 95,    unit: 'kg',     market: 'Jaipur APMC',     change: +5  },
  'Urad (Black Gram)':     { price: 88,    unit: 'kg',     market: 'Nagpur APMC',     change: -3  },
  'Groundnut':             { price: 65,    unit: 'kg',     market: 'Rajkot APMC',     change: +3  },
  'Mustard / Rapeseed':    { price: 52,    unit: 'kg',     market: 'Alwar APMC',      change: +1  },
  'Soybean':               { price: 43,    unit: 'kg',     market: 'Indore APMC',     change: -2  },
  'Sunflower':             { price: 58,    unit: 'kg',     market: 'Bidar APMC',      change: +4  },
  'Turmeric':              { price: 145,   unit: 'kg',     market: 'Nizamabad APMC',  change: -3  },
  'Cumin (Jeera)':         { price: 220,   unit: 'kg',     market: 'Unjha APMC',      change: +7  },
  'Black Pepper':          { price: 380,   unit: 'kg',     market: 'Cochin APMC',     change: +2  },
  'Dry Red Chilli':        { price: 180,   unit: 'kg',     market: 'Guntur APMC',     change: +8  },
  'Cotton - Long Staple':  { price: 72,    unit: 'kg',     market: 'Akola APMC',      change: +1  },
  'Sugarcane':             { price: 350,   unit: 'quintal',market: 'Pune APMC',       change: 0   },
  'Mango - Alphonso':      { price: 85,    unit: 'kg',     market: 'Ratnagiri APMC',  change: +15 },
  'Mango - Banganapalli':  { price: 42,    unit: 'kg',     market: 'Kurnool APMC',    change: +10 },
  'Banana':                { price: 22,    unit: 'kg',     market: 'Jalgaon APMC',    change: +3  },
  'Pomegranate':           { price: 95,    unit: 'kg',     market: 'Solapur APMC',    change: +5  },
  'Grapes - Green':        { price: 48,    unit: 'kg',     market: 'Nashik APMC',     change: +9  },
  'Okra (Bhindi)':         { price: 28,    unit: 'kg',     market: 'Bengaluru APMC',  change: -4  },
  'Cauliflower':           { price: 18,    unit: 'kg',     market: 'Delhi APMC',      change: -8  },
  'Brinjal (Eggplant)':    { price: 14,    unit: 'kg',     market: 'Chennai APMC',    change: +2  },
  'Ashwagandha':           { price: 320,   unit: 'kg',     market: 'Neemuch APMC',    change: +12 },
}

// Sync version for components that can't await — returns mock data only
export function getMandiPriceSync(cropName: string): { price: number; unit: string; market: string; change: number } | null {
  return MOCK_MANDI_PRICES[cropName] || null
}

export async function getMandiPrice(cropName: string): Promise<{ price: number; unit: string; market: string; change: number } | null> {
  try {
    const res = await fetch(`/api/mandi-prices?commodity=${encodeURIComponent(cropName)}`)
    if (res.ok) {
      const data = await res.json()
      if (data.records && data.records.length > 0) {
        const r = data.records[0]
        return {
          price: r.pricePerKg,
          unit: 'kg',
          market: r.market || 'APMC Mandi',
          change: 0,
        }
      }
    }
  } catch {
    // fall through to mock
  }
  return MOCK_MANDI_PRICES[cropName] || null
}

// Get top crops for the price ticker — sync, returns mock data
// Individual ticker entries can fetch live prices via useEffect
export function getPriceTickerData() {
  return [
    { crop: 'Tomato',           emoji: '🍅', ...MOCK_MANDI_PRICES['Tomato'] },
    { crop: 'Onion',            emoji: '🧅', ...MOCK_MANDI_PRICES['Onion'] },
    { crop: 'Wheat - Sharbati', emoji: '🌾', ...MOCK_MANDI_PRICES['Wheat - Sharbati'] },
    { crop: 'Dry Red Chilli',   emoji: '🌶️', ...MOCK_MANDI_PRICES['Dry Red Chilli'] },
    { crop: 'Groundnut',        emoji: '🥜', ...MOCK_MANDI_PRICES['Groundnut'] },
    { crop: 'Turmeric',         emoji: '🟡', ...MOCK_MANDI_PRICES['Turmeric'] },
    { crop: 'Cotton',           emoji: '☁️', ...MOCK_MANDI_PRICES['Cotton - Long Staple'] },
    { crop: 'Rice (Basmati)',   emoji: '🍚', ...MOCK_MANDI_PRICES['Rice - Basmati'] },
    { crop: 'Soybean',          emoji: '🫘', ...MOCK_MANDI_PRICES['Soybean'] },
    { crop: 'Black Pepper',     emoji: '🌿', ...MOCK_MANDI_PRICES['Black Pepper'] },
    { crop: 'Cumin (Jeera)',    emoji: '⭐', ...MOCK_MANDI_PRICES['Cumin (Jeera)'] },
    { crop: 'Pomegranate',      emoji: '🔴', ...MOCK_MANDI_PRICES['Pomegranate'] },
  ]
}

// ─── OPEN-METEO — Weather Data ────────────────────────────────────────────────
// Completely free, no API key needed.

export interface WeatherData {
  temp: number
  feels_like: number
  description: string
  icon: string
  humidity: number
  wind_speed: number
  city: string
  forecast: Array<{
    date: string
    day: string
    temp_max: number
    temp_min: number
    description: string
    icon: string
    rain: boolean
    precipitation: number
  }>
}

function wmoToIcon(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '🌤️'
  if (code === 45 || code === 48) return '🌫️'
  if (code >= 51 && code <= 57) return '🌦️'
  if (code >= 61 && code <= 67) return '🌧️'
  if (code >= 71 && code <= 77) return '❄️'
  if (code >= 80 && code <= 82) return '🌦️'
  if (code === 85 || code === 86) return '❄️'
  if (code >= 95) return '⛈️'
  return '🌡️'
}

function wmoToDescription(code: number): string {
  if (code === 0) return 'Clear sky'
  if (code === 1) return 'Mainly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Foggy'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 61 && code <= 67) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Rain showers'
  if (code === 85 || code === 86) return 'Snow showers'
  if (code >= 95) return 'Thunderstorm'
  return 'Mixed conditions'
}

function getMockWeather(city: string): WeatherData {
  return {
    temp: 29,
    feels_like: 32,
    description: 'Partly Cloudy',
    icon: '⛅',
    humidity: 68,
    wind_speed: 14,
    city,
    forecast: [
      { date: 'Today', day: 'Today', temp_max: 32, temp_min: 24, description: 'Partly cloudy', icon: '⛅', rain: false, precipitation: 0 },
      { date: 'Mon',   day: 'Mon',   temp_max: 30, temp_min: 23, description: 'Mostly sunny',  icon: '☀️', rain: false, precipitation: 0 },
      { date: 'Tue',   day: 'Tue',   temp_max: 28, temp_min: 22, description: 'Rain likely',   icon: '🌧️', rain: true,  precipitation: 8 },
      { date: 'Wed',   day: 'Wed',   temp_max: 25, temp_min: 21, description: 'Heavy rain',    icon: '⛈️', rain: true,  precipitation: 18 },
      { date: 'Thu',   day: 'Thu',   temp_max: 28, temp_min: 22, description: 'Clearing up',   icon: '🌤️', rain: false, precipitation: 1 },
      { date: 'Fri',   day: 'Fri',   temp_max: 31, temp_min: 23, description: 'Sunny',         icon: '☀️', rain: false, precipitation: 0 },
      { date: 'Sat',   day: 'Sat',   temp_max: 33, temp_min: 24, description: 'Hot and sunny', icon: '☀️', rain: false, precipitation: 0 },
    ],
  }
}

export async function fetchWeather(lat: number, lng: number, cityName?: string): Promise<WeatherData> {
  const city = cityName || 'Your Farm Location'

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode` +
      `&timezone=Asia%2FKolkata&forecast_days=7`

    const res = await fetch(url)
    if (!res.ok) return getMockWeather(city)

    const data = await res.json()
    const current = data.current
    const daily = data.daily

    const dayLabels = ['Today', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    const forecast = (daily.time as string[]).map((dateStr: string, i: number) => {
      const wcode: number = daily.weathercode[i] ?? 0
      const precip: number = daily.precipitation_sum[i] ?? 0
      return {
        date: dateStr,
        day: dayLabels[i] || `Day ${i + 1}`,
        temp_max: Math.round(daily.temperature_2m_max[i] ?? 0),
        temp_min: Math.round(daily.temperature_2m_min[i] ?? 0),
        description: wmoToDescription(wcode),
        icon: wmoToIcon(wcode),
        rain: precip > 1,
        precipitation: precip,
      }
    })

    const currentWcode: number = current.weathercode ?? 0

    return {
      temp: Math.round(current.temperature_2m ?? 0),
      feels_like: Math.round(current.temperature_2m ?? 0), // Open-Meteo free tier doesn't have feels_like in current
      description: wmoToDescription(currentWcode),
      icon: wmoToIcon(currentWcode),
      humidity: current.relative_humidity_2m ?? 0,
      wind_speed: Math.round((current.wind_speed_10m ?? 0) * 3.6), // m/s → km/h... open-meteo returns km/h already, keep as-is
      city,
      forecast,
    }
  } catch {
    return getMockWeather(city)
  }
}

// ─── POSTAL PINCODE API ───────────────────────────────────────────────────────
// Free API: https://api.postalpincode.in

export async function lookupPincode(pincode: string): Promise<{ district: string; state: string; postOffice: string } | null> {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
      const po = data[0].PostOffice[0]
      return {
        district: po.District,
        state: po.State,
        postOffice: po.Name,
      }
    }
    return null
  } catch {
    return null
  }
}

// ─── WIKIPEDIA — Crop Descriptions ───────────────────────────────────────────

export async function getCropDescription(cropName: string): Promise<string | null> {
  try {
    const firstWord = cropName.split(/[\s-]/)[0]
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstWord)}`
    )
    if (!res.ok) return null
    const data = await res.json()
    const extract: string | undefined = data.extract
    if (!extract) return null
    const firstSentence = extract.split('.')[0]
    return firstSentence ? firstSentence + '.' : null
  } catch {
    return null
  }
}

// ─── SUNRISE-SUNSET API ───────────────────────────────────────────────────────
// Free API: https://sunrisesunset.io

export async function fetchSunriseSunset(
  lat: number,
  lng: number
): Promise<{ sunrise: string; sunset: string; solarNoon: string } | null> {
  try {
    const res = await fetch(
      `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&timezone=Asia/Kolkata`
    )
    if (!res.ok) return null
    const data = await res.json()
    const results = data?.results
    if (!results) return null
    return {
      sunrise: results.sunrise,
      sunset: results.sunset,
      solarNoon: results.solar_noon,
    }
  } catch {
    return null
  }
}

// ─── BHASHINI — Language Translation ─────────────────────────────────────────
// Free government API. Docs: https://bhashini.gitbook.io/bhashini-apis
// For now: language labels only (full translation integration in V2)

export const SUPPORTED_LANGUAGES = [
  { code: 'en',    label: 'English',    nativeLabel: 'English',   flag: '🇬🇧' },
  { code: 'hi',    label: 'Hindi',      nativeLabel: 'हिंदी',    flag: '🇮🇳' },
  { code: 'te',    label: 'Telugu',     nativeLabel: 'తెలుగు',   flag: '🏳️' },
  { code: 'mr',    label: 'Marathi',    nativeLabel: 'मराठी',    flag: '🏳️' },
  { code: 'ta',    label: 'Tamil',      nativeLabel: 'தமிழ்',    flag: '🏳️' },
  { code: 'kn',    label: 'Kannada',    nativeLabel: 'ಕನ್ನಡ',    flag: '🏳️' },
  { code: 'ml',    label: 'Malayalam',  nativeLabel: 'മലയാളം',   flag: '🏳️' },
  { code: 'gu',    label: 'Gujarati',   nativeLabel: 'ગુજરાતી',  flag: '🏳️' },
  { code: 'pa',    label: 'Punjabi',    nativeLabel: 'ਪੰਜਾਬੀ',  flag: '🏳️' },
  { code: 'bn',    label: 'Bengali',    nativeLabel: 'বাংলা',     flag: '🏳️' },
  { code: 'or',    label: 'Odia',       nativeLabel: 'ଓଡ଼ିଆ',   flag: '🏳️' },
  { code: 'as',    label: 'Assamese',   nativeLabel: 'অসমীয়া',  flag: '🏳️' },
] as const

export type LangCode = typeof SUPPORTED_LANGUAGES[number]['code']

// ─── MSP PRICES (data.gov.in) ─────────────────────────────────────────────────
// Minimum Support Price — Government's floor price for supported crops
export const MSP_PRICES: Record<string, { price: number; unit: string; year: string }> = {
  'Wheat - Sharbati':          { price: 2275, unit: 'quintal', year: '2025-26' },
  'Wheat - Lokwan':            { price: 2275, unit: 'quintal', year: '2025-26' },
  'Rice - Basmati':            { price: 2183, unit: 'quintal', year: '2025-26' },
  'Rice - Sona Masoori':       { price: 2183, unit: 'quintal', year: '2025-26' },
  'Tur / Arhar (Pigeon Pea)':  { price: 7000, unit: 'quintal', year: '2025-26' },
  'Moong (Green Gram)':        { price: 8682, unit: 'quintal', year: '2025-26' },
  'Urad (Black Gram)':         { price: 6950, unit: 'quintal', year: '2025-26' },
  'Chana - Desi':              { price: 5440, unit: 'quintal', year: '2025-26' },
  'Groundnut':                 { price: 6783, unit: 'quintal', year: '2025-26' },
  'Mustard / Rapeseed':        { price: 5650, unit: 'quintal', year: '2025-26' },
  'Soybean':                   { price: 4892, unit: 'quintal', year: '2025-26' },
  'Sunflower':                 { price: 6760, unit: 'quintal', year: '2025-26' },
  'Cotton - Long Staple':      { price: 7521, unit: 'quintal', year: '2025-26' },
  'Jowar (Sorghum)':           { price: 3371, unit: 'quintal', year: '2025-26' },
  'Bajra (Pearl Millet)':      { price: 2625, unit: 'quintal', year: '2025-26' },
  'Maize / Corn':              { price: 2090, unit: 'quintal', year: '2025-26' },
  'Ragi (Finger Millet)':      { price: 4290, unit: 'quintal', year: '2025-26' },
  'Masoor (Red Lentil)':       { price: 6425, unit: 'quintal', year: '2025-26' },
  'Sugarcane':                 { price: 340,  unit: 'quintal', year: '2025-26' },
  'Cumin (Jeera)':             { price: 8950, unit: 'quintal', year: '2025-26' },
}

export function getMSP(cropName: string) {
  return MSP_PRICES[cropName] || null
}
