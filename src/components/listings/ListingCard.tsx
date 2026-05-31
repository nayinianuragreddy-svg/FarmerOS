'use client'

import Image from 'next/image'
import { MapPin, Scale, Star, Leaf, MoreVertical, Eye, EyeOff, RotateCcw, Trash2, Calendar } from 'lucide-react'
import { useState } from 'react'
import { CropListing } from '@/lib/types'
import { CATEGORY_CONFIG } from '@/lib/constants'

interface ListingCardProps {
  listing: CropListing
  mode: 'farmer' | 'buyer'
  onHide?: (id: string) => void
  onRenew?: (id: string) => void
  onDelete?: (id: string) => void
  onUnsave?: (id: string) => void
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function ListingCard({
  listing,
  mode,
  onHide,
  onRenew,
  onDelete,
  onUnsave,
}: ListingCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const config = CATEGORY_CONFIG[listing.crop_category]
  const daysLeft = daysUntil(listing.expires_at)
  const isExpiringSoon = daysLeft <= 5 && listing.status === 'active'
  const isHidden = listing.status === 'hidden'

  return (
    <div className={`glass-panel overflow-hidden transition-all duration-200 ${isHidden ? 'opacity-60' : 'hover:border-white/15'}`}>
      {/* Image */}
      <div className="relative h-32 overflow-hidden" style={{ background: `${config.mapColor}12` }}>
        {listing.images.length > 0 ? (
          <Image src={listing.images[0]} alt={listing.crop_name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">{config.emoji}</div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ background: `${config.mapColor}cc` }}>
            {config.emoji} {config.label}
          </span>
          {listing.is_organic && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white flex items-center gap-0.5">
              <Leaf className="w-2.5 h-2.5" /> Organic
            </span>
          )}
          {isHidden && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/60">Hidden</span>
          )}
        </div>

        {/* Status / expiry */}
        {mode === 'farmer' && listing.status === 'active' && (
          <div className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isExpiringSoon ? 'bg-red-500/80 text-white' : 'bg-black/60 text-white/60'
          }`}>
            {isExpiringSoon ? `⚠️ Expires in ${daysLeft}d` : `${daysLeft}d left`}
          </div>
        )}

        {/* Farmer menu (3-dot) */}
        {mode === 'farmer' && (
          <div className="absolute top-2 right-2">
            <button
              onClick={() => setMenuOpen(m => !m)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
              className="w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white/70 hover:text-white transition"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-36 glass-panel py-1 z-20">
                {listing.status === 'active' && onHide && (
                  <button onClick={() => { onHide(listing.id); setMenuOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition">
                    <EyeOff className="w-3.5 h-3.5" /> Hide listing
                  </button>
                )}
                {listing.status === 'hidden' && onRenew && (
                  <button onClick={() => { onRenew(listing.id); setMenuOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 transition">
                    <Eye className="w-3.5 h-3.5" /> Make active
                  </button>
                )}
                {listing.status === 'active' && onRenew && isExpiringSoon && (
                  <button onClick={() => { onRenew(listing.id); setMenuOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 transition">
                    <RotateCcw className="w-3.5 h-3.5" /> Renew 30 days
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => { if (confirm('Delete this listing?')) { onDelete(listing.id); setMenuOpen(false) } }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition border-t border-white/8">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        <div>
          <h3 className="text-white font-bold text-sm leading-tight">{listing.crop_name}</h3>
          {listing.crop_variety && (
            <p className="text-white/35 text-xs">{listing.crop_variety}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-white/50">
            <Scale className="w-3 h-3" />
            <span className="text-white font-semibold">{listing.quantity.toLocaleString()}</span>
            <span>{listing.unit}</span>
          </div>
          {listing.expected_price && (
            <span className="text-emerald-400 font-semibold">
              ₹{listing.expected_price}/{listing.unit}
            </span>
          )}
        </div>

        {listing.farmer && (
          <div className="flex items-center gap-1 text-xs text-white/35">
            <MapPin className="w-3 h-3" />
            {listing.farmer.district}, {listing.farmer.state}
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-white/6">
          <div className="flex items-center gap-1 text-white/30 text-[11px]">
            <Calendar className="w-3 h-3" />
            {timeAgo(listing.created_at)}
          </div>

          {listing.farmer && listing.farmer.rating_avg > 0 && (
            <div className="flex items-center gap-1 text-amber-400 text-[11px]">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="font-semibold">{listing.farmer.rating_avg.toFixed(1)}</span>
            </div>
          )}

          {mode === 'buyer' && onUnsave && (
            <button onClick={() => onUnsave(listing.id)}
              className="text-[11px] text-white/30 hover:text-red-400 transition">
              Unsave
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
