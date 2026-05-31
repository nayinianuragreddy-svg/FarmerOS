'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sprout, Phone, ArrowRight, RotateCcw, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

type Step = 'phone' | 'otp' | 'done'

const MOCK_OTP = '123456'

export default function AuthPage() {
  const router = useRouter()
  const { user, login } = useAuthStore()
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
    await new Promise(r => setTimeout(r, 900)) // simulate network
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
    await new Promise(r => setTimeout(r, 800))
    if (code !== MOCK_OTP) {
      setLoading(false)
      setError('Incorrect OTP. (Hint: use 123456)')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
      return
    }
    login(phone)
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
    <div className="min-h-screen bg-[#060914] flex flex-col items-center justify-center px-4 py-12">

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #10b981 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/25 transition">
            <Sprout className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-white font-bold text-xl">FarmerOS</span>
        </Link>

        {/* Card */}
        <div className="glass-panel p-7">

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
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black font-bold py-3.5 rounded-xl text-sm transition-all duration-150 active:scale-98 shadow-lg shadow-emerald-500/20"
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
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold py-3.5 rounded-xl text-sm transition-all duration-150 active:scale-98 shadow-lg shadow-emerald-500/20"
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
