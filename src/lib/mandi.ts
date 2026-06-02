'use client'

export interface CommoditySnapshot {
  commodity: string
  count: number
  avgModal: number
  avgPerKg: number
  minModal: number
  maxModal: number
  bestMarket: string
  bestState: string
  bestModal: number
  worstMarket: string
  worstState: string
}

export interface StateFacet { state: string; count: number }

export interface MandiSnapshot {
  ok: boolean
  date: string
  scope?: string
  total?: number
  totalAll?: number
  mandiCount?: number
  commodityCount?: number
  commodities: CommoditySnapshot[]
  states: StateFacet[]
}

const EMPTY: MandiSnapshot = { ok: false, date: '', commodities: [], states: [] }

// Memoize per scope (national + each state) so place-switching is instant.
const cache = new Map<string, Promise<MandiSnapshot>>()

export function fetchMandiSnapshot(state?: string): Promise<MandiSnapshot> {
  const key = state && state !== 'India' ? state : 'India'
  if (!cache.has(key)) {
    const url = key === 'India' ? '/api/mandi-snapshot' : `/api/mandi-snapshot?state=${encodeURIComponent(key)}`
    cache.set(key, fetch(url)
      .then(r => r.json())
      .then((d: MandiSnapshot) => (d && d.ok ? { ...d, states: d.states ?? [] } : EMPTY))
      .catch(() => EMPTY))
  }
  return cache.get(key)!
}

// ── Display helpers ──────────────────────────────────────────────────────────

// Agmarknet commodity names → emoji. Matched by keyword (lowercased).
const EMOJI_RULES: [string, string][] = [
  ['tomato', '🍅'], ['onion', '🧅'], ['potato', '🥔'], ['wheat', '🌾'],
  ['paddy', '🌾'], ['rice', '🍚'], ['maize', '🌽'], ['corn', '🌽'],
  ['banana', '🍌'], ['mango', '🥭'], ['apple', '🍎'], ['grapes', '🍇'],
  ['orange', '🍊'], ['pomegranate', '🍎'], ['papaya', '🫛'], ['guava', '🍐'],
  ['lemon', '🍋'], ['coconut', '🥥'], ['pineapple', '🍍'], ['watermelon', '🍉'],
  ['brinjal', '🍆'], ['bhindi', '🌿'], ['ladies finger', '🌿'], ['cabbage', '🥬'],
  ['cauliflower', '🥦'], ['carrot', '🥕'], ['beans', '🫛'], ['peas', '🫛'],
  ['cucumber', '🥒'], ['gourd', '🥒'], ['pumpkin', '🎃'], ['spinach', '🥬'],
  ['chilli', '🌶️'], ['chillies', '🌶️'], ['capsicum', '🫑'], ['ginger', '🫚'],
  ['garlic', '🧄'], ['turmeric', '🟡'], ['cumin', '⭐'], ['coriander', '🌿'],
  ['pepper', '🌶️'], ['cardamom', '🟢'], ['gram', '🫘'], ['dal', '🫘'],
  ['arhar', '🫘'], ['tur', '🫘'], ['moong', '🫘'], ['urd', '🫘'], ['lentil', '🫘'],
  ['masur', '🫘'], ['groundnut', '🥜'], ['mustard', '🌻'], ['soybean', '🫛'],
  ['sunflower', '🌻'], ['sesame', '🌰'], ['castor', '🌰'], ['cotton', '🧺'],
  ['sugarcane', '🎋'], ['jaggery', '🟤'], ['coffee', '☕'], ['tea', '🍵'],
  ['arecanut', '🌰'], ['cashew', '🌰'], ['rose', '🌹'], ['marigold', '🌼'],
  ['jasmine', '🌸'], ['flower', '🌸'], ['millet', '🌾'], ['bajra', '🌾'],
  ['jowar', '🌾'], ['ragi', '🌾'], ['barley', '🌾'], ['fish', '🐟'],
  ['egg', '🥚'], ['beetroot', '🫜'], ['radish', '🥬'], ['raddish', '🥬'],
]

export function commodityEmoji(name: string): string {
  const n = name.toLowerCase()
  for (const [k, e] of EMOJI_RULES) if (n.includes(k)) return e
  return '🌱'
}

// Trim the verbose Agmarknet parentheticals for nicer display, keep it informative.
export function prettyCommodity(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim()
}

