import { NextRequest, NextResponse } from 'next/server'

// In production: integrate MSG91 or Supabase phone auth
// For now: mock OTP — always succeeds, OTP is always 123456

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    // TODO: Integrate MSG91
    // const res = await fetch('https://api.msg91.com/api/v5/otp', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', authkey: process.env.MSG91_AUTH_KEY! },
    //   body: JSON.stringify({ template_id: process.env.MSG91_TEMPLATE_ID, mobile: `91${phone}` }),
    // })

    console.log(`[OTP] Sending to +91${phone} — mock mode, OTP: 123456`)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove in production:
      _dev_hint: 'Use 123456 as OTP in development mode',
    })
  } catch {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
