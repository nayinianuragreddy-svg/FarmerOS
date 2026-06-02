'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Sprout, Plus, LayoutDashboard, LogOut, ArrowLeft } from 'lucide-react'
import SearchField from './SearchField'

interface AppNavProps {
  /** transparent = scroll-aware over hero/map; solid = always has background */
  variant?: 'transparent' | 'solid'
  showSearch?: boolean
  searchValue?: string
  onSearchChange?: (q: string) => void
  onSearchSubmit?: (q: string) => void
  searchPlaceholder?: string
  isLoggedIn?: boolean
  activeRole?: 'farmer' | 'buyer'
  userName?: string
  onRoleToggle?: () => void
  onLogout?: () => void
  backHref?: string
  backLabel?: string
  /** Logo + back only (auth/focused flows) */
  minimal?: boolean
}

const LINKS = [
  { label: 'Explore Map', href: '/map' },
  { label: 'Live Data', href: '/data', dot: true },
  { label: 'For Farmers', href: '/#for-farmers' },
  { label: 'For Buyers', href: '/#for-buyers' },
]

export default function AppNav({
  variant = 'solid',
  showSearch = false,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder,
  isLoggedIn = false,
  activeRole = 'buyer',
  userName,
  onRoleToggle,
  onLogout,
  backHref,
  backLabel = 'Back',
  minimal = false,
}: AppNavProps) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(variant === 'solid')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (variant === 'solid') return
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [variant])

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <header
      style={{
        position: variant === 'transparent' ? 'fixed' : 'sticky', top: 0, left: 0, right: 0, zIndex: 100, height: 64,
        background: scrolled ? 'rgba(9,14,11,0.78)' : 'rgba(9,14,11,0.2)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        transition: 'background .3s ease, border-color .3s ease',
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto', height: '100%', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Back (optional) */}
        {backHref && (
          <Link href={backHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
            <ArrowLeft size={16} /> <span className="hide-sm">{backLabel}</span>
          </Link>
        )}

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(0,201,122,0.12)', border: '1px solid rgba(0,201,122,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sprout size={17} style={{ color: '#00C97A' }} />
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 17, letterSpacing: '-0.025em' }} className="hide-sm">FarmerOS</span>
        </Link>

        {/* Search (optional) */}
        {showSearch && (
          <div style={{ flex: 1, maxWidth: 440 }}>
            <SearchField
              value={searchValue}
              onChange={onSearchChange || (() => {})}
              onSubmit={onSearchSubmit}
              placeholder={searchPlaceholder || 'Search crops or a place…'}
            />
          </div>
        )}

        {minimal && <div style={{ marginLeft: 'auto' }} />}

        {/* Links */}
        {!minimal && (<>
        <nav className="appnav-links" style={{ display: 'flex', alignItems: 'center', gap: 26, marginLeft: showSearch ? 0 : 'auto' }}>
          {LINKS.map(l => {
            const activeLink = pathname === l.href || (l.href !== '/' && pathname?.startsWith(l.href.split('#')[0]) && !l.href.includes('#'))
            return (
              <Link key={l.label} href={l.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: activeLink ? '#fff' : 'rgba(255,255,255,0.62)', textDecoration: 'none', fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em', borderBottom: activeLink ? '2px solid #00C97A' : '2px solid transparent', paddingBottom: 2, lineHeight: 1 }}>
                {l.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C97A', boxShadow: '0 0 6px #00C97A', animation: 'navPulse 2s ease-in-out infinite' }} />}
                {l.label}
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: showSearch ? 'auto' : 0, flexShrink: 0 }}>
          {isLoggedIn ? (
            <>
              {activeRole === 'farmer' && (
                <Link href="/list" className="app-btn-primary hide-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 14, textDecoration: 'none' }}>
                  <Plus size={16} strokeWidth={2.5} /> List Crop
                </Link>
              )}
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(m => !m)} className="app-btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#00C97A,#005533)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000' }}>
                    {(userName || 'U')[0].toUpperCase()}
                  </span>
                  <span className="hide-sm" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName || 'Account'}</span>
                </button>
                {menuOpen && (
                  <div className="glass-panel" style={{ position: 'absolute', right: 0, top: 48, width: 200, padding: 6, zIndex: 70 }}>
                    <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 4 }}>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{userName || 'Account'}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'capitalize' }}>{activeRole} mode</div>
                    </div>
                    <Link href={`/dashboard/${activeRole}`} onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 8, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 13 }}>
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <button onClick={() => { onRoleToggle?.(); setMenuOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 10px', borderRadius: 8, color: 'rgba(255,255,255,0.75)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, textAlign: 'left' }}>
                      <span>{activeRole === 'farmer' ? '🛒' : '🌾'}</span> Switch to {activeRole === 'farmer' ? 'Buyer' : 'Farmer'}
                    </button>
                    <button onClick={() => { onLogout?.(); setMenuOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 10px', borderRadius: 8, color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 4 }}>
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/auth" className="app-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 14, textDecoration: 'none' }}>
              Sign in <span aria-hidden>→</span>
            </Link>
          )}
        </div>
        </>)}
      </div>

      <style>{`
        @keyframes navPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @media (max-width: 900px) { .appnav-links { display: none !important; } }
        @media (max-width: 600px) { .hide-sm { display: none !important; } }
      `}</style>
    </header>
  )
}