// ── MSP (Minimum Support Price) ──────────────────────────────────────────────
// Government-declared floor prices for 2025-26 (₹/quintal). Only the ~23 mandated
// crops have an MSP; everything else returns null (no badge shown). Matched by keyword
// because Agmarknet commodity names differ from the official MSP crop names.
const MSP_KEYWORDS: [string, number][] = [
  ['paddy', 2300], ['rice', 2300], ['wheat', 2275], ['jowar', 3371], ['bajra', 2625],
  ['maize', 2090], ['ragi', 4290], ['barley', 1980],
  ['arhar', 7000], ['tur', 7000], ['moong', 8682], ['green gram', 8682],
  ['urad', 7400], ['black gram', 7400], ['bengal gram', 5650], ['gram', 5650], ['chana', 5650],
  ['masur', 6700], ['lentil', 6700],
  ['groundnut', 6783], ['mustard', 5950], ['rapeseed', 5950], ['soyabean', 5328], ['soybean', 5328],
  ['sunflower', 7280], ['sesamum', 9846], ['niger', 8717], ['safflower', 5940],
  ['cotton', 7521], ['sugarcane', 355], ['jute', 5650], ['copra', 11582],
]

export function getMSPFor(commodity: string): number | null {
  const n = commodity.toLowerCase()
  for (const [k, v] of MSP_KEYWORDS) if (n.includes(k)) return v
  return null
}

// ── Net realization: transport-aware "what you actually pocket" ──────────────
// Real state centroids (approx) for estimating freight distance. Labelled as an estimate.
const STATE_CENTROIDS: Record<string, [number, number]> = {
  'andhra pradesh': [15.9, 79.7], 'arunachal pradesh': [28.2, 94.7], 'assam': [26.2, 92.9],
  'bihar': [25.8, 85.7], 'chhattisgarh': [21.3, 81.9], 'goa': [15.4, 74.0], 'gujarat': [22.6, 71.7],
  'haryana': [29.2, 76.4], 'himachal pradesh': [31.9, 77.2], 'jharkhand': [23.6, 85.3],
  'karnataka': [14.9, 75.7], 'kerala': [10.5, 76.3], 'keralam': [10.5, 76.3], 'madhya pradesh': [23.5, 78.5],
  'maharashtra': [19.4, 76.3], 'manipur': [24.7, 93.9], 'meghalaya': [25.5, 91.4], 'mizoram': [23.3, 92.8],
  'nagaland': [26.1, 94.5], 'odisha': [20.5, 84.4], 'punjab': [30.9, 75.4], 'rajasthan': [26.9, 73.8],
  'sikkim': [27.5, 88.5], 'tamil nadu': [11.1, 78.4], 'telangana': [17.9, 79.1], 'tripura': [23.7, 91.6],
  'uttar pradesh': [27.0, 80.9], 'uttarakhand': [30.0, 79.1], 'west bengal': [23.0, 87.9],
  'delhi': [28.6, 77.1], 'jammu and kashmir': [33.8, 76.0], 'chandigarh': [30.7, 76.8], 'puducherry': [11.9, 79.8],
}

// ₹ per quintal per km — approx Indian road freight (~₹5/tonne/km = ₹0.5/qtl/km).
export const FREIGHT_PER_QTL_KM = 0.5

function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371, toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0]), dLon = toRad(b[1] - a[1])
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

// Estimated road distance (km) between two states. Same state → nominal intra-state 110 km.
export function stateDistanceKm(from: string, to: string): number | null {
  const a = STATE_CENTROIDS[from.trim().toLowerCase()]
  const b = STATE_CENTROIDS[to.trim().toLowerCase()]
  if (!a || !b) return null
  if (from.trim().toLowerCase() === to.trim().toLowerCase()) return 110
  return Math.round(haversine(a, b) * 1.25) // ×1.25 for road vs straight-line
}

// Estimated break-even (A2+FL cost of cultivation, ₹/quintal). The government sets
// MSP at 1.5× the A2+FL cost, so break-even ≈ MSP ÷ 1.5 — a transparent, official-formula
// derivation (only available for MSP-mandated crops).
export function getBreakEvenFor(commodity: string): number | null {
  const msp = getMSPFor(commodity)
  return msp ? Math.round(msp / 1.5) : null
}

// ── Category classification (for the browse-by-category facet) ───────────────
export const CATEGORIES = ['Vegetables', 'Fruits', 'Cereals', 'Pulses', 'Oilseeds', 'Spices', 'Cash Crops', 'Flowers', 'Other'] as const
export type Category = typeof CATEGORIES[number]

