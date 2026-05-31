'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import { MOCK_PINS } from '@/lib/mock-data'

const FarmerOSMap = dynamic(() => import('@/components/map/FarmerOSMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#060914] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-emerald-500/10 border-b-emerald-400/60 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
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
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#060914]">
      <Navbar onSearch={setSearchQuery} />
      <FarmerOSMap pins={MOCK_PINS} isLoggedIn={false} searchQuery={searchQuery} />
    </div>
  )
}
