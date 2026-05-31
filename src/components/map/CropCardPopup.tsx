'use client'

import { useEffect, useRef } from 'react'
import { X, MapPin, Scale, Leaf, Star, Phone, Lock, Calendar } from 'lucide-react'
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

  // Smart repositioning to stay within viewport
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    let left = position.x - rect.width / 2
    let top = position.y - rect.height - 16

    if (left < 12) left = 12
    if (left + rect.width > vw - 12) left = vw - rect.width - 12
    if (top < 70) top = position.y + 16

    el.style.left = `${left}px`
    el.style.top = `${top}px`
  }, [position])

  return (
    <div
      ref={ref}
      className="fixed z-50 w-72 overflow-hidden pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
      style={{
        background: 'rgba(8, 11, 18, 0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        top: position.y,
        left: position.x,
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Image / Hero */}
      <div className="relative h-36 overflow-hidden" style={{ background: `${config.mapColor}15` }}>
        {pin.images.length > 0 ? (
          <img src={pin.images[0]} alt={pin.crop_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-5xl">{config.emoji}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category chip */}
        <div className="absolute top-3 left-3">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: `${config.mapColor}cc` }}
          >
            {config.emoji} {config.label}
          </span>
        </div>

        {/* Organic badge */}
        {pin.is_organic && (
          <div className="absolute top-3 right-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white">
              <Leaf className="w-3 h-3" /> Organic
            </span>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">

        {/* Crop name + location */}
        <div>
          <h3 className="text-white font-bold text-lg leading-tight">{pin.crop_name}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-white/45 text-xs">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{pin.district}, {pin.state}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-white font-semibold text-sm">{pin.quantity.toLocaleString()}</span>
            <span className="text-white/40 text-xs">{pin.unit}</span>
          </div>
          {pin.rating_avg > 0 && (
            <div className="flex items-center gap-1 ml-auto">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${s <= Math.round(pin.rating_avg) ? 'fill-amber-400 text-amber-400' : 'text-white/15'}`}
                />
              ))}
              <span className="text-white/50 text-xs ml-0.5">{pin.rating_avg.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/8" />

        {/* Contact section */}
        {isLoggedIn ? (
          <div className="space-y-2">
            <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold">Farmer Contact</p>
            <p className="text-white font-semibold text-sm">{pin.farmer_name}</p>
            {pin.farmer_village && (
              <p className="text-white/40 text-xs">{pin.farmer_village}</p>
            )}
            {pin.farmer_phone && (
              <a
                href={`tel:${pin.farmer_phone}`}
                className="flex items-center justify-center gap-2 w-full mt-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all duration-150 active:scale-95 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}
              >
                <Phone className="w-4 h-4" strokeWidth={2.5} />
                {pin.farmer_phone}
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/4 border border-white/8">
              <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0">
                <span className="text-base">👨‍🌾</span>
              </div>
              <div>
                <p className="text-white/60 text-xs">Farmer contact hidden</p>
                <p className="text-white/30 text-[11px]">Login to see name & phone</p>
              </div>
            </div>
            <Link
              href="/auth"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-150 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08))',
                border: '1px solid rgba(16,185,129,0.3)',
                color: '#34d399',
              }}
            >
              <Lock className="w-3.5 h-3.5" strokeWidth={2.5} />
              Login to contact farmer
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
