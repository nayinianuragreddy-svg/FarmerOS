'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sprout, Phone, ArrowRight, RotateCcw, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { createClient } from '@/lib/supabase'

type Step = 'phone' | 'otp' | 'done'

export default function AuthPage() {
  const router = useRouter()
  const { user, loginWithSession } = useAuthStore()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      router.replace(user.is_new ? '/auth/setup' : '/')
    }
  }, [user, router])

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(n => n - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  const handleSendOTP = async () => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length !== 10) { setError('Enter a valid 10-digit mobile number'); return }
    setError('')
    setLoading(true)
    await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleaned }),
    })
    setLoading(false)
    setStep('otp')
    setResendTimer(30)
    setTimeout(() => otpRefs.current[0]?.focus(), 100)
  }

  const handleOTPChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[index] = val.slice(-1)
    setOtp(next)
    if (val && index < 5) otpRefs.current[index + 1]?.focus()
    // Auto-verify when all filled
    if (next.every(d => d) && next.join('').length === 6) {
      handleVerify(next.join(''))
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (code = otp.join('')) => {
    if (code.length !== 6) { setError('Enter the 6-digit OTP'); return }
    setError('')
    setLoading(true)

    const res  = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.replace(/\D/g, ''), otp: code }),
    })
    const data = await res.json()

    if (!res.ok || !data.session) {
      setLoading(false)
      setError(data.error === 'Invalid OTP' ? 'Incorrect OTP. (Hint: use 123456)' : 'Something went wrong. Try again.')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
      return
    }

    // Establish Supabase session in the browser
    const supabase = createClient()
    await supabase.auth.setSession({
      access_token:  data.session.access_token,
      refresh_token: data.session.refresh_token,
    })

    loginWithSession(data.session, { id: data.user.id, phone: data.user.phone })
    setStep('done')
    setLoading(false)
    setTimeout(() => {
      const { user } = useAuthStore.getState()
      router.replace(user?.is_new ? '/auth/setup' : '/')
    }, 800)
  }

  const handleResend = () => {
    setOtp(['', '', '', '', '', ''])
    setError('')
    setResendTimer(30)
    otpRefs.current[0]?.focus()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070C0A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', position: 'relative' }}>

      {/* Rich background — layered glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Primary emerald glow */}
        <div style={{
          position: 'absolute', top: '35%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,201,122,0.18) 0%, transparent 65%)',
          filter: 'blur(40px)',
        }} />
        {/* Secondary deep blue-green */}
        <div style={{
          position: 'absolute', bottom: '20%', right: '20%',
          width: '400px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(16,110,70,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '40px', textDecoration: 'none' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(0,201,122,0.2) 0%, rgba(0,168,98,0.12) 100%)',
            border: '1px solid rgba(0,201,122,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(0,201,122,0.2)',
          }}>
            <Sprout style={{ width: '22px', height: '22px', color: '#00C97A' }} />
          </div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '22px', letterSpacing: '-0.03em', fontFamily: "'Inter', sans-serif" }}>FarmerOS</span>
        </Link>

        {/* Card — elevated, glowing */}
        <div className="glass-card-elevated" style={{ padding: '32px' }}>

          {/* ── STEP: PHONE ───────────────────────────────── */}
          {step === 'phone' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-white font-bold text-2xl">Welcome</h1>
                <p className="text-white/40 text-sm mt-1">Enter your mobile number to continue</p>
              </div>

              <div className="space-y-3">
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Mobile Number</label>
                <div className={`flex items-center gap-3 bg-white/5 border rounded-xl px-4 py-3 transition ${
                  error ? 'border-red-500/50' : 'border-white/10 focus-within:border-emerald-500/50'
                }`}>
                  <div className="flex items-center gap-2 border-r border-white/10 pr-3 flex-shrink-0">
                    <span className="text-lg">🇮🇳</span>
                    <span className="text-white/60 text-sm font-medium">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                    placeholder="98765 43210"
                    className="flex-1 bg-transparent text-white placeholder:text-white/20 text-base outline-none"
                    autoFocus
                    maxLength={10}
                  />
                  <Phone className="w-4 h-4 text-white/20 flex-shrink-0" />
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
              </div>

              <button
                onClick={handleSendOTP}
                disabled={loading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: loading ? 'rgba(0,201,122,0.4)' : 'linear-gradient(135deg, #00C97A 0%, #00A862 100%)',
                  color: '#000', fontWeight: 700, padding: '15px', borderRadius: '13px', fontSize: '15px',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(0,201,122,0.35), 0 1px 0 rgba(255,255,255,0.2) inset',
                  transition: 'all 0.15s ease', letterSpacing: '-0.01em',
                }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                  Send OTP <ArrowRight className="w-4 h-4" />
                </>}
              </button>

              <p className="text-center text-white/25 text-xs">
                By continuing you agree to our{' '}
                <span className="text-white/40 underline cursor-pointer">Terms of Use</span>
              </p>
            </div>
          )}

          {/* ── STEP: OTP ─────────────────────────────────── */}
          {step === 'otp' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-white font-bold text-2xl">Verify OTP</h1>
                <p className="text-white/40 text-sm mt-1">
                  Sent to <span className="text-white/70 font-medium">+91 {phone}</span>
                </p>
                <button
                  onClick={() => { setStep('phone'); setOtp(['','','','','','']); setError('') }}
                  className="text-emerald-400 text-xs mt-1 hover:text-emerald-300 transition"
                >
                  Change number
                </button>
              </div>

              {/* OTP boxes */}
              <div className="flex gap-2 justify-between">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={e => handleOTPChange(i, e.target.value)}
                    onKeyDown={e => handleOTPKeyDown(i, e)}
                    className={`w-11 h-13 text-center text-white text-xl font-bold bg-white/5 border rounded-xl outline-none transition-all duration-150 ${
                      digit ? 'border-emerald-500/60 bg-emerald-500/8' : 'border-white/10 focus:border-white/30'
                    } ${error ? 'border-red-500/40' : ''}`}
                    style={{ height: '52px' }}
                    maxLength={1}
                  />
                ))}
              </div>

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              {/* Demo hint */}
              <div className="flex items-center gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2">
                <span className="text-amber-400 text-base">💡</span>
                <p className="text-amber-300/70 text-xs">Demo mode — use OTP <span className="font-bold text-amber-300">123456</span></p>
              </div>

              <button
                onClick={() => handleVerify()}
                disabled={loading || otp.join('').length !== 6}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: (loading || otp.join('').length !== 6) ? 'rgba(0,201,122,0.25)' : 'linear-gradient(135deg, #00C97A 0%, #00A862 100%)',
                  color: '#000', fontWeight: 700, padding: '15px', borderRadius: '13px', fontSize: '15px',
                  border: 'none', cursor: (loading || otp.join('').length !== 6) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(0,201,122,0.3), 0 1px 0 rgba(255,255,255,0.2) inset',
                  transition: 'all 0.15s ease', letterSpacing: '-0.01em',
                }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                  Verify & Continue <ArrowRight className="w-4 h-4" />
                </>}
              </button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-white/30 text-xs">Resend in {resendTimer}s</p>
                ) : (
                  <button onClick={handleResend} className="flex items-center gap-1.5 mx-auto text-white/50 hover:text-white/80 text-xs transition">
                    <RotateCcw className="w-3 h-3" /> Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP: DONE ────────────────────────────────── */}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-center">
                <h2 className="text-white font-bold text-xl">Verified!</h2>
                <p className="text-white/40 text-sm mt-1">Setting up your account…</p>
              </div>
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            </div>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          India&apos;s Crop Discovery Map — Free for all farmers
        </p>
      </div>
    </div>
  )
}
