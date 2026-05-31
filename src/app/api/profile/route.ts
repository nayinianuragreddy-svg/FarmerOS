import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

// POST /api/profile — save farmer or buyer profile after setup
export async function POST(req: NextRequest) {
  try {
    const { role, profile, user_id } = await req.json()

    if (!user_id || !role || !profile) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const admin = createAdminClient()

    if (role === 'farmer') {
      const { error } = await admin
        .from('farmer_profiles')
        .upsert({ ...profile, user_id }, { onConflict: 'user_id' })
      if (error) throw error
    } else {
      const { error } = await admin
        .from('buyer_profiles')
        .upsert({ ...profile, user_id }, { onConflict: 'user_id' })
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/profile]', err)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}

// GET /api/profile?user_id=xxx — check if profile exists
export async function GET(req: NextRequest) {
  try {
    const user_id = new URL(req.url).searchParams.get('user_id')
    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

    const admin = createAdminClient()

    const [{ data: farmer }, { data: buyer }] = await Promise.all([
      admin.from('farmer_profiles').select('*').eq('user_id', user_id).single(),
      admin.from('buyer_profiles').select('*').eq('user_id', user_id).single(),
    ])

    return NextResponse.json({ farmer: farmer || null, buyer: buyer || null })
  } catch (err) {
    console.error('[GET /api/profile]', err)
    return NextResponse.json({ farmer: null, buyer: null })
  }
}
