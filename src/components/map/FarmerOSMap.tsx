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
import { MOCK_PINS } from '@/lib/mock-data'

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

function formatQuantity(quantity: number, unit: string): string {
  // Convert to kg equivalent for display
  let kgAmount = quantity
  if (unit === 'quintal') kgAmount = quantity * 100
  if (unit === 'tonne') kgAmount = quantity * 1000

  if (kgAmount >= 1000000) return `${Math.round(kgAmount / 1000000)}KT`
  if (kgAmount >= 1000) return `${Math.round(kgAmount / 1000)}T`
  if (kgAmount >= 100) return `${Math.round(kgAmount)}kg`
  return `${kgAmount}kg`
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
  const mandiMarkersRef = useRef<maplibregl.Marker[]>([])
  const selectedMarkerEl = useRef<HTMLElement | null>(null)

  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null)
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [isMandis, setIsMandis] = useState(false)
  const [activeCategory, setActiveCategory] = useState<CropCategory | null>(null)
  const [organicOnly, setOrganicOnly] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite'>('dark')
  // Merge mock + external pins, dedup by id
  function mergePins(external: MapPin[]): MapPin[] {
    const extIds = new Set(external.map(p => p.id))
    const mockOnly = MOCK_PINS.filter(p => !extIds.has(p.id))
    return [...external, ...mockOnly]
  }

  const [allPins, setAllPins] = useState<MapPin[]>(() => mergePins(pins))
  const [hasLoaded, setHasLoaded] = useState(false)

  // Sync when external pins update
  useEffect(() => {
    setAllPins(mergePins(pins))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins])

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

    // Inject keyframe animations
    const styleEl = document.createElement('style')
    styleEl.id = 'farmeros-map-styles'
    if (!document.getElementById('farmeros-map-styles')) {
      styleEl.textContent = `
        @keyframes freshPing {
          0% { transform: scale(1); opacity: 0.7; }
          70% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `
      document.head.appendChild(styleEl)
    }

    map.current.on('load', () => {
      addHeatmapLayer()
      setMapReady(true)
    })

    map.current.on('click', () => {
      setSelectedPin(null)
      setPopupPos(null)
    })

    // Fetch real listings
    fetchRealListings()

    return () => {
      map.current?.remove()
      map.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchRealListings() {
    try {
      const res = await fetch('/api/listings?lat=20.5937&lng=78.9629&radius=2000')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setAllPins(prev => {
            const existingIds = new Set(data.map((p: MapPin) => p.id))
            const dedupedMock = prev.filter(p => !existingIds.has(p.id))
            return [...data, ...dedupedMock]
          })
        }
      }
    } catch {
      // Silently fall back to mock pins
    }
  }

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

  // ─── FILTERED PINS ────────────────────────────────────────────────────────────
  const filteredPins = useCallback(() => {
    let result = allPins
    if (activeCategory) {
      result = result.filter(p => p.crop_category === activeCategory)
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
  }, [allPins, activeCategory, organicOnly, searchQuery])

  // ─── GEOCODING for external search query ────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim() || !map.current) return
    const q = searchQuery.toLowerCase()
    const matchesCrop = allPins.some(p => p.crop_name.toLowerCase().includes(q))
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
        // ignore
      }
    }

    const timer = setTimeout(() => geocodeLocation(searchQuery), 600)
    return () => clearTimeout(timer)
  }, [searchQuery, allPins])

  // ─── RENDER PINS (Zillow-style pill markers) ─────────────────────────────────
  useEffect(() => {
    if (!map.current || !mapReady) return

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    selectedMarkerEl.current = null

    const visible = filteredPins()

    visible.forEach((pin, idx) => {
      const config = CATEGORY_CONFIG[pin.crop_category]
      const quantityLabel = formatQuantity(pin.quantity, pin.unit)

      // Marker WRAPPER — maplibre owns its position + transform. Never set those here,
      // or inline styles override maplibre's positioning and the pin stretches full-width.
      const el = document.createElement('div')
      el.className = 'crop-pin'
      el.style.cssText = `opacity: 0; transition: opacity 0.2s ease; cursor: pointer;`

      // Inner PILL — all visual styling + hover/select live here, isolated from positioning.
      const pill = document.createElement('div')
      pill.style.cssText = `
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: ${config.mapColor};
        color: white;
        padding: 5px 12px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 700;
        font-family: Inter, sans-serif;
        white-space: nowrap;
        border: 2px solid rgba(255,255,255,0.3);
        box-shadow: 0 2px 12px rgba(0,0,0,0.4);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        user-select: none;
      `
      pill.textContent = `${config.emoji} ${quantityLabel}`
      el.appendChild(pill)

      // Fresh listing badge (listed today)
      const isFresh = pin.created_at
        ? (Date.now() - new Date(pin.created_at).getTime()) < 86400000 // 24 hours
        : false

      if (isFresh) {
        pill.style.overflow = 'visible'
        // Pulsing outer ring
        const ring = document.createElement('div')
        ring.style.cssText = `
          position: absolute;
          inset: -8px;
          border-radius: 9999px;
          border: 2px solid rgba(0,201,122,0.6);
          animation: freshPing 2s ease-out infinite;
          pointer-events: none;
        `
        pill.appendChild(ring)

        // "NEW" badge
        const badge = document.createElement('div')
        badge.style.cssText = `
          position: absolute;
          top: -8px;
          right: -8px;
          background: #00C97A;
          color: #000;
          font-size: 8px;
          font-weight: 800;
          padding: 2px 5px;
          border-radius: 100px;
          letter-spacing: 0.05em;
          pointer-events: none;
          z-index: 3;
        `
        badge.textContent = 'NEW'
        pill.appendChild(badge)
      }

      el.onmouseenter = () => {
        pill.style.transform = 'scale(1.15)'
        pill.style.boxShadow = '0 4px 20px rgba(0,0,0,0.6)'
        el.style.zIndex = '10'
      }
      el.onmouseleave = () => {
        if (!pill.classList.contains('selected')) {
          pill.style.transform = 'scale(1)'
          pill.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)'
          el.style.zIndex = ''
        }
      }
      el.onclick = (e) => {
        e.stopPropagation()
        if (selectedMarkerEl.current) {
          selectedMarkerEl.current.classList.remove('selected')
          selectedMarkerEl.current.style.transform = 'scale(1)'
          selectedMarkerEl.current.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)'
        }
        pill.classList.add('selected')
        pill.style.transform = 'scale(1.2)'
        pill.style.boxShadow = `0 6px 24px ${config.mapColor}80`
        pill.style.border = '2px solid white'
        el.style.zIndex = '20'
        selectedMarkerEl.current = pill

        setSelectedPin(pin)
        onPinClick?.(pin)

        if (compact) {
          const rect = pill.getBoundingClientRect()
          setPopupPos({ x: rect.left + rect.width / 2, y: rect.top })
        }
      }

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([pin.longitude, pin.latitude])
        .addTo(map.current!)

      markersRef.current.push(marker)

      // Stagger-animate entrance
      setTimeout(() => {
        el.style.opacity = '1'
      }, idx * 30)
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

    setHasLoaded(true)
  }, [mapReady, filteredPins, compact, onPinClick])

  // ─── HEATMAP TOGGLE ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!map.current || !mapReady || !map.current.getLayer('listings-heatmap')) return
    map.current.setLayoutProperty('listings-heatmap', 'visibility', showHeatmap ? 'visible' : 'none')
  }, [showHeatmap, mapReady])

  // ─── MANDIS TOGGLE ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!map.current || !mapReady) return

    if (!isMandis) {
      mandiMarkersRef.current.forEach(m => m.remove())
      mandiMarkersRef.current = []
      return
    }

    async function loadMandis() {
      if (!map.current) return
      const center = map.current.getCenter()
      try {
        const res = await fetch(`/api/nearby-mandis?lat=${center.lat}&lng=${center.lng}&radius=100`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            data.forEach((mandi: { lat: number; lng: number; name: string }) => {
              const el = document.createElement('div')
              el.style.cssText = `
                width: 32px; height: 32px;
                border-radius: 50%;
                background: rgba(249,115,22,0.9);
                border: 2px solid rgba(255,255,255,0.4);
                display: flex; align-items: center; justify-content: center;
                font-size: 14px;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(249,115,22,0.6);
              `
              el.textContent = '🏪'
              const m = new maplibregl.Marker({ element: el })
                .setLngLat([mandi.lng, mandi.lat])
                .addTo(map.current!)
              mandiMarkersRef.current.push(m)
            })
          }
        }
      } catch {
        // Silently fail
      }
    }

    loadMandis()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMandis, mapReady])

  const flyToIndia = () => {
    map.current?.flyTo({ center: INDIA_CENTER, zoom: INDIA_DEFAULT_ZOOM, duration: 1400, essential: true })
  }

  const handleCloseSheet = () => {
    setSelectedPin(null)
    setPopupPos(null)
    if (selectedMarkerEl.current) {
      selectedMarkerEl.current.classList.remove('selected')
      selectedMarkerEl.current.style.transform = 'scale(1)'
      selectedMarkerEl.current.style.zIndex = '1'
      selectedMarkerEl.current.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)'
      selectedMarkerEl.current.style.border = '2px solid rgba(255,255,255,0.3)'
      selectedMarkerEl.current = null
    }
  }

  const visibleCount = filteredPins().length

  // ─── SEASONAL DATA ─────────────────────────────────────────────────────────
  const SEASONAL = {
    1:  { season: 'Rabi Harvest',   emoji: '🌾', msg: 'Wheat & Mustard harvest underway — Punjab, Haryana, UP',               color: '#F59E0B' },
    2:  { season: 'Rabi Peak',      emoji: '🌾', msg: 'Wheat harvest peak — expect listings from North India',                 color: '#F59E0B' },
    3:  { season: 'Zaid Sowing',    emoji: '🌱', msg: 'Zaid season — Watermelon, Muskmelon, Cucumber sowing begins',           color: '#10B981' },
    4:  { season: 'Mango Season',   emoji: '🥭', msg: 'Mango harvest — Alphonso in Ratnagiri, Banganapalli in Andhra',         color: '#F59E0B' },
    5:  { season: 'Kharif Prep',    emoji: '🌧️', msg: 'Pre-monsoon — Kharif sowing preparation across India',                  color: '#3B82F6' },
    6:  { season: 'Kharif Sowing',  emoji: '🌧️', msg: 'Monsoon sowing underway — Rice, Cotton, Soybean, Bajra listings incoming', color: '#3B82F6' },
    7:  { season: 'Kharif Growing', emoji: '🌱', msg: 'Kharif crops growing — Rice, Maize, Cotton across India',               color: '#10B981' },
    8:  { season: 'Kharif Growing', emoji: '🌱', msg: 'Peak monsoon — vegetables from Maharashtra, Karnataka arriving',          color: '#10B981' },
    9:  { season: 'Kharif Harvest', emoji: '🌾', msg: 'Kharif harvest begins — Maize, Soybean, early Rice listings',            color: '#F59E0B' },
    10: { season: 'Major Harvest',  emoji: '🌾', msg: 'Major Kharif harvest — Rice, Cotton, Soybean across India',              color: '#F59E0B' },
    11: { season: 'Rabi Sowing',    emoji: '🌱', msg: 'Rabi season starts — Wheat, Mustard, Chickpea sowing begins',            color: '#10B981' },
    12: { season: 'Rabi Growing',   emoji: '❄️', msg: 'Rabi crops growing — Wheat across North, fresh vegetables from South',   color: '#6366F1' },
  } as const

  const currentMonth = (new Date().getMonth() + 1) as keyof typeof SEASONAL
  const seasonInfo = SEASONAL[currentMonth]

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
      {/* Seasonal intelligence bar */}
      <div style={{
        background: `${seasonInfo.color}10`,
        borderBottom: `1px solid ${seasonInfo.color}22`,
        padding: '7px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 13,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 16 }}>{seasonInfo.emoji}</span>
        <span style={{ color: seasonInfo.color, fontWeight: 600, flexShrink: 0 }}>{seasonInfo.season}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>—</span>
        <span style={{ color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seasonInfo.msg}</span>
      </div>

      {/* Category Pills Bar — fixed 56px strip */}
      <CategoryPillsBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        organicOnly={organicOnly}
        onOrganicToggle={() => setOrganicOnly(v => !v)}
        totalPins={allPins.length}
      />

      {/* Map area + overlays */}
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
          isMandis={isMandis}
          onToggleMandis={() => setIsMandis(v => !v)}
        />

        {/* Live pin count badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '16px',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 500,
              background: 'rgba(6,9,14,0.85)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px #10b981',
                flexShrink: 0,
              }}
            />
            {visibleCount} crop{visibleCount !== 1 ? 's' : ''} on map
          </div>
        </div>

        {/* Empty state — shown when filters produce no results */}
        {hasLoaded && filteredPins().length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 30,
            textAlign: 'center',
            pointerEvents: 'auto',
          }}>
            <div style={{
              background: 'rgba(7,12,10,0.92)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: '32px 40px',
              backdropFilter: 'blur(20px)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {activeCategory ? CATEGORY_CONFIG[activeCategory]?.emoji || '🌱' : '🌱'}
              </div>
              <p style={{ color: 'white', fontSize: 16, fontWeight: 600, margin: '0 0 6px' }}>
                No listings found
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 20px', lineHeight: 1.5 }}>
                {activeCategory
                  ? `No ${CATEGORY_CONFIG[activeCategory]?.label || 'crop'} listings in this area`
                  : 'No crops listed in this area yet'}
              </p>
              <button
                onClick={() => { setActiveCategory(null) }}
                style={{
                  background: '#00C97A',
                  color: '#000',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Show all crops
              </button>
            </div>
          </div>
        )}

        {/* Scrim overlay — darkens map when bottom sheet is open */}
        <div
          onClick={handleCloseSheet}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(1px)',
            zIndex: 40,
            opacity: selectedPin ? 1 : 0,
            pointerEvents: selectedPin ? 'auto' : 'none',
            transition: 'opacity 0.3s ease',
          }}
        />

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
