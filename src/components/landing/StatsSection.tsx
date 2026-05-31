'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function animateCounter(
  start: number,
  end: number,
  duration: number,
  onUpdate: (v: number) => void
) {
  const startTime = performance.now()
  function update(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    onUpdate(Math.floor(start + (end - start) * eased))
    if (progress < 1) requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

const STATS = [
  { value: 12, prefix: '', suffix: '', label: 'Crop Categories' },
  { value: 200, prefix: '', suffix: '+', label: 'Crop Varieties' },
  { value: 30, prefix: '', suffix: '', label: 'States Covered' },
  { value: 0, prefix: '₹', suffix: '', label: 'Middlemen Fees' },
]

function StatCard({ stat, active }: { stat: typeof STATS[0]; active: boolean }) {
  const [count, setCount] = useState(0)
  const started = useRef(false)

  const run = useCallback(() => {
    if (started.current) return
    started.current = true
    if (stat.value === 0) { setCount(0); return }
    animateCounter(0, stat.value, 1500, setCount)
  }, [stat.value])

  useEffect(() => {
    if (active) run()
  }, [active, run])

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '40px 32px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '72px',
          fontWeight: 900,
          color: '#00C97A',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          marginBottom: '12px',
          fontFamily: "'Inter', -apple-system, sans-serif",
        }}
      >
        {stat.prefix}{count}{stat.suffix}
      </div>
      <div
        style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.5)',
          fontWeight: 500,
          letterSpacing: '0.01em',
        }}
      >
        {stat.label}
      </div>
    </div>
  )
}

export default function StatsSection() {
  const { ref, visible } = useScrollReveal(0.3)

  return (
    <section
      style={{
        background: '#070C0A',
        padding: '120px 24px',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h2
          style={{
            textAlign: 'center',
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#FFFFFF',
            marginBottom: '64px',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          FarmerOS by the numbers
        </h2>

        <div
          ref={ref}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
          }}
        >
          {STATS.map((stat, i) => (
            <StatCard key={i} stat={stat} active={visible} />
          ))}
        </div>
      </div>
    </section>
  )
}
