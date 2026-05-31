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

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      next: { revalidate: 86400 }, // cache 24 hours
    })

    if (!res.ok) {
      return NextResponse.json({ mandis: [] })
    }

    const data = await res.json()
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
        return { id: el.id, lat: elLat, lng: elLon, name }
      })
      .filter((m): m is MandiLocation => m !== null)

    return NextResponse.json({ mandis })
  } catch {
    return NextResponse.json({ mandis: [] })
  }
}
