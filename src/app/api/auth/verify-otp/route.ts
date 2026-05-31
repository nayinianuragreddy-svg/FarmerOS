import { NextRequest, NextResponse } from 'next/server'

const MOCK_OTP = '123456'

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json()

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP required' }, { status: 400 })
    }

    // TODO: Verify against MSG91 or Supabase phone auth
    // const res = await fetch(`https://api.msg91.com/api/v5/otp/verify?mobile=91${phone}&otp=${otp}`, {
    //   headers: { authkey: process.env.MSG91_AUTH_KEY! },
    // })

    if (otp !== MOCK_OTP) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified',
      user_id: Buffer.from(phone).toString('base64'), // deterministic mock ID
    })
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
