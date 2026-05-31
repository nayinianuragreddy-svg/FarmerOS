'use client'

import dynamic from 'next/dynamic'
import Navbar from '@/components/ui/Navbar'
import { MOCK_PINS } from '@/lib/mock-data'

// MapLibre uses window/DOM — must be client-only with ssr:false
const FarmerOSMap = dynamic(() => import('@/components/map/FarmerOSMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#0a0d12] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-white/40 text-sm">Loading map…</p>
      </div>
    </div>
  ),
})

export default function HomeClient() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0d12]">
      <Navbar />
      <FarmerOSMap pins={MOCK_PINS} isLoggedIn={false} />
    </div>
  )
}
