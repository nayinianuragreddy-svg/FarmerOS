'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Plus, User, Sprout, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react'

interface NavbarProps {
  isLoggedIn?: boolean
  activeRole?: 'farmer' | 'buyer'
  userName?: string
  onRoleToggle?: () => void
  onLogout?: () => void
}

export default function Navbar({
  isLoggedIn = false,
  activeRole = 'buyer',
  userName,
  onRoleToggle,
  onLogout,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 pointer-events-none">
      {/* Logo */}
      <Link
        href="/"
        className="pointer-events-auto flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 hover:border-white/20 transition"
      >
        <Sprout className="w-5 h-5 text-emerald-400" />
        <span className="text-white font-bold text-base tracking-tight">FarmerOS</span>
        <span className="hidden sm:block text-white/30 text-xs">India&apos;s Crop Map</span>
      </Link>

      {/* Right side */}
      <div className="pointer-events-auto flex items-center gap-2">
        {isLoggedIn ? (
          <>
            {/* Role toggle */}
            <button
              onClick={onRoleToggle}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium backdrop-blur-sm transition ${
                activeRole === 'farmer'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-blue-500/20 border-blue-500/40 text-blue-400'
              }`}
            >
              <span className="text-base">{activeRole === 'farmer' ? '🌾' : '🛒'}</span>
              <span>{activeRole === 'farmer' ? 'Farmer mode' : 'Buyer mode'}</span>
            </button>

            {/* List a crop */}
            {activeRole === 'farmer' && (
              <Link
                href="/list"
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3 py-2 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>List Crop</span>
              </Link>
            )}

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(m => !m)}
                className="flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 text-sm text-white/80 transition"
              >
                <User className="w-4 h-4 text-white/50" />
                <span className="hidden sm:block max-w-24 truncate">{userName || 'Account'}</span>
                <ChevronDown className="w-3 h-3 text-white/40" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#0f1117] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                  <Link
                    href={`/dashboard/${activeRole}`}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  {/* Mobile role toggle */}
                  <button
                    className="sm:hidden flex items-center gap-2.5 w-full px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition"
                    onClick={() => { onRoleToggle?.(); setMenuOpen(false) }}
                  >
                    <span>{activeRole === 'farmer' ? '🛒' : '🌾'}</span>
                    Switch to {activeRole === 'farmer' ? 'Buyer' : 'Farmer'}
                  </button>
                  <button
                    onClick={() => { onLogout?.(); setMenuOpen(false) }}
                    className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition border-t border-white/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            href="/auth"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
          >
            <User className="w-4 h-4" />
            <span>Login / Sign up</span>
          </Link>
        )}
      </div>
    </header>
  )
}
