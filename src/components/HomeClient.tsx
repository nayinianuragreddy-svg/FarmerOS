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
    <div className="absolute inset-0 bg-[#060914] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-emerald-500/10 border-b-emerald-400/60 animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <div className="text-center">
          <p className="text-white/50 text-sm font-medium">Loading India&apos;s Crop Map</p>
          <p className="text-white/25 text-xs mt-1">Fetching live listings…</p>
        </div>
      </div>
    </div>
  ),
})

export default function HomeClient() {
  const router = useRouter()
  const { user, activeRole, farmerProfile, buyerProfile, myListings, setActiveRole, logout } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  const isLoggedIn = !!user

  // Combine mock pins + user's own listings as map pins
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
    <div className="relative w-screen h-screen overflow-hidden bg-[#060914]">
      <Navbar
        isLoggedIn={isLoggedIn}
        activeRole={activeRole}
        userName={displayName}
        onSearch={setSearchQuery}
        onRoleToggle={handleRoleToggle}
        onLogout={handleLogout}
      />
      <FarmerOSMap
        pins={allPins}
        isLoggedIn={isLoggedIn}
        searchQuery={searchQuery}
      />
    </div>
  )
}
