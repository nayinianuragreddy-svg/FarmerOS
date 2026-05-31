'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import { MOCK_PINS } from '@/lib/mock-data'
import { useAuthStore } from '@/store/authStore'
import { MapPin } from '@/lib/types'

const FarmerOSMap = dynamic(() => import('@/components/map/FarmerOSMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-[#060914] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <div
            className="absolute inset-2 rounded-full border-2 border-emerald-500/10 border-b-emerald-400/60 animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
          />
        </div>
        <div className="text-center">
          <p className="text-white/50 text-sm font-medium">Loading India&apos;s Crop Map</p>
          <p className="text-white/25 text-xs mt-1">Fetching live listings…</p>
        </div>
      </div>
    </div>
  ),
})

export default function MapClient() {
  const router = useRouter()
  const { user, activeRole, farmerProfile, buyerProfile, myListings, setActiveRole, logout } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  const isLoggedIn = !!user

  const userPins: MapPin[] = myListings
    .filter(l => l.status === 'active')
    .map(l => ({
      id: l.id,
      latitude: l.latitude,
      longitude: l.longitude,
      crop_name: l.crop_name,
      crop_category: l.crop_category,
      is_organic: l.is_organic,
      images: l.images,
      district: l.farmer?.district || '',
      state: l.farmer?.state || '',
      quantity: l.quantity,
      unit: l.unit,
      farmer_name: l.farmer?.name,
      farmer_phone: l.farmer?.village,
      farmer_village: l.farmer?.village,
      rating_avg: l.farmer?.rating_avg || 0,
      status: 'active' as const,
    }))

  const allPins: MapPin[] = [...userPins, ...MOCK_PINS]

  const handleRoleToggle = () => {
    const next = activeRole === 'farmer' ? 'buyer' : 'farmer'
    setActiveRole(next)
    if (next === 'farmer' && !farmerProfile) router.push('/auth/setup')
    if (next === 'buyer' && !buyerProfile) router.push('/auth/setup')
  }

  const handleLogout = () => {
    logout()
    router.refresh()
  }

  const displayName = activeRole === 'farmer'
    ? farmerProfile?.name
    : buyerProfile?.name

  return (
    <div
      className="w-screen bg-[#060914] map-page"
      style={{
        height: '100svh',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '56px', // Reserve space for the absolutely-positioned Navbar
      }}
    >
      {/* Absolutely positioned Navbar */}
      <Navbar
        isLoggedIn={isLoggedIn}
        activeRole={activeRole}
        userName={displayName}
        onSearch={setSearchQuery}
        onRoleToggle={handleRoleToggle}
        onLogout={handleLogout}
      />

      {/* Map fills the rest — FarmerOSMap handles category bar + map + bottom sheet internally */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <FarmerOSMap
          pins={allPins}
          isLoggedIn={isLoggedIn}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  )
}
