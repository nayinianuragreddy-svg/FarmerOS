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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0A0F0A] text-white">
        {children}
      </body>
    </html>
  )
}
