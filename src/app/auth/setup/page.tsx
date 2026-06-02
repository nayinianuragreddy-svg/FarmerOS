'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sprout, Loader2, Check } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { INDIAN_STATES, CATEGORY_CONFIG } from '@/lib/constants'
import { CropCategory } from '@/lib/types'
import { lookupPincode } from '@/lib/api'

type Role = 'farmer' | 'buyer'
type SetupStep = 'role' | 'info' | 'crops' | 'done'

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as CropCategory[]

export default function SetupPage() {
  const router = useRouter()
  const { user, setFarmerProfile, setBuyerProfile, markProfileComplete } = useAuthStore()
  const [step, setStep] = useState<SetupStep>('role')
  const [role, setRole] = useState<Role>('buyer')
  const [loading, setLoading] = useState(false)
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [preferredCrops, setPreferredCrops] = useState<CropCategory[]>([])

  const [form, setForm] = useState({
    name: '', village: '', mandal: '', district: '', state: 'Telangana', pincode: '',
  })

  useEffect(() => { if (!user) router.replace('/auth') }, [user, router])

  // Auto-fill district and state when a valid 6-digit pincode is entered
  useEffect(() => {
    if (!/^\d{6}$/.test(form.pincode)) return
    setPincodeLoading(true)
    lookupPincode(form.pincode).then(result => {
      if (result) {
        setForm(f => ({ ...f, district: result.district, state: result.state }))
        setErrors(e => ({ ...e, district: '', state: '' }))
      }
      setPincodeLoading(false)
    })
  }, [form.pincode])

  const setF = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const validateInfo = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.village.trim()) e.village = 'Village is required'
    if (!form.district.trim()) e.district = 'District is required'
    if (!form.state) e.state = 'State is required'
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter valid 6-digit pincode'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleInfoNext = () => {
    if (!validateInfo()) return
    if (role === 'buyer') setStep('crops')
    else handleSubmit()
  }

  const handleSubmit = async () => {
    if (!user) return
    setLoading(true)

    const profile = role === 'farmer'
      ? { ...form }
      : { ...form, preferred_crops: preferredCrops }

    // Save to Supabase
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, profile, user_id: user.id }),
    })

    // Update local store
    if (role === 'farmer') {
      setFarmerProfile({ ...form })
    } else {
      setBuyerProfile({ ...form, preferred_crops: preferredCrops })
    }
    markProfileComplete()
    setStep('done')
    setLoading(false)
    setTimeout(() => router.replace(`/dashboard/${role}`), 900)
  }

  const toggleCrop = (c: CropCategory) =>
    setPreferredCrops(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])

  const inputCls = (field: string) =>
    `app-field ${errors[field] ? 'app-field-error' : ''}`

  return (
    <div className="min-h-screen bg-[#070C0A] flex flex-col items-center justify-center px-4 py-12">
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, #10b981, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Sprout className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <span className="text-white font-bold text-lg">FarmerOS</span>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['role', 'info', ...(role === 'buyer' ? ['crops'] : []), 'done'] as SetupStep[]).map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                s === step ? 'bg-emerald-400 w-4' :
                arr.indexOf(step) > i ? 'bg-emerald-500/60' : 'bg-white/15'
              }`} />
            </div>
          ))}
        </div>

        <div className="glass-panel p-7">

          {/* ── ROLE SELECTION ─────────────────────────── */}
          {step === 'role' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-white font-bold text-2xl">I am a…</h1>
                <p className="text-white/40 text-sm mt-1">Choose your primary role on FarmerOS</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {([
                  { r: 'farmer' as Role, emoji: '🌾', title: 'Farmer', desc: 'I grow crops and want to list them for buyers to find' },
                  { r: 'buyer' as Role, emoji: '🛒', title: 'Buyer', desc: 'I want to discover and buy fresh crops directly from farmers' },
                ] as const).map(({ r, emoji, title, desc }) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex flex-col items-center text-center gap-3 p-5 rounded-2xl border transition-all duration-200 ${
                      role === r
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-4xl">{emoji}</span>
                    <div>
                      <p className={`font-bold text-sm ${role === r ? 'text-emerald-400' : 'text-white/70'}`}>{title}</p>
                      <p className="text-white/30 text-xs mt-1 leading-snug">{desc}</p>
                    </div>
                    {role === r && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-black" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <p className="text-white/25 text-xs text-center">You can switch roles anytime from your profile</p>

              <button
                onClick={() => setStep('info')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                Continue as {role === 'farmer' ? 'Farmer' : 'Buyer'} →
              </button>
            </div>
          )}

          {/* ── INFO FORM ──────────────────────────────── */}
          {step === 'info' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-white font-bold text-2xl">Your Details</h1>
                <p className="text-white/40 text-sm mt-1">Help farmers and buyers find you</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1.5">Full Name *</label>
                  <input value={form.name} onChange={e => setF('name', e.target.value)}
                    placeholder="Rajesh Kumar" className={inputCls('name')} />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1.5">Village *</label>
                    <input value={form.village} onChange={e => setF('village', e.target.value)}
                      placeholder="Kothapalli" className={inputCls('village')} />
                    {errors.village && <p className="text-red-400 text-xs mt-1">{errors.village}</p>}
                  </div>
                  <div>
                    <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1.5">Mandal</label>
                    <input value={form.mandal} onChange={e => setF('mandal', e.target.value)}
                      placeholder="Mandal" className={inputCls('mandal')} />
                  </div>
                </div>

                <div>
                  <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1.5">District *</label>
                  <input value={form.district} onChange={e => setF('district', e.target.value)}
                    placeholder="Nalgonda" className={inputCls('district')} />
                  {errors.district && <p className="text-red-400 text-xs mt-1">{errors.district}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1.5">State *</label>
                    <select value={form.state} onChange={e => setF('state', e.target.value)}
                      className={inputCls('state') + ' cursor-pointer'}>
                      {INDIAN_STATES.map(s => <option key={s} value={s} className="bg-[#0f1320]">{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1.5">Pincode *</label>
                    <div className="relative">
                      <input value={form.pincode} onChange={e => setF('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="500001" className={inputCls('pincode')} maxLength={6} />
                      {pincodeLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      )}
                    </div>
                    {errors.pincode && <p className="text-red-400 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep('role')}
                  className="flex-1 py-3.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm font-medium transition">
                  Back
                </button>
                <button onClick={handleInfoNext} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black font-bold py-3.5 rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (role === 'farmer' ? 'Finish Setup' : 'Next →')}
                </button>
              </div>
            </div>
          )}

          {/* ── PREFERRED CROPS (buyer only) ───────────── */}
          {step === 'crops' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-white font-bold text-2xl">What do you buy?</h1>
                <p className="text-white/40 text-sm mt-1">We&apos;ll highlight these on the map for you</p>
              </div>

              <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
                {ALL_CATEGORIES.map(cat => {
                  const config = CATEGORY_CONFIG[cat]
                  const sel = preferredCrops.includes(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCrop(cat)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-150 ${
                        sel ? 'border-transparent' : 'border-white/6 hover:border-white/15 hover:bg-white/3'
                      }`}
                      style={sel ? { background: `${config.mapColor}18`, borderColor: `${config.mapColor}40` } : {}}
                    >
                      <span className="text-2xl">{config.emoji}</span>
                      <span className={`text-[11px] font-medium leading-tight ${sel ? 'text-white' : 'text-white/50'}`}>
                        {config.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {preferredCrops.length > 0 && (
                <p className="text-emerald-400 text-xs text-center">{preferredCrops.length} categories selected</p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('info')}
                  className="flex-1 py-3.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm font-medium transition">
                  Back
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black font-bold py-3.5 rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finish Setup 🎉'}
                </button>
              </div>
            </div>
          )}

          {/* ── DONE ───────────────────────────────────── */}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-5 py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <span className="text-3xl">{role === 'farmer' ? '🌾' : '🛒'}</span>
              </div>
              <div className="text-center">
                <h2 className="text-white font-bold text-xl">Welcome to FarmerOS!</h2>
                <p className="text-white/40 text-sm mt-1">
                  {role === 'farmer' ? 'Ready to list your first crop.' : 'Ready to discover fresh crops near you.'}
                </p>
              </div>
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
