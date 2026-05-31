import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase-server'

const MOCK_OTP = '123456'

function phoneToEmail(phone: string) {
  return `91${phone}@farmeros.in`
}
function phoneToPassword(phone: string) {
  return `FOS_${phone}_farmeros2024`
}

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json()

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }
    if (otp !== MOCK_OTP) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 })
    }

    const email    = phoneToEmail(phone)
    const password = phoneToPassword(phone)
    const admin    = createAdminClient()

    // Ensure user exists — create on first login, ignore error if already exists
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { phone: `+91${phone}` },
    })

    // Sign in to get a real Supabase session
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data, error } = await anonClient.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
      console.error('[verify-otp] signIn error:', error)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      session: {
        access_token:  data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at:    data.session.expires_at,
      },
      user: {
        id:    data.user.id,
        email: data.user.email,
        phone: `+91${phone}`,
      },
    })
  } catch (err) {
    console.error('[verify-otp]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
