'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { CATEGORY_CONFIG, INDIA_CENTER, INDIA_DEFAULT_ZOOM, MAP_STYLE } from '@/lib/constants'
import { CropCategory, MapPin } from '@/lib/types'
import CropCardPopup from './CropCardPopup'
import MapControls from './MapControls'
import CategoryPillsBar from './CategoryPillsBar'
import BottomSheet from './BottomSheet'

const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri © DigitalGlobe',
      maxzoom: 18,
    },
  },
  layers: [{ id: 'satellite', type: 'raster', source: 'esri-satellite' }],
}

interface FarmerOSMapProps {
  pins?: MapPin[]
  isLoggedIn?: boolean
  searchQuery?: string
  compact?: boolean
  onPinClick?: (pin: MapPin) => void
}

export default function FarmerOSMap({
  pins = [],
  isLoggedIn = false,
  searchQuery = '',
  compact = false,
  onPinClick,
}: FarmerOSMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const selectedMarkerEl = useRef<HTMLElement | null>(null)

  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null)
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [activeCategories, setActiveCategories] = useState<CropCategory[]>([])
  const [organicOnly, setOrganicOnly] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark')

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
      addHeatmapLayer()
      setMapReady(true)
    })

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

  function addHeatmapLayer() {
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

  // ─── STYLE TOGGLE ──────────────────────────────────────────────────────────
  const toggleStyle = useCallback(() => {
    if (!map.current) return
    const next = mapStyle === 'dark' ? 'satellite' : 'dark'
    setMapStyle(next)
    setMapReady(false)

    // Remove existing markers before style switch
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    selectedMarkerEl.current = null

    const newStyle = next === 'satellite' ? SATELLITE_STYLE : MAP_STYLE
    map.current.setStyle(newStyle)
    map.current.once('styledata', () => {
      addHeatmapLayer()
      setMapReady(true)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapStyle])

  // ─── FILTERED PINS ────────────────────────────────────────────────────────
  const filteredPins = useCallback(() => {
    let result = pins
    if (activeCategories.length > 0) {
      result = result.filter(p => activeCategories.includes(p.crop_category))
    }
    if (organicOnly) {
      result = result.filter(p => p.is_organic)
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
  }, [pins, activeCategories, organicOnly, searchQuery])

  // ─── GEOCODING for search ─────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim() || !map.current) return
    const q = searchQuery.toLowerCase()
    // If search matches any pin, don't geocode
    const matchesCrop = pins.some(p => p.crop_name.toLowerCase().includes(q))
    if (matchesCrop) return

    async function geocodeLocation(query: string) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' India')}&format=json&limit=1&countrycodes=in`,
          { headers: { 'User-Agent': 'FarmerOS/1.0' } },
        )
        const data: Array<{ lat: string; lon: string }> = await res.json()
        if (data[0]) {
          map.current?.flyTo({
            center: [parseFloat(data[0].lon), parseFloat(data[0].lat)],
            zoom: 10,
            duration: 1500,
          })
        }
      } catch {
        // Silently ignore geocoding errors
      }
    }

    const timer = setTimeout(() => geocodeLocation(searchQuery), 600)
    return () => clearTimeout(timer)
  }, [searchQuery, pins])

  // ─── RENDER PINS ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!map.current || !mapReady) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    selectedMarkerEl.current = null

    const visible = filteredPins()

    visible.forEach(pin => {
      const config = CATEGORY_CONFIG[pin.crop_category]

      const el = document.createElement('div')
      el.className = 'farmeros-pill-pin'
      el.setAttribute('data-id', pin.id)

      const priceLabel = pin.expected_price
        ? `₹${pin.expected_price}/${pin.unit}`
        : `${pin.quantity}${pin.unit}`

      el.innerHTML = `
        <div class="pill-content" style="--color: ${config.mapColor}">
          <span class="pill-emoji">${config.emoji}</span>
          <span class="pill-label">${priceLabel}</span>
          ${pin.is_organic ? '<span class="pill-organic">🌿</span>' : ''}
        </div>
      `

      el.addEventListener('click', e => {
        e.stopPropagation()

        // Deselect previous
        if (selectedMarkerEl.current) {
          selectedMarkerEl.current.classList.remove('selected')
        }
        el.classList.add('selected')
        selectedMarkerEl.current = el

        setSelectedPin(pin)
        onPinClick?.(pin)

        // Only set popup position in compact mode (for popup card usage)
        if (compact) {
          const rect = el.getBoundingClientRect()
          setPopupPos({ x: rect.left + rect.width / 2, y: rect.top })
        }
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
  }, [mapReady, filteredPins, compact, onPinClick])

  // ─── HEATMAP TOGGLE ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!map.current || !mapReady || !map.current.getLayer('listings-heatmap')) return
    map.current.setLayoutProperty('listings-heatmap', 'visibility', showHeatmap ? 'visible' : 'none')
  }, [showHeatmap, mapReady])

  const flyToIndia = () => {
    map.current?.flyTo({ center: INDIA_CENTER, zoom: INDIA_DEFAULT_ZOOM, duration: 1400, essential: true })
  }

  const handleCloseSheet = () => {
    setSelectedPin(null)
    setPopupPos(null)
    if (selectedMarkerEl.current) {
      selectedMarkerEl.current.classList.remove('selected')
      selectedMarkerEl.current = null
    }
  }

  const visibleCount = filteredPins().length

  // ─── COMPACT MODE (hero embed) ─────────────────────────────────────────────
  if (compact) {
    return (
      <div className="relative w-full h-full">
        <div ref={mapContainer} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        {selectedPin && popupPos && (
          <CropCardPopup
            pin={selectedPin}
            position={popupPos}
            isLoggedIn={isLoggedIn}
            onClose={handleCloseSheet}
          />
        )}
      </div>
    )
  }

  // ─── FULL MAP PAGE ─────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Category Pills Bar */}
      <CategoryPillsBar
        activeCategories={activeCategories}
        onCategoryChange={setActiveCategories}
        organicOnly={organicOnly}
        onOrganicToggle={() => setOrganicOnly(v => !v)}
        totalPins={pins.length}
      />

      {/* Map area + Bottom Sheet wrapper */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        {/* Map canvas */}
        <div ref={mapContainer} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

        {/* Controls */}
        <MapControls
          showHeatmap={showHeatmap}
          onToggleHeatmap={() => setShowHeatmap(h => !h)}
          onReset={flyToIndia}
          mapStyle={mapStyle}
          onToggleStyle={toggleStyle}
        />

        {/* Live pin count badge */}
        <div className="absolute bottom-6 left-4 z-10 pointer-events-none">
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

        {/* Bottom Sheet */}
        <BottomSheet
          pin={selectedPin}
          isLoggedIn={isLoggedIn}
          onClose={handleCloseSheet}
          totalPins={visibleCount}
        />
      </div>
    </div>
  )
}
