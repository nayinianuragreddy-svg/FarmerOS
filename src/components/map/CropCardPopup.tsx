'use client'

import { useEffect, useRef } from 'react'
import { X, MapPin, Scale, Leaf, Star, Phone, Lock } from 'lucide-react'
import { MapPin as MapPinType } from '@/lib/types'
import { CATEGORY_CONFIG } from '@/lib/constants'
import Link from 'next/link'

interface Props {
  pin: MapPinType
  position: { x: number; y: number }
  isLoggedIn: boolean
  onClose: () => void
}

export default function CropCardPopup({ pin, position, isLoggedIn, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const config = CATEGORY_CONFIG[pin.crop_category]

  // Adjust popup so it stays within viewport
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    let left = position.x - rect.width / 2
    if (left < 8) left = 8
    if (left + rect.width > vw - 8) left = vw - rect.width - 8
    el.style.left = `${left}px`
    el.style.top = `${position.y - rect.height - 12}px`
  }, [position])

  return (
    <div
      ref={ref}
      className="absolute z-50 w-72 bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
      style={{ position: 'fixed', top: position.y - 12, left: position.x }}
      onClick={e => e.stopPropagation()}
    >
      {/* Image strip */}
      <div className="relative h-36 bg-white/5">
        {pin.images.length > 0 ? (
          <img
            src={pin.images[0]}
            alt={pin.crop_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {config.emoji}
          </div>
        )}
        {/* Category badge */}
        <span
          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: config.mapColor }}
        >
          {config.emoji} {config.label}
        </span>
        {/* Organic badge */}
        {pin.is_organic && (
          <span className="absolute top-2 right-10 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-white flex items-center gap-1">
            <Leaf className="w-3 h-3" /> Organic
          </span>
        )}
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-bold text-lg leading-tight">{pin.crop_name}</h3>
          <div className="flex items-center gap-1 mt-0.5 text-white/50 text-xs">
            <MapPin className="w-3 h-3" />
            {pin.district}, {pin.state}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-white/70">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-white">{pin.quantity}</span>
            <span className="text-white/50">{pin.unit}</span>
          </div>
          {pin.rating_avg > 0 && (
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-semibold text-sm">{pin.rating_avg.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-3">
          {isLoggedIn ? (
            <div className="space-y-1.5">
              <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Farmer Contact</p>
              <p className="text-white font-semibold">{pin.farmer_name}</p>
              {pin.farmer_village && (
                <p className="text-white/50 text-sm">{pin.farmer_village}</p>
              )}
              {pin.farmer_phone && (
                <a
                  href={`tel:${pin.farmer_phone}`}
                  className="flex items-center gap-2 mt-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl px-3 py-2 text-sm font-medium transition"
                >
                  <Phone className="w-4 h-4" />
                  {pin.farmer_phone}
                </a>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center justify-center gap-2 w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
            >
              <Lock className="w-4 h-4" />
              Login to see farmer contact
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
