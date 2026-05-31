'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MAP_STYLE, INDIA_CENTER } from '@/lib/constants'
import { MapPin, Locate, Loader2 } from 'lucide-react'

interface GeoTagPickerProps {
  value: { lat: number; lng: number } | null
  onChange: (coords: { lat: number; lng: number }) => void
}

export default function GeoTagPicker({ value, onChange }: GeoTagPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState('')

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const center: [number, number] = value
      ? [value.lng, value.lat]
      : INDIA_CENTER

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center,
      zoom: value ? 13 : 5,
      attributionControl: false,
    })

    mapRef.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    // Create draggable marker
    const el = document.createElement('div')
    el.innerHTML = `<div style="width:36px;height:36px;background:#10b981;border:3px solid white;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);box-shadow:0 4px 16px rgba(16,185,129,0.5);cursor:grab;display:flex;align-items:center;justify-content:center">
      <span style="transform:rotate(45deg);font-size:14px">📍</span>
    </div>`

    const initialLngLat: [number, number] = value
      ? [value.lng, value.lat]
      : INDIA_CENTER

    markerRef.current = new maplibregl.Marker({ element: el, anchor: 'bottom', draggable: true })
      .setLngLat(initialLngLat)
      .addTo(mapRef.current)

    markerRef.current.on('dragend', () => {
      const lngLat = markerRef.current!.getLngLat()
      onChange({ lat: +lngLat.lat.toFixed(6), lng: +lngLat.lng.toFixed(6) })
    })

    // Click map to move marker
    mapRef.current.on('click', (e) => {
      const { lat, lng } = e.lngLat
      markerRef.current?.setLngLat([lng, lat])
      onChange({ lat: +lat.toFixed(6), lng: +lng.toFixed(6) })
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync marker if value changes externally
  useEffect(() => {
    if (!value || !markerRef.current || !mapRef.current) return
    markerRef.current.setLngLat([value.lng, value.lat])
  }, [value])

  const detectGPS = () => {
    setGpsError('')
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const coords = { lat: +lat.toFixed(6), lng: +lng.toFixed(6) }
        onChange(coords)
        markerRef.current?.setLngLat([coords.lng, coords.lat])
        mapRef.current?.flyTo({ center: [coords.lng, coords.lat], zoom: 14, duration: 1200 })
        setGpsLoading(false)
      },
      (err) => {
        setGpsLoading(false)
        setGpsError(err.code === 1 ? 'Location permission denied. Please tap the map to set your farm location.' : 'Could not detect location. Tap the map instead.')
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  return (
    <div className="space-y-2">
      {/* Map */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10" style={{ height: 260 }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        {/* Instruction overlay */}
        {!value && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-white/60 pointer-events-none whitespace-nowrap">
            Tap the map or drag the pin to your farm
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={detectGPS}
          disabled={gpsLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-xl text-white/70 hover:text-white text-sm font-medium transition disabled:opacity-50"
        >
          {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
          {gpsLoading ? 'Detecting…' : 'Use my GPS location'}
        </button>

        {value && (
          <div className="flex items-center gap-1.5 text-xs text-white/40 ml-auto">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span className="font-mono">{value.lat}, {value.lng}</span>
          </div>
        )}
      </div>

      {gpsError && (
        <p className="text-amber-400/80 text-xs flex items-start gap-1.5">
          <span>⚠️</span> {gpsError}
        </p>
      )}
    </div>
  )
}
