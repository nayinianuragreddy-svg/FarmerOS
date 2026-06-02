'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Plus, Sprout, LogOut, LayoutDashboard, Search, X } from 'lucide-react'
import { CROP_TAXONOMY, CATEGORY_CONFIG } from '@/lib/constants'
import { CropCategory } from '@/lib/types'

interface NavbarProps {
  isLoggedIn?: boolean
  activeRole?: 'farmer' | 'buyer'
  userName?: string
  onRoleToggle?: () => void
  onLogout?: () => void
  onSearch?: (query: string) => void
}

// Flatten all crop names for search
const ALL_CROPS = Object.entries(CROP_TAXONOMY).flatMap(([cat, crops]) =>
  crops.map(c => ({ name: c, category: cat as CropCategory }))
)

export default function Navbar({
  isLoggedIn = false,
  activeRole = 'buyer',
  userName,
  onRoleToggle,
  onLogout,
  onSearch,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [suggestions, setSuggestions] = useState<typeof ALL_CROPS>([])
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Search suggestions
  useEffect(() => {
    if (searchVal.trim().length < 1) { setSuggestions([]); return }
    const q = searchVal.toLowerCase()
    setSuggestions(ALL_CROPS.filter(c => c.name.toLowerCase().includes(q)).slice(0, 6))
  }, [searchVal])

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSuggestionClick = (name: string) => {
    setSearchVal(name)
    setSuggestions([])
    onSearch?.(name)
    searchRef.current?.blur()
  }

  const clearSearch = () => {
    setSearchVal('')
    setSuggestions([])
    onSearch?.('')
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-3 pointer-events-none">

      {/* ── Logo ─────────────────────────────────────────────── */}
      <Link
        href="/"
        className="pointer-events-auto flex-shrink-0 flex items-center gap-2.5 glass-panel px-4 py-2.5 hover:border-white/20 transition-all duration-200 group"
      >
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-500/30 transition">
          <Sprout className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="hidden sm:block">
          <div className="text-white font-bold text-sm leading-none tracking-tight">FarmerOS</div>
          <div className="text-white/30 text-[10px] leading-none mt-0.5">India&apos;s Crop Map</div>
        </div>
      </Link>

      {/* ── Search bar ───────────────────────────────────────── */}
      <div className="pointer-events-auto flex-1 relative max-w-xl">
        <div className={`glass-panel flex items-center gap-2 px-3 py-2 transition-all duration-200 ${
          searchFocused ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5' : 'hover:border-white/20'
        }`}>
          <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
          <input
            ref={searchRef}
            type="text"
            value={searchVal}
            onChange={e => { setSearchVal(e.target.value); onSearch?.(e.target.value) }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            placeholder="Search crops — tomato, wheat, grapes…"
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/25 outline-none min-w-0"
          />
          {searchVal && (
            <button onClick={clearSearch} className="text-white/30 hover:text-white/60 transition">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && searchFocused && (
          <div className="absolute top-full mt-1.5 left-0 right-0 glass-panel py-1 overflow-hidden z-50">
            {suggestions.map((s, i) => {
              const config = CATEGORY_CONFIG[s.category]
              return (
                <button
                  key={i}
                  onMouseDown={() => handleSuggestionClick(s.name)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition text-left"
                >
                  <span className="text-base flex-shrink-0">{config.emoji}</span>
                  <span className="text-white/80 text-sm truncate">{s.name}</span>
                  <span className="text-white/30 text-xs ml-auto flex-shrink-0">{config.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Right side ───────────────────────────────────────── */}
      <div className="pointer-events-auto flex items-center gap-2 flex-shrink-0">
        {isLoggedIn ? (
          <>
            {/* Role toggle pill */}
            <button
              onClick={onRoleToggle}
              className="hidden sm:flex items-center gap-2 glass-panel px-3 py-2 hover:border-white/20 transition text-sm font-medium"
            >
              <span className="text-base">{activeRole === 'farmer' ? '🌾' : '🛒'}</span>
              <span className="text-white/70">{activeRole === 'farmer' ? 'Farmer' : 'Buyer'}</span>
            </button>

            {/* List crop CTA */}
            {activeRole === 'farmer' && (
              <Link
                href="/list"
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-150 shadow-lg shadow-emerald-500/25"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>List Crop</span>
              </Link>
            )}

            {/* Account menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(m => !m)}
                className="glass-panel flex items-center gap-2 px-3 py-2 hover:border-white/20 transition"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <span className="text-emerald-400 text-xs font-bold">
                    {(userName || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-white/70 text-sm max-w-20 truncate">{userName || 'Account'}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 glass-panel py-1 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-white/8">
                    <p className="text-white text-sm font-semibold truncate">{userName}</p>
                    <p className="text-white/40 text-xs mt-0.5 capitalize">{activeRole} mode</p>
                  </div>
                  <Link
                    href={`/dashboard/${activeRole}`}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <button
                    className="sm:hidden flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
                    onClick={() => { onRoleToggle?.(); setMenuOpen(false) }}
                  >
                    <span>{activeRole === 'farmer' ? '🛒' : '🌾'}</span>
                    Switch to {activeRole === 'farmer' ? 'Buyer' : 'Farmer'}
                  </button>
                  <button
                    onClick={() => { onLogout?.(); setMenuOpen(false) }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition border-t border-white/8"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              href="/data"
              className="hidden md:flex items-center px-3.5 py-2.5 text-sm font-medium text-white/55 hover:text-white transition-colors duration-200"
            >
              Live Data
            </Link>
            <Link
              href="/auth"
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.97] text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-all duration-150 shadow-lg shadow-emerald-500/25"
            >
              <span>Sign in</span>
              <span aria-hidden>→</span>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
