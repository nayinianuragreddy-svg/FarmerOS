import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

// Reads the recorded daily price history for a commodity (built by the snapshot
// "history clock"). Returns a date-ordered series of national average ₹/quintal.
export async function GET(request: NextRequest) {
  const commodity = request.nextUrl.searchParams.get('commodity')
  if (!commodity) return NextResponse.json({ ok: false, series: [] })

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('mandi_history')
      .select('date, avg_modal, min_modal, max_modal, mandi_count')
      .eq('commodity', commodity)
      .order('captured_at', { ascending: true })
      .limit(60)

    if (error) return NextResponse.json({ ok: false, series: [] })
    return NextResponse.json({ ok: true, series: data ?? [] })
  } catch {
    return NextResponse.json({ ok: false, series: [] })
  }
}
