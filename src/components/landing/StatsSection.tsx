'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const STATS = [
  { value: 12, prefix: '', suffix: '', label: 'Crop Categories' },
  { value: 200, prefix: '', suffix: '+', label: 'Varieties Listed' },
  { value: 30, prefix: '', suffix: '', label: 'States Covered' },
  { value: 0, prefix: '₹', suffix: '', label: 'Platform Fee' },
]

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)

  const start = useCallback(() => {
    if (target === 0) { setCount(0); return }
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.round(easeOutExpo(progress) * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [target, duration])

  useEffect(() => {
    if (active) start()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [active, start])

  return count
}

function StatCard({ stat, active }: { stat: typeof STATS[0]; active: boolean }) {
  const count = useCountUp(stat.value, 1500, active)
  return (
    <div
      className="glass-panel"
      style={{
        padding: '40px 32px',
        textAlign: 'center',
        border: '1px solid rgba(212,132,26,0.12)',
      }}
    >
      <div
        style={{
          fontSize: 'clamp(52px, 5vw, 72px)',
          fontWeight: 700,
          fontFamily: 'JetBrains Mono, Courier New, monospace',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: '#D4841A',
          marginBottom: '12px',
        }}
      >
        {stat.prefix}{count}{stat.suffix}
      </div>
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.5)',
          fontWeight: 500,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {stat.label}
      </div>
    </div>
  )
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true) },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      style={{
        background: '#0A0F0A',
        padding: '120px 24px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2
            style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#FFFFFF',
            }}
          >
            FarmerOS by the numbers
          </h2>
        </div>

        <div
          ref={ref}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
          }}
        >
          {STATS.map((stat, i) => (
            <StatCard key={i} stat={stat} active={active} />
          ))}
        </div>
      </div>
    </section>
  )
}
