'use client'

import { useState, useEffect, useRef } from 'react'

const STEPS = [
  { amount: '₹1.00', color: '#FFFFFF', label: 'You pay ₹1 for vegetables at the market', who: '' },
  { amount: '₹0.85', color: '#FDE68A', label: '— Transport & handling agent took ₹0.15', who: '-₹0.15 Transport agent' },
  { amount: '₹0.67', color: '#FBB96E', label: '— Commission trader at mandi took ₹0.18', who: '-₹0.18 Commission trader' },
  { amount: '₹0.52', color: '#F97316', label: '— Wholesale distributor took ₹0.15', who: '-₹0.15 Wholesale distributor' },
  { amount: '₹0.33', color: '#EF4444', label: '← This is ALL the farmer receives', who: "Farmer's share" },
]

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [currentStep, setCurrentStep] = useState(-1)
  const [hasAnimated, setHasAnimated] = useState(false)
  const [showEpilogue, setShowEpilogue] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          setCurrentStep(0)
          setTimeout(() => setCurrentStep(1), 1000)
          setTimeout(() => setCurrentStep(2), 2000)
          setTimeout(() => setCurrentStep(3), 3000)
          setTimeout(() => setCurrentStep(4), 4000)
        }
      },
      { threshold: 0.4 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [hasAnimated])

  useEffect(() => {
    if (currentStep === 4) {
      const t = setTimeout(() => setShowEpilogue(true), 600)
      return () => clearTimeout(t)
    }
  }, [currentStep])

  const stepIndex = currentStep >= 0 ? currentStep : 0

  return (
    <section
      ref={sectionRef}
      style={{
        minHeight: '70vh',
        background: '#070C0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Amount display */}
        <div
          key={currentStep}
          style={{
            fontSize: 'clamp(80px, 13vw, 140px)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            color: currentStep >= 0 ? STEPS[stepIndex].color : 'rgba(255,255,255,0.25)',
            transition: 'color 0.5s ease',
            animation: currentStep >= 0 ? 'stepFade 0.35s ease both' : 'none',
          }}
        >
          {currentStep >= 0 ? STEPS[stepIndex].amount : '₹1.00'}
        </div>

        {/* Who label */}
        <div
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.4)',
            marginTop: 4,
            fontFamily: 'monospace',
            minHeight: 20,
          }}
        >
          {currentStep > 0 ? STEPS[stepIndex].who : ' '}
        </div>

        {/* Main label */}
        <div
          style={{
            fontSize: 'clamp(18px, 2.5vw, 22px)',
            color: 'rgba(255,255,255,0.55)',
            marginTop: 12,
            lineHeight: 1.5,
            minHeight: 36,
          }}
        >
          {currentStep >= 0 ? STEPS[stepIndex].label : 'Scroll to see where your rupee goes'}
        </div>

        {/* Step dots */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 32,
            justifyContent: 'center',
          }}
        >
          {STEPS.map((step, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i <= stepIndex && currentStep >= 0 ? step.color : 'transparent',
                border: i <= stepIndex && currentStep >= 0 ? 'none' : '1px solid rgba(255,255,255,0.2)',
                transition: 'background 0.4s ease, border 0.4s ease',
              }}
            />
          ))}
        </div>

        {/* Epilogue */}
        <div
          style={{
            marginTop: 48,
            opacity: showEpilogue ? 1 : 0,
            transition: 'opacity 0.8s ease',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 1,
              background: 'rgba(255,255,255,0.12)',
              margin: '0 auto 32px',
            }}
          />
          <p
            style={{
              fontSize: 22,
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 600,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            ₹300 billion market. 146 million farmers.
          </p>
          <p
            style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.3)',
              marginTop: 12,
              margin: '12px 0 0',
            }}
          >
            For 70 years, they had no map.
          </p>
          <p
            style={{
              fontSize: 38,
              color: '#00C97A',
              fontWeight: 800,
              marginTop: 28,
              letterSpacing: '-0.03em',
              margin: '28px 0 0',
            }}
          >
            Until now.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes stepFade {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  )
}
