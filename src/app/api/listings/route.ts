import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// GET /api/listings?lat=17.38&lng=78.48&radius=50&category=vegetables&organic=true
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat      = parseFloat(searchParams.get('lat') || '20.5937')
  const lng      = parseFloat(searchParams.get('lng') || '78.9629')
  const radius   = parseFloat(searchParams.get('radius') || '500')   // km
  const category = searchParams.get('category')
  const organic  = searchParams.get('organic') === 'true'

  try {
    const supabase = await createServerSupabaseClient()

    // PostGIS geo-radius query
    let query = supabase
      .from('crop_listings')
      .select(`
        *,
        farmer:farmer_profiles(name, village, district, state, rating_avg, rating_count)
      `)
      .eq('status', 'active')
      .filter(
        'geo_point',
        'within',
        `CIRCLE(POINT(${lng} ${lat}), ${radius * 1000})`, // PostGIS circle in meters
      )

    if (category) query = query.eq('crop_category', category)
    if (organic)  query = query.eq('is_organic', true)

    const { data, error } = await query.limit(500)

    if (error) throw error

    return NextResponse.json({ listings: data || [], count: data?.length || 0 })
  } catch (err) {
    console.error('[GET /api/listings]', err)
    // Return empty array so UI doesn't break without Supabase
    return NextResponse.json({ listings: [], count: 0 })
  }
}

// POST /api/listings — create a new listing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const listing = {
      farmer_id:      user.id,
      crop_category:  body.crop_category,
      crop_name:      body.crop_name,
      crop_variety:   body.crop_variety || null,
      quantity:       body.quantity,
      unit:           body.unit,
      expected_price: body.expected_price || null,
      is_organic:     body.is_organic ?? false,
      images:         body.images || [],
      geo_point:      `POINT(${body.longitude} ${body.latitude})`,
      harvest_date:   body.harvest_date || null,
      status:         'active',
      expires_at:     new Date(Date.now() + 30 * 86400000).toISOString(),
    }

    const { data, error } = await supabase
      .from('crop_listings')
      .insert(listing)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ listing: data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/listings]', err)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}

// PATCH /api/listings — update listing status
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json()
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const updates: Record<string, unknown> = { status }
    if (status === 'active') {
      updates.expires_at = new Date(Date.now() + 30 * 86400000).toISOString()
    }

    const { data, error } = await supabase
      .from('crop_listings')
      .update(updates)
      .eq('id', id)
      .eq('farmer_id', user.id) // RLS: only own listings
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ listing: data })
  } catch (err) {
    console.error('[PATCH /api/listings]', err)
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}

// DELETE /api/listings?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('crop_listings')
      .delete()
      .eq('id', id)
      .eq('farmer_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/listings]', err)
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}
