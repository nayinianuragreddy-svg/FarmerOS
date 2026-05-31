'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { CATEGORY_CONFIG, INDIA_CENTER, INDIA_DEFAULT_ZOOM, MAP_STYLE } from '@/lib/constants'
import { CropCategory, MapPin } from '@/lib/types'
import CropCardPopup from './CropCardPopup'
import FilterPanel from './FilterPanel'
import MapControls from './MapControls'

interface FarmerOSMapProps {
  pins?: MapPin[]
  isLoggedIn?: boolean
  searchQuery?: string
}

export default function FarmerOSMap({ pins = [], isLoggedIn = false, searchQuery = '' }: FarmerOSMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null)
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [activeCategories, setActiveCategories] = useState<CropCategory[]>([])
  const [mapReady, setMapReady] = useState(false)

  // ─── INIT MAP ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: INDIA_CENTER,
      zoom: INDIA_DEFAULT_ZOOM,
      minZoom: 3,
      maxZoom: 18,
      attributionControl: false,
    })

    map.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-left',
    )

    map.current.on('load', () => {
      setMapReady(true)
      // Add heatmap source after map loads
      if (!map.current!.getSource('listings-heat')) {
        map.current!.addSource('listings-heat', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })
        map.current!.addLayer({
          id: 'listings-heatmap',
          type: 'heatmap',
          source: 'listings-heat',
          maxzoom: 14,
          layout: { visibility: 'none' },
          paint: {
            'heatmap-weight': 1,
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 9, 2],
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0,   'rgba(16,185,129,0)',
              0.25,'rgba(16,185,129,0.5)',
              0.5, 'rgba(234,179,8,0.65)',
              0.75,'rgba(249,115,22,0.75)',
              1,   'rgba(239,68,68,0.9)',
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 18, 9, 36],
            'heatmap-opacity': 0.85,
          },
        })
      }
    })

    map.current.on('click', () => {
      setSelectedPin(null)
      setPopupPos(null)
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // ─── FILTERED PINS ────────────────────────────────────────────────────────
  const filteredPins = useCallback(() => {
    let result = pins
    if (activeCategories.length > 0) {
      result = result.filter(p => activeCategories.includes(p.crop_category))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.crop_name.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q),
      )
    }
    return result
  }, [pins, activeCategories, searchQuery])

  // ─── RENDER PINS ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!map.current || !mapReady) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const visible = filteredPins()

    visible.forEach(pin => {
      const config = CATEGORY_CONFIG[pin.crop_category]

      const el = document.createElement('div')
      el.className = 'farmeros-pin'
      el.innerHTML = `
        <div class="pin-body" style="--pin-color:${config.mapColor}">
          <div class="pin-icon">${config.emoji}</div>
        </div>
        <div class="pin-shadow"></div>
      `

      el.addEventListener('click', e => {
        e.stopPropagation()
        setSelectedPin(pin)
        const rect = el.getBoundingClientRect()
        setPopupPos({ x: rect.left + rect.width / 2, y: rect.top })
      })

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([pin.longitude, pin.latitude])
        .addTo(map.current!)

      markersRef.current.push(marker)
    })

    // Update heatmap data
    const src = map.current.getSource('listings-heat') as maplibregl.GeoJSONSource | undefined
    if (src) {
      src.setData({
        type: 'FeatureCollection',
        features: visible.map(p => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [p.longitude, p.latitude] },
          properties: {},
        })),
      })
    }
  }, [mapReady, filteredPins])

  // ─── HEATMAP TOGGLE ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!map.current || !mapReady || !map.current.getLayer('listings-heatmap')) return
    map.current.setLayoutProperty('listings-heatmap', 'visibility', showHeatmap ? 'visible' : 'none')
  }, [showHeatmap, mapReady])

  const flyToIndia = () => {
    map.current?.flyTo({ center: INDIA_CENTER, zoom: INDIA_DEFAULT_ZOOM, duration: 1400, essential: true })
  }

  const visibleCount = filteredPins().length

  return (
    <div className="relative w-full h-full">
      {/* Map canvas — fills parent */}
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* Controls */}
      <MapControls
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap(h => !h)}
        onToggleFilters={() => setShowFilters(f => !f)}
        onReset={flyToIndia}
        filterCount={activeCategories.length}
      />

      {/* Filter Drawer */}
      <FilterPanel
        open={showFilters}
        onClose={() => setShowFilters(false)}
        activeCategories={activeCategories}
        onChange={setActiveCategories}
      />

      {/* Crop Card Popup */}
      {selectedPin && popupPos && (
        <CropCardPopup
          pin={selectedPin}
          position={popupPos}
          isLoggedIn={isLoggedIn}
          onClose={() => { setSelectedPin(null); setPopupPos(null) }}
        />
      )}

      {/* Live pin count */}
      <div className="absolute bottom-6 right-4 z-10 pointer-events-none">
        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(6,9,14,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            style={{ boxShadow: '0 0 6px #10b981' }}
          />
          {visibleCount} crop{visibleCount !== 1 ? 's' : ''} on map
        </div>
      </div>
    </div>
  )
}
