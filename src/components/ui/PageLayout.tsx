'use client'

import { useRouter } from 'next/navigation'
import AppNav from './AppNav'
import { useAuthStore } from '@/store/authStore'

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
  backHref = '/map',
  backLabel = 'Back to map',
  maxWidth = 'lg',
  centered = false,
}: PageLayoutProps) {
  const router = useRouter()
  const { user, activeRole, farmerProfile, buyerProfile, setActiveRole, logout } = useAuthStore()

  const displayName = activeRole === 'farmer' ? farmerProfile?.name : buyerProfile?.name

  const handleRoleToggle = () => {
    const next = activeRole === 'farmer' ? 'buyer' : 'farmer'
    setActiveRole(next)
    if (next === 'farmer' && !farmerProfile) router.push('/auth/setup')
    else if (next === 'buyer' && !buyerProfile) router.push('/auth/setup')
    else router.push(`/dashboard/${next}`)
  }

  const handleLogout = () => { logout(); router.replace('/') }

  return (
    <div className="min-h-screen bg-[#070C0A]">
      <AppNav
        variant="solid"
        isLoggedIn={!!user}
        activeRole={activeRole}
        userName={displayName}
        onRoleToggle={handleRoleToggle}
        onLogout={handleLogout}
        backHref={backHref}
        backLabel={backLabel}
      />

      <div className={`${maxWidths[maxWidth]} mx-auto px-4 py-8 ${centered ? 'flex flex-col items-center justify-center min-h-[calc(100vh-64px)]' : ''}`}>
        {(title || subtitle) && (
          <div className={`mb-8 ${centered ? 'text-center' : ''}`}>
            {title && <h1 className="text-white font-bold text-2xl sm:text-3xl">{title}</h1>}
            {subtitle && <p className="text-white/45 text-sm mt-1.5">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
