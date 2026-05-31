'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { SUPPORTED_LANGUAGES, LangCode } from '@/lib/api'

interface LanguageSelectorProps {
  currentLang?: LangCode
  onChange?: (lang: LangCode) => void
  compact?: boolean
}

export default function LanguageSelector({
  currentLang = 'en',
  onChange,
  compact = false,
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 glass-panel px-3 py-2 hover:border-white/20 transition text-sm"
        title="Change language — Bhashini API (22 Indian languages)"
      >
        <Globe className="w-3.5 h-3.5 text-white/50" />
        {!compact && (
          <span className="text-white/70 font-medium hidden sm:block">
            {current.nativeLabel}
          </span>
        )}
        <span className="text-white/40 text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 z-50 overflow-hidden"
          style={{
            background: 'rgba(8,11,18,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(24px)',
          }}>
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-white/8">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
              Language · भाषा · భాష
            </p>
            <p className="text-white/25 text-[10px] mt-0.5">Powered by Bhashini API (Free)</p>
          </div>

          {/* Language list */}
          <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
            {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  onChange?.(lang.code)
                  setOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition hover:bg-white/5 ${
                  lang.code === currentLang ? 'bg-emerald-500/10' : ''
                }`}
              >
                <span className="text-base w-6 flex-shrink-0">{lang.flag}</span>
                <div className="min-w-0">
                  <p className={`text-sm font-medium leading-none ${
                    lang.code === currentLang ? 'text-emerald-400' : 'text-white/80'
                  }`}>
                    {lang.nativeLabel}
                  </p>
                  <p className="text-white/30 text-[11px] mt-0.5">{lang.label}</p>
                </div>
                {lang.code === currentLang && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Footer note */}
          <div className="px-3 py-2 border-t border-white/8">
            <p className="text-white/20 text-[10px] text-center">
              Full translation via Bhashini coming in V2
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
