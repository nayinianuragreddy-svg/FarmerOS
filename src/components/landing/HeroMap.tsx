'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { CATEGORY_CONFIG, MAP_STYLE } from '@/lib/constants'
import { MOCK_PINS } from '@/lib/mock-data'

// A curated spread of listings across India for the hero — refined price pills,
// not cartoon circles. A few are "fresh" and pulse.
const HERO_PINS = MOCK_PINS.slice(0, 22)

function priceLabel(p: (typeof MOCK_PINS)[number]) {
  return `₹${p.expected_price}`
}

export default function HeroMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [81.5, 22.2],
      zoom: 3.4,
      pitch: 0,
      bearing: 0,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
    })
    mapRef.current = map

    const markers: maplibregl.Marker[] = []

    map.on('load', () => {
      // Cinematic intro — ease down onto India
      map.easeTo({ center: [80.5, 22.5], zoom: 4.25, duration: 2600, easing: (t) => 1 - Math.pow(1 - t, 3) })

      // Drop pins in sequence
      HERO_PINS.forEach((pin, i) => {
        const cat = CATEGORY_CONFIG[pin.crop_category]
        const isFresh = pin.created_at ? Date.now() - new Date(pin.created_at).getTime() < 86400000 : false

        // Wrapper — maplibre owns its position/transform. Animate the INNER pill only.
        const el = document.createElement('div')
        el.className = 'hero-pin'
        el.style.cssText = `opacity:0; transition:opacity .5s ease;`

        const pill = document.createElement('div')
        pill.style.cssText = `position:relative; display:inline-flex; align-items:center; gap:5px;
            background:rgba(10,16,12,0.92); backdrop-filter:blur(8px);
            border:1px solid ${isFresh ? 'rgba(0,201,122,0.5)' : 'rgba(255,255,255,0.12)'};
            border-radius:100px; padding:3px 9px 3px 6px;
            box-shadow:0 4px 14px rgba(0,0,0,0.45);
            font-family:'Inter',-apple-system,sans-serif; white-space:nowrap;
            transform:translateY(-6px) scale(0.6); transition:transform .5s cubic-bezier(.34,1.56,.64,1);`
        pill.innerHTML = `
            ${isFresh ? `<span style="position:absolute; inset:-4px; border-radius:100px; border:1.5px solid rgba(0,201,122,0.55); animation:heroSonar 2.4s ease-out infinite;"></span>` : ''}
            <span style="width:13px;height:13px;border-radius:50%;background:${cat.mapColor};
              display:flex;align-items:center;justify-content:center;font-size:8px;flex-shrink:0;
              box-shadow:0 0 8px ${cat.mapColor}80;">${cat.emoji}</span>
            <span style="font-size:11px;font-weight:700;color:#fff;letter-spacing:-0.01em;">${priceLabel(pin)}</span>`
        el.appendChild(pill)

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([pin.longitude, pin.latitude])
          .addTo(map)
        markers.push(marker)

        setTimeout(() => {
          el.style.opacity = isFresh ? '1' : '0.96'
          pill.style.transform = 'translateY(0) scale(1)'
        }, 900 + i * 70)
      })

      // Gentle perpetual drift after intro
      let dir = 1
      const drift = () => {
        if (!mapRef.current) return
        dir *= -1
        map.easeTo({
          center: [80.5 + dir * 0.9, 22.5 + dir * 0.4],
          duration: 16000,
          easing: (t) => t,
        })
      }
      const driftTimer = setTimeout(function loop() {
        drift()
        ;(loop as any)._t = setTimeout(loop, 16000)
      }, 3000)
      ;(map as any)._driftTimer = driftTimer
    })

    return () => {
      markers.forEach((m) => m.remove())
      if ((map as any)._driftTimer) clearTimeout((map as any)._driftTimer)
      map.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <style>{`
        @keyframes heroSonar { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.1);opacity:0} }
      `}</style>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Tint to match brand + darken tiles slightly */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 100% at 70% 40%, rgba(0,201,122,0.10) 0%, transparent 55%)', pointerEvents: 'none' }} />
      {/* Left blend into dark content panel — seamless seam */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #070C0A 0%, rgba(7,12,10,0.85) 14%, rgba(7,12,10,0) 38%)', pointerEvents: 'none' }} />
      {/* Top + bottom vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,12,10,0.55) 0%, transparent 18%, transparent 82%, rgba(7,12,10,0.65) 100%)', pointerEvents: 'none' }} />
    </div>
  )
}
