import { NextRequest, NextResponse } from 'next/server'

// data.gov.in resource schema (lowercase field ids; prices are numbers, ₹/quintal)
interface AgmarknetRecord {
  commodity?: string
  market?: string
  district?: string
  state?: string
  variety?: string
  grade?: string
  min_price?: number | string
  max_price?: number | string
  modal_price?: number | string
  arrival_date?: string
}

interface MandiPriceRecord {
  commodity: string
  market: string
  district: string
  state: string
  variety: string
  grade: string
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
  const limit = searchParams.get('limit') || '5'

  const apiKey =
    process.env.AGMARKNET_KEY ||
    process.env.NEXT_PUBLIC_AGMARKNET_KEY ||
    // data.gov.in public sample key (limited to 10 records) — last-resort fallback
    '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b'

  const url = new URL(
    'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'
  )
  url.searchParams.set('api-key', apiKey)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', limit)
  url.searchParams.set('filters[commodity]', commodity)
  if (state && state !== 'all') url.searchParams.set('filters[state]', state)

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
      const modalRaw = Number(r.modal_price) || 0
      // Agmarknet prices are in rupees per quintal (100 kg) — convert to per kg
      const pricePerKg = parseFloat((modalRaw / 100).toFixed(2))
      return {
        commodity: r.commodity ?? commodity,
        market: r.market ?? '',
        district: r.district ?? '',
        state: r.state ?? state,
        variety: r.variety ?? '',
        grade: r.grade ?? '',
        minPrice: Number(r.min_price) || 0,
        maxPrice: Number(r.max_price) || 0,
        modalPrice: modalRaw,
        date: r.arrival_date ?? '',
        pricePerKg,
      }
    })

    return NextResponse.json({ records })
  } catch {
    return NextResponse.json({ records: [], fallback: true })
  }
}
