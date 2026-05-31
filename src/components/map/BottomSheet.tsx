'use client'

import { useEffect, useState, useRef, type TouchEvent, type MouseEvent } from 'react'
import { MapPin as MapPinIcon, Scale, Star, Phone, Lock, Leaf, X, ChevronUp } from 'lucide-react'
import { MapPin } from '@/lib/types'
import { CATEGORY_CONFIG } from '@/lib/constants'
import Link from 'next/link'

interface BottomSheetProps {
  pin: MapPin | null
  isLoggedIn: boolean
  onClose: () => void
  onSave?: (id: string) => void
  savedIds?: string[]
  totalPins?: number
}

type SheetState = 'collapsed' | 'peek' | 'open'

type CategoryConfig = { label: string; emoji: string; mapColor: string; color: string; [key: string]: unknown }

const MOCK_MANDI_PRICES: Record<string, number> = {
  'Tomato': 17,
  'Onion': 12,
  'Potato': 15,
  'Wheat - Sharbati': 23,
  'Rice - Basmati': 38,
  'Chilli (Guntur)': 180,
  'Turmeric': 145,
  'Groundnut': 65,
  'Soybean': 43,
  'Cotton - Long Staple': 72,
}

function getMandiPrice(pin: MapPin): number {
  if (MOCK_MANDI_PRICES[pin.crop_name]) return MOCK_MANDI_PRICES[pin.crop_name]
  if (pin.expected_price) return Math.round(pin.expected_price * 0.85)
  return 0
}

