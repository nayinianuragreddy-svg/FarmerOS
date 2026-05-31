import { NextRequest, NextResponse } from 'next/server'

interface AgmarknetRecord {
  Commodity?: string
  Market?: string
  State?: string
  Min_x0020_Price?: string
  Max_x0020_Price?: string
  Modal_x0020_Price?: string
  Arrival_Date?: string
}

interface MandiPriceRecord {
  commodity: string
  market: string
  state: string
  minPrice: number
  maxPrice: number
  modalPrice: number
  date: string
  pricePerKg: number
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const commodity = searchParams.get('commodity') || 'Tomato'
  const state = searchParams.get('state') || 'Telangana'

  const apiKey =
    process.env.NEXT_PUBLIC_AGMARKNET_KEY ||
    '579b464db66ec23bdd000001cdd3946e44ce4aab0ddc2ef57d04adb'

  const url = new URL(
    'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'
  )
  url.searchParams.set('api-key', apiKey)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '5')
  url.searchParams.set('filters[Commodity]', commodity)
  url.searchParams.set('filters[State]', state)

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 }, // cache 1 hour
    })

    if (!res.ok) {
      return NextResponse.json({ records: [], fallback: true })
    }

    const data = await res.json()
    const raw: AgmarknetRecord[] = data?.records ?? []

    if (!raw.length) {
      return NextResponse.json({ records: [], fallback: true })
    }

    const records: MandiPriceRecord[] = raw.map(r => {
      const modalRaw = parseFloat(r.Modal_x0020_Price ?? '0') || 0
      // Agmarknet prices are in rupees per quintal (100 kg)
      // Convert to per kg
      const pricePerKg = parseFloat((modalRaw / 100).toFixed(2))
      return {
        commodity: r.Commodity ?? commodity,
        market: r.Market ?? '',
        state: r.State ?? state,
        minPrice: parseFloat(r.Min_x0020_Price ?? '0') || 0,
        maxPrice: parseFloat(r.Max_x0020_Price ?? '0') || 0,
        modalPrice: modalRaw,
        date: r.Arrival_Date ?? '',
        pricePerKg,
      }
    })

    return NextResponse.json({ records })
  } catch {
    return NextResponse.json({ records: [], fallback: true })
  }
}
