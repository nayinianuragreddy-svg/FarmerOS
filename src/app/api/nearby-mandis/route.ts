import { NextRequest, NextResponse } from 'next/server'

interface OverpassElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

interface MandiLocation {
  id: number
  lat: number
  lng: number
  name: string
  distance: number // km from query point
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') ?? '17.38')
  const lng = parseFloat(searchParams.get('lng') ?? '78.48')
  const radius = parseFloat(searchParams.get('radius') ?? '50')
  const radiusMeters = radius * 1000

  const query = `
[out:json][timeout:15];
(
  node["amenity"="marketplace"](around:${radiusMeters},${lat},${lng});
  node["landuse"="commercial"](around:${radiusMeters},${lat},${lng});
  way["amenity"="marketplace"](around:${radiusMeters},${lat},${lng});
);
out center;
`

  // The public Overpass endpoint is heavily rate-limited — try mirrors in order.
  const ENDPOINTS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  ]

  try {
    let data: { elements?: OverpassElement[] } | null = null
    for (const ep of ENDPOINTS) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`,
          next: { revalidate: 86400 }, // cache 24 hours
        })
        if (!res.ok) continue
        const ct = res.headers.get('content-type') || ''
        if (!ct.includes('json')) continue
        data = await res.json()
        if (data?.elements) break
      } catch { /* try next mirror */ }
    }
    if (!data) return NextResponse.json({ mandis: [] })
    const elements: OverpassElement[] = data?.elements ?? []

    const mandis: MandiLocation[] = elements
      .map(el => {
        const elLat = el.lat ?? el.center?.lat
        const elLon = el.lon ?? el.center?.lon
        if (!elLat || !elLon) return null
        const name =
          el.tags?.name ||
          el.tags?.['name:en'] ||
          'Local Market'
        return { id: el.id, lat: elLat, lng: elLon, name, distance: Math.round(haversineKm(lat, lng, elLat, elLon) * 10) / 10 }
      })
      .filter((m): m is MandiLocation => m !== null)
      .sort((a, b) => a.distance - b.distance)

    return NextResponse.json({ mandis })
  } catch {
    return NextResponse.json({ mandis: [] })
  }
}