export default function BottomSheet({
  pin,
  isLoggedIn,
  onClose,
  totalPins = 0,
}: BottomSheetProps) {
  const [sheetState, setSheetState] = useState<SheetState>('collapsed')
  const [isDesktop, setIsDesktop] = useState(false)
  const dragStartY = useRef<number>(0)
  const isDragging = useRef(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Open sheet when a pin is selected
  useEffect(() => {
    if (pin) {
      setSheetState('open')
    } else {
      setSheetState('collapsed')
    }
  }, [pin])

  const getTranslateY = (): string => {
    if (!pin) {
      return sheetState === 'collapsed' ? 'calc(100% - 48px)' : '0px'
    }
    switch (sheetState) {
      case 'collapsed': return 'calc(100% - 48px)'
      case 'peek': return 'calc(100% - 200px)'
      case 'open': return 'calc(100% - 380px)'
      default: return 'calc(100% - 48px)'
    }
  }

  const handleDragStart = (e: TouchEvent | MouseEvent) => {
    isDragging.current = true
    dragStartY.current = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
  }

  const handleDragEnd = (e: TouchEvent | MouseEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    const endY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY
    const delta = endY - dragStartY.current

    if (delta < -40) {
      if (sheetState === 'collapsed') setSheetState('peek')
      else if (sheetState === 'peek') setSheetState('open')
    } else if (delta > 40) {
      if (sheetState === 'open') setSheetState('peek')
      else if (sheetState === 'peek') setSheetState('collapsed')
      else if (sheetState === 'collapsed') onClose()
    }
  }

  const mandiPrice = pin ? getMandiPrice(pin) : 0
  const priceVsMandi = pin?.expected_price && mandiPrice > 0
    ? Math.round(((pin.expected_price - mandiPrice) / mandiPrice) * 100)
    : 0

  // ── DESKTOP: floating card bottom-left ─────────────────────────────────────
  if (isDesktop) {
    if (!pin) return null
    const config = CATEGORY_CONFIG[pin.crop_category]
    return (
      <div
        className="fixed bottom-6 left-4 z-30 w-80 overflow-hidden pointer-events-auto"
        style={{
          background: 'rgba(8, 11, 18, 0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          animation: 'slideUpCard 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <style>{`
          @keyframes slideUpCard {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
        <DesktopCardContent
          pin={pin}
          config={config}
          isLoggedIn={isLoggedIn}
          mandiPrice={mandiPrice}
          priceVsMandi={priceVsMandi}
          onClose={onClose}
        />
      </div>
    )
  }

  // ── MOBILE: bottom sheet ───────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 pointer-events-auto"
      style={{
        transform: `translateY(${getTranslateY()})`,
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        willChange: 'transform',
      }}
    >
      <div
        style={{
          background: 'rgba(6, 9, 14, 0.98)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px 20px 0 0',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          minHeight: '380px',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          <div
            style={{
              width: '36px',
              height: '4px',
              borderRadius: '2px',
              background: 'rgba(255,255,255,0.18)',
            }}
          />
        </div>

        {/* Content */}
        {!pin ? (
          <div className="flex items-center justify-between px-5 py-2">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
                style={{ boxShadow: '0 0 6px #10b981' }}
              />
              <span className="text-white/60 text-sm font-medium">
                {totalPins} live crops on map
              </span>
            </div>
            <button
              onClick={() => setSheetState('open')}
              className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold"
            >
              <ChevronUp className="w-4 h-4" />
              Browse all
            </button>
          </div>
        ) : (
          <MobileSheetContent
            pin={pin}
            isLoggedIn={isLoggedIn}
            mandiPrice={mandiPrice}
            priceVsMandi={priceVsMandi}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface CardContentProps {
  pin: MapPin
  config: CategoryConfig
  isLoggedIn: boolean
  mandiPrice: number
  priceVsMandi: number
  onClose: () => void
}

interface MobileContentProps {
  pin: MapPin
  isLoggedIn: boolean
  mandiPrice: number
  priceVsMandi: number
  onClose: () => void
}

function DesktopCardContent({ pin, config, isLoggedIn, mandiPrice, priceVsMandi, onClose }: CardContentProps) {
  return (
    <>
      {/* Image / Hero */}
      <div className="relative h-32 overflow-hidden" style={{ background: `${config.mapColor}15` }}>
        {pin.images.length > 0 ? (
          <img src={pin.images[0]} alt={pin.crop_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">{config.emoji}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: `${config.mapColor}cc` }}
          >
            {config.emoji} {config.label}
          </span>
          {pin.is_organic && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white">
              <Leaf className="w-3 h-3" /> Organic
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-bold text-lg leading-tight">{pin.crop_name}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-white/45 text-xs">
            <MapPinIcon className="w-3 h-3 flex-shrink-0" />
            <span>{pin.district}, {pin.state}</span>
          </div>
        </div>
        <CropStats pin={pin} mandiPrice={mandiPrice} priceVsMandi={priceVsMandi} />
        <div className="h-px bg-white/8" />
        <ContactSection pin={pin} isLoggedIn={isLoggedIn} />
      </div>
    </>
  )
}

function MobileSheetContent({ pin, isLoggedIn, mandiPrice, priceVsMandi, onClose }: MobileContentProps) {
  const config = CATEGORY_CONFIG[pin.crop_category]
  return (
    <div className="px-4 pb-4 space-y-3">
      <div className="flex items-start gap-3">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl overflow-hidden"
          style={{ background: `${config.mapColor}15`, border: `1px solid ${config.mapColor}30` }}
        >
          {pin.images.length > 0
            ? <img src={pin.images[0]} alt={pin.crop_name} className="w-full h-full object-cover" />
            : <span>{config.emoji}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
              style={{ background: `${config.mapColor}cc` }}
            >
              {config.emoji} {config.label}
            </span>
            {pin.is_organic && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/90 text-white">
                <Leaf className="w-3 h-3" /> Organic
              </span>
            )}
          </div>
          <h3 className="text-white font-bold text-lg leading-tight mt-1">{pin.crop_name}</h3>
          <div className="flex items-center gap-1 text-white/45 text-xs mt-0.5">
            <MapPinIcon className="w-3 h-3 flex-shrink-0" />
            <span>{pin.district}, {pin.state}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <CropStats pin={pin} mandiPrice={mandiPrice} priceVsMandi={priceVsMandi} />
      <div className="h-px bg-white/8" />
      <ContactSection pin={pin} isLoggedIn={isLoggedIn} />
    </div>
  )
}

function CropStats({ pin, mandiPrice, priceVsMandi }: { pin: MapPin; mandiPrice: number; priceVsMandi: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-white font-semibold text-sm">{pin.quantity.toLocaleString()}</span>
          <span className="text-white/40 text-xs">{pin.unit}</span>
        </div>
        {pin.expected_price && (
          <div className="flex items-center gap-1">
            <span className="text-white font-semibold text-sm">₹{pin.expected_price}/{pin.unit}</span>
          </div>
        )}
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

      {mandiPrice > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-white/40">Today&apos;s mandi:</span>
          <span className="text-emerald-400 font-medium">₹{mandiPrice}/kg</span>
          {pin.expected_price && (
            <span className={`font-semibold ${priceVsMandi > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ({priceVsMandi > 0 ? '+' : ''}{priceVsMandi}% vs mandi)
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function ContactSection({ pin, isLoggedIn }: { pin: MapPin; isLoggedIn: boolean }) {
  if (isLoggedIn) {
    return (
      <div className="space-y-2">
        <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold">Farmer Contact</p>
        <p className="text-white font-semibold text-sm">{pin.farmer_name || 'Farmer'}</p>
        {pin.farmer_village && (
          <p className="text-white/40 text-xs">{pin.farmer_village}</p>
        )}
        {pin.farmer_phone && (
          <a
            href={`tel:${pin.farmer_phone}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-black transition-all duration-150 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}
          >
            <Phone className="w-4 h-4" strokeWidth={2.5} />
            {pin.farmer_phone}
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/4 border border-white/8">
        <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0">
          <span className="text-base">👨‍🌾</span>
        </div>
        <div>
          <p className="text-white/60 text-xs">Farmer contact hidden</p>
          <p className="text-white/30 text-[11px]">Login to see name &amp; phone</p>
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
  )
}
