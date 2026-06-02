'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import PageLayout from '@/components/ui/PageLayout'
import StatsCard from '@/components/ui/StatsCard'
import ListingCard from '@/components/listings/ListingCard'
import {
  Plus, LayoutGrid, EyeOff, Star, AlertTriangle,
  PackageCheck, Clock, Sprout, TrendingUp
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { getMandiPriceSync } from '@/lib/api'
import { fetchMandiSnapshot, type CommoditySnapshot, commodityEmoji, prettyCommodity } from '@/lib/mandi'

const WeatherWidget = dynamic(() => import('@/components/dashboard/WeatherWidget'), { ssr: false })

function daysUntil(dateStr: string) {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000))
}

export default function FarmerDashboard() {
  const router = useRouter()
  const { user, activeRole, farmerProfile, myListings, hideListing, renewListing, deleteListing, ratings } = useAuthStore()

  useEffect(() => {
    if (!user) router.replace('/auth')
    else if (activeRole !== 'farmer') router.replace('/')
  }, [user, activeRole, router])

  // Live national mandi snapshot for price comparisons
  const [snapshot, setSnapshot] = useState<CommoditySnapshot[]>([])
  useEffect(() => { fetchMandiSnapshot().then(s => setSnapshot(s.commodities || [])) }, [])

  // Real weather for the farmer's own district (not a hardcoded city)
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 17.385, lng: 78.486 })
  useEffect(() => {
    const loc = farmerProfile ? `${farmerProfile.district}, ${farmerProfile.state}` : ''
    if (!loc.trim()) return
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc + ' India')}&format=json&limit=1&countrycodes=in`, { headers: { 'Accept-Language': 'en' } })
      .then(r => r.json())
      .then(d => { if (d?.[0]) setCoords({ lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) }) })
      .catch(() => {})
  }, [farmerProfile])

  const findMandi = (cropName: string) => {
    const n = cropName.toLowerCase()
    const firstWord = n.split(/[\s/()-]+/)[0]
    const hit = snapshot.find(c => {
      const cn = c.commodity.toLowerCase()
      return n.includes(cn) || (firstWord.length > 2 && cn.includes(firstWord))
    })
    if (hit) return { price: hit.avgPerKg, unit: 'kg', market: `${hit.bestMarket}, ${hit.bestState}`, change: 0 }
    return getMandiPriceSync(cropName)
  }
  const topCrops = snapshot.slice(0, 4)

  const active  = myListings.filter(l => l.status === 'active')
  const hidden  = myListings.filter(l => l.status === 'hidden')
  const expiring = active.filter(l => daysUntil(l.expires_at) <= 5)
  const avgRating = farmerProfile?.rating_avg ?? 0

  return (
    <PageLayout
      title={`Welcome back, ${farmerProfile?.name?.split(' ')[0] || 'Farmer'} 👋`}
      subtitle={`${farmerProfile?.village}, ${farmerProfile?.district} · ${farmerProfile?.state}`}
      maxWidth="xl"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatsCard icon={LayoutGrid}    label="Active Listings"  value={active.length}         sub="live on the map"    accent="#10b981" />
        <StatsCard icon={PackageCheck}  label="Total Listed"     value={myListings.length}      sub="all time"           accent="#3b82f6" />
        <StatsCard icon={Star}          label="Avg Rating"       value={avgRating > 0 ? avgRating.toFixed(1) + ' ★' : '—'} sub={`${ratings.length} reviews`} accent="#f59e0b" />
        <StatsCard icon={AlertTriangle} label="Expiring Soon"    value={expiring.length}        sub="in the next 5 days" accent="#ef4444" />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/list"
          className="flex items-center gap-2 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-95 shadow-lg"
          style={{ background: '#D4841A', boxShadow: '0 4px 16px rgba(212,132,26,0.3)' }}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} /> List a New Crop
        </Link>
        <Link
          href="/map"
          className="flex items-center gap-2 glass-panel hover:border-white/20 px-5 py-2.5 rounded-xl text-sm text-white/70 hover:text-white transition"
        >
          🗺️ View Full Map
        </Link>
      </div>

      {/* Weather + Mandi Price row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Weather widget */}
        <WeatherWidget
          lat={coords.lat}
          lng={coords.lng}
          cityName={farmerProfile ? `${farmerProfile.village}, ${farmerProfile.district}` : 'Your Farm'}
        />

        {/* Live mandi prices for listed crops */}
        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-white font-bold text-sm">Today&apos;s Mandi Prices</h3>
            <span className="text-white/30 text-xs ml-auto">Agmarknet · Live</span>
          </div>

          {myListings.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/30 text-sm">List a crop to see price comparisons</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myListings.slice(0, 5).map(listing => {
                const mandi = findMandi(listing.crop_name)
                const yourPrice = listing.expected_price
                const diff = yourPrice && mandi ? Math.round(((yourPrice - mandi.price) / mandi.price) * 100) : null

                return (
                  <div key={listing.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/4">
                    <span className="text-base flex-shrink-0">
                      {listing.crop_name.includes('Tomato') ? '🍅' :
                       listing.crop_name.includes('Wheat') ? '🌾' :
                       listing.crop_name.includes('Rice') ? '🍚' : '🌱'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{listing.crop_name}</p>
                      {mandi ? (
                        <p className="text-white/40 text-[11px]">
                          Mandi: ₹{mandi.price}/{mandi.unit} · {mandi.market}
                        </p>
                      ) : (
                        <p className="text-white/30 text-[11px]">No mandi data available</p>
                      )}
                    </div>
                    {diff !== null && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        diff >= 0
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}>
                        {diff >= 0 ? '+' : ''}{diff}%
                      </span>
                    )}
                    {!yourPrice && mandi && (
                      <span className="text-white/30 text-[11px]">No price set</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Most-traded crops today (live) */}
          <div className="border-t border-white/8 pt-3">
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-2">Today&apos;s Mandi Prices · Live</p>
            <div className="flex flex-wrap gap-1.5">
              {topCrops.map(c => (
                <span key={c.commodity}
                  className="text-[11px] px-2 py-1 rounded-full font-medium bg-emerald-500/12 text-emerald-400">
                  {commodityEmoji(c.commodity)} {prettyCommodity(c.commodity)} ₹{c.avgPerKg}/kg
                </span>
              ))}
              {topCrops.length === 0 && (
                <span className="text-white/30 text-[11px]">Loading live prices…</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expiry alerts */}
      {expiring.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl border border-amber-500/25 bg-amber-500/8">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-300 font-semibold text-sm">
                {expiring.length} listing{expiring.length > 1 ? 's' : ''} expiring soon
              </p>
              <p className="text-amber-300/50 text-xs mt-0.5">Renew them to keep them visible on the map.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {expiring.map(l => (
                  <button
                    key={l.id}
                    onClick={() => renewListing(l.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/25 transition"
                  >
                    ↺ Renew &ldquo;{l.crop_name}&rdquo; ({daysUntil(l.expires_at)}d left)
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active listings */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            Active Listings
            {active.length > 0 && (
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">{active.length}</span>
            )}
          </h2>
        </div>

        {active.length === 0 ? (
          <div className="glass-panel p-10 text-center">
            <span className="text-5xl">🌱</span>
            <p className="text-white/50 text-sm mt-3 font-medium">No active listings yet</p>
            <p className="text-white/25 text-xs mt-1">List your first crop — it takes under 3 minutes</p>
            <Link href="/list" className="inline-flex items-center gap-2 mt-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20">
              <Plus className="w-4 h-4" /> List your first crop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map(l => (
              <ListingCard
                key={l.id}
                listing={l}
                mode="farmer"
                onHide={hideListing}
                onRenew={renewListing}
                onDelete={deleteListing}
              />
            ))}
          </div>
        )}
      </section>

      {/* Hidden listings */}
      {hidden.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <EyeOff className="w-5 h-5 text-white/30" />
            <h2 className="text-white/60 font-bold text-lg">Hidden from Map</h2>
            <span className="bg-white/10 text-white/40 text-xs font-bold px-2 py-0.5 rounded-full">{hidden.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hidden.map(l => (
              <ListingCard
                key={l.id}
                listing={l}
                mode="farmer"
                onRenew={renewListing}
                onDelete={deleteListing}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent ratings */}
      {ratings.length > 0 && (
        <section>
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            Recent Ratings
          </h2>
          <div className="space-y-3">
            {ratings.slice(0, 5).map(r => (
              <div key={r.id} className="glass-panel p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">👤</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{r.buyer_name}</span>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= r.stars ? 'fill-amber-400 text-amber-400' : 'text-white/15'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-white/35 text-xs mt-0.5">for {r.crop_name}</p>
                  {r.comment && <p className="text-white/55 text-sm mt-1.5 leading-snug">&ldquo;{r.comment}&rdquo;</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </PageLayout>
  )
}
