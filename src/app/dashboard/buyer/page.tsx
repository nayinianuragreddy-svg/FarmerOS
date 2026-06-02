'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { MOCK_PINS } from '@/lib/mock-data'
import { CATEGORY_CONFIG } from '@/lib/constants'
import { CropCategory } from '@/lib/types'
import PageLayout from '@/components/ui/PageLayout'
import StatsCard from '@/components/ui/StatsCard'
import {
  Bookmark, Star, SlidersHorizontal, MapPin,
  Heart, Check, Scale, Leaf, Phone
} from 'lucide-react'

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as CropCategory[]

interface RateModal {
  listingId: string
  cropName: string
  farmerName: string
}

export default function BuyerDashboard() {
  const router = useRouter()
  const { user, activeRole, buyerProfile, savedListingIds, toggleSaved, updatePreferredCrops, addRating } = useAuthStore()

  const [rateModal, setRateModal] = useState<RateModal | null>(null)
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')
  const [rateDone, setRateDone] = useState<string[]>([])

  useEffect(() => {
    if (!user) router.replace('/auth')
    else if (activeRole !== 'buyer') router.replace('/')
  }, [user, activeRole, router])

  // Saved listings from mock data
  const savedPins = MOCK_PINS.filter(p => savedListingIds.includes(p.id))
  const preferred = (buyerProfile?.preferred_crops ?? []) as CropCategory[]

  const togglePreferred = (cat: CropCategory) => {
    const next = preferred.includes(cat)
      ? preferred.filter(c => c !== cat)
      : [...preferred, cat]
    updatePreferredCrops(next)
  }

  const submitRating = () => {
    if (!rateModal || stars === 0) return
    addRating({
      listing_id: rateModal.listingId,
      crop_name: rateModal.cropName,
      buyer_name: buyerProfile?.name || 'Anonymous',
      stars,
      comment: comment.trim() || undefined,
    })
    setRateDone(r => [...r, rateModal.listingId])
    setRateModal(null)
    setStars(0)
    setComment('')
  }

  return (
    <PageLayout
      title={`Hello, ${buyerProfile?.name?.split(' ')[0] || 'Buyer'} 👋`}
      subtitle={`${buyerProfile?.district}, ${buyerProfile?.state} · Buyer account`}
      maxWidth="xl"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <StatsCard icon={Bookmark}         label="Saved Crops"       value={savedListingIds.length} sub="from the map"        accent="#10b981" />
        <StatsCard icon={Heart}            label="Preferred Types"   value={preferred.length}       sub="crop categories"    accent="#f43f5e" />
        <StatsCard icon={Star}             label="Ratings Given"     value={rateDone.length}        sub="transactions rated" accent="#f59e0b" />
      </div>

      {/* Quick link */}
      <div className="mb-8">
        <Link href="/"
          className="flex items-center gap-2 glass-panel hover:border-emerald-500/30 hover:bg-emerald-500/5 px-5 py-3 rounded-xl text-sm text-white/70 hover:text-white transition w-fit">
          🗺️ Back to Crop Map — discover more
        </Link>
      </div>

      {/* Saved listings */}
      <section className="mb-10">
        <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
          <Bookmark className="w-5 h-5 text-emerald-400" />
          Saved Crops
          {savedPins.length > 0 && (
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">{savedPins.length}</span>
          )}
        </h2>

        {savedPins.length === 0 ? (
          <div className="glass-panel p-10 text-center">
            <span className="text-5xl">🗺️</span>
            <p className="text-white/50 text-sm mt-3 font-medium">No saved crops yet</p>
            <p className="text-white/25 text-xs mt-1">Click any crop pin on the map and save it here</p>
            <Link href="/"
              className="inline-flex items-center gap-2 mt-4 glass-panel hover:border-emerald-500/30 px-5 py-2.5 rounded-xl text-sm text-white/70 hover:text-white transition">
              Open the map
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPins.map(pin => {
              const config = CATEGORY_CONFIG[pin.crop_category]
              const alreadyRated = rateDone.includes(pin.id)
              return (
                <div key={pin.id} className="glass-panel overflow-hidden hover:border-white/15 transition">
                  {/* Image */}
                  <div className="relative h-28 overflow-hidden flex items-center justify-center text-4xl"
                    style={{ background: `${config.mapColor}12` }}>
                    {config.emoji}
                    <button
                      onClick={() => toggleSaved(pin.id)}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-500/70 rounded-full flex items-center justify-center transition"
                      title="Unsave"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-white fill-white" />
                    </button>
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ background: `${config.mapColor}cc` }}>
                      {config.emoji} {config.label}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <div>
                      <h3 className="text-white font-bold text-sm">{pin.crop_name}</h3>
                      <div className="flex items-center gap-1 text-white/35 text-xs mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {pin.district}, {pin.state}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 text-white/50">
                        <Scale className="w-3 h-3" />
                        <span className="text-white font-medium">{pin.quantity}</span> {pin.unit}
                      </div>
                      {pin.is_organic && (
                        <span className="flex items-center gap-0.5 text-emerald-400">
                          <Leaf className="w-3 h-3" /> Organic
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 pt-1 border-t border-white/6">
                      {pin.farmer_phone ? (
                        <a href={`tel:${pin.farmer_phone}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition">
                          <Phone className="w-3 h-3" /> Call Farmer
                        </a>
                      ) : (
                        <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 text-white/30 text-xs">
                          Login to call
                        </div>
                      )}
                      {alreadyRated ? (
                        <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                          <Check className="w-3 h-3" /> Rated
                        </div>
                      ) : (
                        <button
                          onClick={() => setRateModal({ listingId: pin.id, cropName: pin.crop_name, farmerName: pin.district })}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/20 border border-white/8 text-white/40 hover:text-amber-400 text-xs transition"
                        >
                          <Star className="w-3 h-3" /> Rate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Preferred crops */}
      <section>
        <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-2">
          <SlidersHorizontal className="w-5 h-5 text-white/60" />
          My Preferred Crop Types
        </h2>
        <p className="text-white/30 text-sm mb-4">These are highlighted for you on the map</p>

        <div className="glass-panel p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {ALL_CATEGORIES.map(cat => {
              const config = CATEGORY_CONFIG[cat]
              const sel = preferred.includes(cat)
              return (
                <button
                  key={cat}
                  onClick={() => togglePreferred(cat)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-150 text-center ${
                    sel ? 'border-transparent' : 'border-white/6 hover:border-white/12 hover:bg-white/3'
                  }`}
                  style={sel ? { background: `${config.mapColor}18`, borderColor: `${config.mapColor}40` } : {}}
                >
                  <span className="text-2xl">{config.emoji}</span>
                  <span className={`text-[10px] font-medium leading-tight ${sel ? 'text-white' : 'text-white/45'}`}>
                    {config.label}
                  </span>
                  {sel && <div className="w-1.5 h-1.5 rounded-full" style={{ background: config.mapColor }} />}
                </button>
              )
            })}
          </div>
          {preferred.length > 0 && (
            <p className="text-center text-emerald-400 text-xs mt-3 font-medium">
              {preferred.length} categories selected
            </p>
          )}
        </div>
      </section>

      {/* Rate modal */}
      {rateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel p-6 w-full max-w-sm space-y-5">
            <div>
              <h3 className="text-white font-bold text-lg">Rate this Crop</h3>
              <p className="text-white/40 text-sm mt-0.5">{rateModal.cropName} from {rateModal.farmerName}</p>
            </div>

            {/* Star picker */}
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setStars(s)}
                  className="transition-transform hover:scale-110 active:scale-95">
                  <Star className={`w-9 h-9 transition ${s <= stars ? 'fill-amber-400 text-amber-400' : 'text-white/15 hover:text-amber-400/50'}`} />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="Share your experience (optional)"
              className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/40 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none transition resize-none"
            />

            <div className="flex gap-3">
              <button onClick={() => { setRateModal(null); setStars(0); setComment('') }}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm transition">
                Cancel
              </button>
              <button
                onClick={submitRating}
                disabled={stars === 0}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold text-sm transition active:scale-95">
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
