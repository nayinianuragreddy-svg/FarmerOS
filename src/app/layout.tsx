import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FarmerOS — India\'s Crop Discovery Map',
  description: 'Geo-first platform connecting Indian farmers directly to buyers. Discover crops growing near you on a live map.',
  keywords: ['farmers', 'crops', 'India', 'agriculture', 'buy vegetables', 'farm fresh', 'direct from farmer'],
  authors: [{ name: 'FarmerOS' }],
  openGraph: {
    title: 'FarmerOS — India\'s Crop Discovery Map',
    description: 'Find fresh crops directly from farmers near you.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0d12',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden bg-[#0a0d12]">
        {children}
      </body>
    </html>
  )
}
