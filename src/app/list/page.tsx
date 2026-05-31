'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'
import { CATEGORY_CONFIG, CROP_TAXONOMY, QUANTITY_UNITS, INDIAN_STATES } from '@/lib/constants'
import { lookupPincode } from '@/lib/api'
import { CropCategory } from '@/lib/types'
import PageLayout from '@/components/ui/PageLayout'
import {
  ImagePlus, X, Leaf, Check, ChevronDown,
  Loader2, CheckCircle2, AlertCircle
} from 'lucide-react'

const GeoTagPicker = dynamic(() => import('@/components/listings/GeoTagPicker'), { ssr: false })

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as CropCategory[]

type OrganicStatus = 'yes' | 'no' | 'in_transition'

export default function ListPage() {
  const router = useRouter()
  const { user, activeRole, farmerProfile, addListing } = useAuthStore()

  const [category, setCategory] = useState<CropCategory | null>(null)
  const [cropSearch, setCropSearch] = useState('')
  const [cropName, setCropName] = useState('')
  const [variety, setVariety] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState<'kg' | 'quintal' | 'tonne'>('quintal')
  const [price, setPrice] = useState('')
  const [organic, setOrganic] = useState<OrganicStatus>('no')
  const [images, setImages] = useState<string[]>([])
  const [geoTag, setGeoTag] = useState<{ lat: number; lng: number } | null>(null)
  const [pincode, setPincode] = useState('')
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [harvestDate, setHarvestDate] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  // Auth guard
  useEffect(() => {
    if (!user) router.replace('/auth')
    else if (activeRole !== 'farmer') router.replace('/')
  }, [user, activeRole, router])

  // Auto-geocode when a valid 6-digit pincode is entered
  useEffect(() => {
    if (!/^\d{6}$/.test(pincode)) return
    setPincodeLoading(true)
    lookupPincode(pincode).then(result => {
      if (result && !geoTag) {
        // Try to geocode the district to auto-set the map
        import('@/lib/api').then(({ geocodeLocation }) => {
          geocodeLocation(`${result.district}, ${result.state}`).then(geo => {
            if (geo) setGeoTag({ lat: geo.lat, lng: geo.lng })
          })
        })
      }
      setPincodeLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincode])

  const suggestions = category && cropSearch.length > 0
    ? CROP_TAXONOMY[category].filter(c => c.toLowerCase().includes(cropSearch.toLowerCase()))
    : category ? CROP_TAXONOMY[category].slice(0, 8) : []

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.slice(0, 5 - images.length).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        if (ev.target?.result) setImages(p => [...p, ev.target!.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const validate = useCallback(() => {
    const e: Record<string, string> = {}
    if (!category) e.category = 'Select a crop category'
    if (!cropName.trim()) e.cropName = 'Select or enter crop name'
    if (!quantity || isNaN(+quantity) || +quantity <= 0) e.quantity = 'Enter valid quantity'
    if (!geoTag) e.geoTag = 'Pin your farm location on the map'
    setErrors(e)
    return Object.keys(e).length === 0
  }, [category, cropName, quantity, geoTag])

  const handleSubmit = async () => {
    if (!validate() || !farmerProfile || !geoTag || !category) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1000))

    addListing({
      crop_category: category,
      crop_name: cropName,
      crop_variety: variety || undefined,
      quantity: +quantity,
      unit,
      expected_price: price ? +price : undefined,
      price_unit: price ? `₹/${unit}` : undefined,
      is_organic: organic === 'yes',
      images,
      latitude: geoTag.lat,
      longitude: geoTag.lng,
      harvest_date: harvestDate || undefined,
      farmer: farmerProfile,
    })

    setSubmitting(false)
    setDone(true)
    setTimeout(() => router.push('/dashboard/farmer'), 1500)
  }

  const inputCls = (field: string) =>
    `w-full bg-white/5 border ${errors[field] ? 'border-red-500/40' : 'border-white/10 focus:border-emerald-500/40'} rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none transition`

  if (done) {
    return (
      <div className="min-h-screen bg-[#060914] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-2xl">Crop Listed! 🎉</h2>
            <p className="text-white/40 text-sm mt-2">Your listing is now live on the map</p>
          </div>
          <p className="text-white/25 text-xs">Redirecting to dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <PageLayout
      title="List Your Crop"
      subtitle="Add your crop to India's crop map — buyers will find you"
      backHref="/"
      maxWidth="lg"
    >
      <div className="space-y-6 pb-12">

        {/* ── STEP 1: Category ───────────────────────────────── */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center">1</div>
            <h2 className="text-white font-bold">Crop Category</h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {ALL_CATEGORIES.map(cat => {
              const config = CATEGORY_CONFIG[cat]
              const active = category === cat
              return (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setCropName(''); setCropSearch(''); setErrors(e => ({ ...e, category: '' })) }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-150 text-center ${
                    active ? 'border-transparent' : 'border-white/6 hover:border-white/15 hover:bg-white/3'
                  }`}
                  style={active ? { background: `${config.mapColor}18`, borderColor: `${config.mapColor}40` } : {}}
                >
                  <span className="text-2xl">{config.emoji}</span>
                  <span className={`text-[11px] font-medium leading-tight ${active ? 'text-white' : 'text-white/50'}`}>
                    {config.label}
                  </span>
                </button>
              )
            })}
          </div>
          {errors.category && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.category}</p>}
        </div>

        {/* ── STEP 2: Crop Details ───────────────────────────── */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center">2</div>
            <h2 className="text-white font-bold">Crop Details</h2>
          </div>

          {/* Crop name search */}
          <div className="relative">
            <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1.5">Crop Name *</label>
            <input
              value={cropSearch || cropName}
              onChange={e => {
                setCropSearch(e.target.value)
                setCropName(e.target.value)
                setErrors(er => ({ ...er, cropName: '' }))
              }}
              placeholder={category ? `Search ${CATEGORY_CONFIG[category]?.label} crops…` : 'Select a category first'}
              disabled={!category}
              className={inputCls('cropName') + ' disabled:opacity-40 disabled:cursor-not-allowed'}
            />
            {cropName && !suggestions.includes(cropName) && (
              <p className="text-white/30 text-xs mt-1">Custom crop name — that&apos;s fine too</p>
            )}
            {suggestions.length > 0 && cropSearch && (
              <div className="absolute z-20 top-full mt-1 left-0 right-0 glass-panel py-1 max-h-40 overflow-y-auto scrollbar-thin">
                {suggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => { setCropName(s); setCropSearch(s); setErrors(er => ({ ...er, cropName: '' })) }}
                    className="w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {errors.cropName && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cropName}</p>}
          </div>

          {/* Variety */}
          <div>
            <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1.5">Variety <span className="text-white/20 normal-case font-normal">(optional)</span></label>
            <input value={variety} onChange={e => setVariety(e.target.value)}
              placeholder="e.g. Sharbati, Basmati, Kurnool…" className={inputCls('variety')} />
          </div>

          {/* Quantity + Unit */}
          <div>
            <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1.5">Quantity Available *</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={quantity}
                onChange={e => { setQuantity(e.target.value); setErrors(er => ({ ...er, quantity: '' })) }}
                placeholder="500"
                min="0"
                className={inputCls('quantity') + ' flex-1'}
              />
              <div className="relative">
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value as typeof unit)}
                  className="appearance-none h-full bg-white/5 border border-white/10 focus:border-emerald-500/40 rounded-xl px-4 pr-8 text-white text-sm outline-none cursor-pointer transition"
                >
                  {QUANTITY_UNITS.map(u => <option key={u} value={u} className="bg-[#0f1320]">{u}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
              </div>
            </div>
            {errors.quantity && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.quantity}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Expected Price <span className="text-white/20 normal-case font-normal">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">₹</span>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder={`per ${unit}`}
                className={inputCls('price') + ' pl-8'}
              />
            </div>
          </div>

          {/* Organic */}
          <div>
            <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-2">
              <Leaf className="w-3 h-3 inline text-emerald-400 mr-1" />
              Organic Status *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { v: 'yes', label: 'Organic', emoji: '🌿', color: '#10b981' },
                { v: 'in_transition', label: 'In Transition', emoji: '🔄', color: '#f59e0b' },
                { v: 'no', label: 'Conventional', emoji: '🏭', color: '#6b7280' },
              ] as const).map(({ v, label, emoji, color }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setOrganic(v)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition-all duration-150 ${
                    organic === v ? 'border-transparent' : 'border-white/6 hover:border-white/15'
                  }`}
                  style={organic === v ? { background: `${color}18`, borderColor: `${color}40` } : {}}
                >
                  <span className="text-xl">{emoji}</span>
                  <span className={`text-xs font-medium ${organic === v ? 'text-white' : 'text-white/45'}`}>{label}</span>
                  {organic === v && <Check className="w-3 h-3" style={{ color }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Harvest date */}
          <div>
            <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Harvest Ready Date <span className="text-white/20 normal-case font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={harvestDate}
              onChange={e => setHarvestDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={inputCls('harvestDate') + ' [color-scheme:dark]'}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Additional Notes <span className="text-white/20 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Any extra details for buyers — delivery availability, payment terms, etc."
              className={inputCls('notes') + ' resize-none'}
            />
          </div>
        </div>

        {/* ── STEP 3: Photos ──────────────────────────────────── */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center">3</div>
            <h2 className="text-white font-bold">Crop Photos</h2>
            <span className="text-white/30 text-xs ml-1">up to 5 — buyers trust verified images</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                <Image src={img} alt={`crop-${i}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(p => p.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-white/15 hover:border-emerald-500/40 hover:bg-emerald-500/5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-150">
                <ImagePlus className="w-5 h-5 text-white/30" />
                <span className="text-white/30 text-xs">Add photo</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>
        </div>

        {/* ── STEP 4: Geo Tag ─────────────────────────────────── */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center">4</div>
            <h2 className="text-white font-bold">Farm Location *</h2>
            <span className="text-white/30 text-xs ml-1">tap map or use GPS</span>
          </div>

          {/* Optional pincode for quick location auto-fill */}
          <div>
            <label className="text-white/40 text-xs font-semibold uppercase tracking-wider block mb-1.5">
              Pincode <span className="text-white/20 normal-case font-normal">(optional — auto-sets map location)</span>
            </label>
            <div className="relative">
              <input
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="e.g. 500001"
                maxLength={6}
                className={inputCls('pincode')}
              />
              {pincodeLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400 animate-spin" />
              )}
            </div>
          </div>

          <GeoTagPicker value={geoTag} onChange={c => { setGeoTag(c); setErrors(e => ({ ...e, geoTag: '' })) }} />
          {errors.geoTag && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{errors.geoTag}
            </p>
          )}
        </div>

        {/* ── SUBMIT ──────────────────────────────────────────── */}
        <div className="glass-panel p-6">
          <div className="flex items-start gap-3 mb-5 bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-4">
            <span className="text-emerald-400 text-lg">🗺️</span>
            <div>
              <p className="text-white/80 text-sm font-medium">Your listing goes live immediately</p>
              <p className="text-white/35 text-xs mt-0.5">It will appear as a pin on India&apos;s crop map. Auto-expires in 30 days — you&apos;ll get a reminder before that.</p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black font-bold py-4 rounded-xl text-base transition-all duration-150 active:scale-98 shadow-lg shadow-emerald-500/25"
          >
            {submitting
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Publishing listing…</>
              : <><Check className="w-5 h-5" strokeWidth={2.5} /> Publish to Map</>}
          </button>
        </div>
      </div>
    </PageLayout>
  )
}
