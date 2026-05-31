'use client'

import Link from 'next/link'
import { ArrowLeft, Sprout } from 'lucide-react'

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  centered?: boolean
}

const maxWidths = {
  sm:  'max-w-sm',
  md:  'max-w-md',
  lg:  'max-w-2xl',
  xl:  'max-w-4xl',
  '2xl': 'max-w-6xl',
}

export default function PageLayout({
  children,
  title,
  subtitle,
  backHref = '/',
  backLabel = 'Back to map',
  maxWidth = 'lg',
  centered = false,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#060914]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-white/6"
        style={{ background: 'rgba(6,9,20,0.9)', backdropFilter: 'blur(20px)' }}>
        <div className={`${maxWidths[maxWidth]} mx-auto px-4 h-14 flex items-center justify-between`}>
          <Link
            href={backHref}
            className="flex items-center gap-2 text-white/50 hover:text-white/90 transition text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {backLabel}
          </Link>
          <Link href="/" className="flex items-center gap-2 opacity-70 hover:opacity-100 transition">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-bold text-sm">FarmerOS</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className={`${maxWidths[maxWidth]} mx-auto px-4 py-8 ${centered ? 'flex flex-col items-center justify-center min-h-[calc(100vh-56px)]' : ''}`}>
        {(title || subtitle) && (
          <div className={`mb-8 ${centered ? 'text-center' : ''}`}>
            {title && <h1 className="text-white font-bold text-2xl sm:text-3xl">{title}</h1>}
            {subtitle && <p className="text-white/40 text-sm mt-1.5">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
