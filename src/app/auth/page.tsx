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
    <div style={{ minHeight: '100vh', background: '#070C0A', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes authGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes authFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
      `}</style>

      {/* Background — deep, layered */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,201,122,0.12) 0%, transparent 60%)', filter: 'blur(80px)', animation: 'authGlow 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,120,70,0.08) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        {/* Grain texture */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: '128px' }} />
      </div>

      {/* Left panel — context, desktop only */}
      <div style={{ display: 'none', flex: '0 0 420px', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', borderRight: '1px solid rgba(255,255,255,0.04)', position: 'relative' }} className="auth-left-panel">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,201,122,0.12)', border: '1px solid rgba(0,201,122,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sprout style={{ width: 18, height: 18, color: '#00C97A' }} />
          </div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em' }}>FarmerOS</span>
        </Link>
        <div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginBottom: 24, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Why farmers use FarmerOS</p>
          {['List crops in 3 minutes', 'Buyers find you — you don\'t chase them', 'See live mandi prices before listing', 'Free forever. No commission.'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,201,122,0.15)', border: '1px solid rgba(0,201,122,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: '#00C97A' }}>✓</span>
              </div>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{t}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Trusted by farmers across India · Free forever</p>
      </div>

      {/* Right panel — the form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', position: 'relative' }}>

        {/* Logo — mobile only (hidden on desktop via left panel) */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', textDecoration: 'none', animation: 'authFadeUp 0.5s ease both' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,201,122,0.12)', border: '1px solid rgba(0,201,122,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,201,122,0.15)' }}>
            <Sprout style={{ width: 18, height: 18, color: '#00C97A' }} />
          </div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em' }}>FarmerOS</span>
        </Link>

        {/* Card */}
        <div style={{
          width: '100%', maxWidth: '380px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,201,122,0.06), 0 0 60px rgba(0,201,122,0.04)',
          backdropFilter: 'blur(20px)',
          animation: 'authFadeUp 0.5s 0.1s ease both',
        }}>

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

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: '12px', marginTop: '24px' }}>
          India&apos;s Crop Discovery Map — Free for all farmers
        </p>
      </div>
    </div>
  )
}