const CATEGORY_RULES: [string, Category][] = [
  // Pulses
  ['gram', 'Pulses'], ['arhar', 'Pulses'], ['tur', 'Pulses'], ['moong', 'Pulses'], ['urd', 'Pulses'], ['lentil', 'Pulses'], ['masur', 'Pulses'], ['dal', 'Pulses'], ['peas', 'Pulses'], ['cowpea', 'Pulses'], ['rajma', 'Pulses'], ['lobia', 'Pulses'],
  // Oilseeds
  ['mustard', 'Oilseeds'], ['rapeseed', 'Oilseeds'], ['groundnut', 'Oilseeds'], ['soyabean', 'Oilseeds'], ['soybean', 'Oilseeds'], ['sunflower', 'Oilseeds'], ['sesam', 'Oilseeds'], ['castor', 'Oilseeds'], ['niger', 'Oilseeds'], ['safflower', 'Oilseeds'], ['linseed', 'Oilseeds'], ['copra', 'Oilseeds'],
  // Cereals
  ['paddy', 'Cereals'], ['rice', 'Cereals'], ['wheat', 'Cereals'], ['maize', 'Cereals'], ['jowar', 'Cereals'], ['bajra', 'Cereals'], ['ragi', 'Cereals'], ['barley', 'Cereals'], ['millet', 'Cereals'], ['corn', 'Cereals'],
  // Spices
  ['chilli', 'Spices'], ['chillies', 'Spices'], ['turmeric', 'Spices'], ['cumin', 'Spices'], ['coriander', 'Spices'], ['pepper', 'Spices'], ['cardamom', 'Spices'], ['ginger', 'Spices'], ['garlic', 'Spices'], ['fenugreek', 'Spices'], ['ajwan', 'Spices'], ['clove', 'Spices'], ['tamarind', 'Spices'], ['methi', 'Spices'],
  // Fruits
  ['banana', 'Fruits'], ['mango', 'Fruits'], ['apple', 'Fruits'], ['grape', 'Fruits'], ['orange', 'Fruits'], ['pomegranate', 'Fruits'], ['papaya', 'Fruits'], ['guava', 'Fruits'], ['lemon', 'Fruits'], ['pineapple', 'Fruits'], ['watermelon', 'Fruits'], ['sapota', 'Fruits'], ['mosambi', 'Fruits'], ['amla', 'Fruits'], ['pear', 'Fruits'], ['plum', 'Fruits'], ['fig', 'Fruits'], ['jack', 'Fruits'], ['ber', 'Fruits'], ['kinnow', 'Fruits'], ['coconut', 'Fruits'],
  // Flowers
  ['rose', 'Flowers'], ['marigold', 'Flowers'], ['jasmine', 'Flowers'], ['flower', 'Flowers'], ['chrysanthemum', 'Flowers'], ['gladiolus', 'Flowers'],
  // Cash crops
  ['cotton', 'Cash Crops'], ['sugarcane', 'Cash Crops'], ['jute', 'Cash Crops'], ['tobacco', 'Cash Crops'], ['rubber', 'Cash Crops'], ['coffee', 'Cash Crops'], ['tea', 'Cash Crops'], ['arecanut', 'Cash Crops'], ['cashew', 'Cash Crops'],
  // Vegetables (broad — keep last so specific rules win)
  ['tomato', 'Vegetables'], ['onion', 'Vegetables'], ['potato', 'Vegetables'], ['brinjal', 'Vegetables'], ['cabbage', 'Vegetables'], ['cauliflower', 'Vegetables'], ['bhindi', 'Vegetables'], ['ladies finger', 'Vegetables'], ['carrot', 'Vegetables'], ['beans', 'Vegetables'], ['gourd', 'Vegetables'], ['cucumber', 'Vegetables'], ['pumpkin', 'Vegetables'], ['spinach', 'Vegetables'], ['capsicum', 'Vegetables'], ['beetroot', 'Vegetables'], ['radish', 'Vegetables'], ['raddish', 'Vegetables'], ['drumstick', 'Vegetables'], ['peas cod', 'Vegetables'], ['amaranthus', 'Vegetables'], ['knol', 'Vegetables'], ['tinda', 'Vegetables'], ['cluster', 'Vegetables'], ['colocasia', 'Vegetables'], ['yam', 'Vegetables'], ['leafy', 'Vegetables'], ['mint', 'Vegetables'], ['celery', 'Vegetables'],
]

export function commodityCategory(commodity: string): Category {
  const n = commodity.toLowerCase()
  for (const [k, c] of CATEGORY_RULES) if (n.includes(k)) return c
  return 'Other'
}
