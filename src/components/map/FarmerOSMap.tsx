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
}

export default function FarmerOSMap({ pins = [], isLoggedIn = false }: FarmerOSMapProps) {
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
      addHeatmapSource()
    })

    // Close popup on map click
    map.current.on('click', () => {
      setSelectedPin(null)
      setPopupPos(null)
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── HEATMAP SOURCE ───────────────────────────────────────────────────────
  const addHeatmapSource = useCallback(() => {
    if (!map.current) return
    if (map.current.getSource('listings-heat')) return

    map.current.addSource('listings-heat', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    })

    map.current.addLayer({
      id: 'listings-heatmap',
      type: 'heatmap',
      source: 'listings-heat',
      maxzoom: 12,
      paint: {
        'heatmap-weight': 1,
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.6, 9, 2],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0,   'rgba(16,185,129,0)',
          0.2, 'rgba(16,185,129,0.4)',
          0.4, 'rgba(234,179,8,0.6)',
          0.6, 'rgba(249,115,22,0.7)',
          0.8, 'rgba(239,68,68,0.8)',
          1,   'rgba(220,38,38,0.9)',
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 20, 9, 40],
        'heatmap-opacity': showHeatmap ? 0.85 : 0,
      },
      layout: { visibility: showHeatmap ? 'visible' : 'none' },
    })
  }, [showHeatmap])

  // ─── RENDER PINS ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!map.current || !mapReady) return

    // clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const filtered = activeCategories.length > 0
      ? pins.filter(p => activeCategories.includes(p.crop_category))
      : pins

    filtered.forEach((pin) => {
      const config = CATEGORY_CONFIG[pin.crop_category]
      const el = document.createElement('div')
      el.className = 'farmeros-pin'
      el.innerHTML = `
        <div class="pin-inner" style="background:${config.mapColor}22;border-color:${config.mapColor}">
          <span class="pin-emoji">${config.emoji}</span>
        </div>
        <div class="pin-pulse" style="background:${config.mapColor}"></div>
      `
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setSelectedPin(pin)
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
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
        features: filtered.map(p => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
          properties: {},
        })),
      })
    }
  }, [pins, mapReady, activeCategories])

  // ─── HEATMAP TOGGLE ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!map.current || !mapReady) return
    if (!map.current.getLayer('listings-heatmap')) return
    map.current.setLayoutProperty(
      'listings-heatmap',
      'visibility',
      showHeatmap ? 'visible' : 'none',
    )
    map.current.setPaintProperty('listings-heatmap', 'heatmap-opacity', showHeatmap ? 0.85 : 0)
  }, [showHeatmap, mapReady])

  // ─── FLY TO INDIA ─────────────────────────────────────────────────────────
  const flyToIndia = () => {
    map.current?.flyTo({ center: INDIA_CENTER, zoom: INDIA_DEFAULT_ZOOM, duration: 1200 })
  }

  return (
    <div className="relative w-full h-full">
      {/* Map canvas */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Controls */}
      <MapControls
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap(h => !h)}
        onToggleFilters={() => setShowFilters(f => !f)}
        onReset={flyToIndia}
        filterCount={activeCategories.length}
      />

      {/* Filter Panel */}
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

      {/* Pin count badge */}
      {pins.length > 0 && (
        <div className="absolute bottom-6 right-4 bg-black/70 border border-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/70 pointer-events-none">
          {pins.length} listing{pins.length !== 1 ? 's' : ''} on map
        </div>
      )}
    </div>
  )
}
