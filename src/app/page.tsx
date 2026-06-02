import AppNav from '@/components/ui/AppNav'
import HeroSection from '@/components/landing/HeroSection'
import PriceTicker from '@/components/landing/PriceTicker'
import ProblemSection from '@/components/landing/ProblemSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import ForFarmersSection from '@/components/landing/ForFarmersSection'
import ForBuyersSection from '@/components/landing/ForBuyersSection'
import StatsSection from '@/components/landing/StatsSection'
import VisionSection from '@/components/landing/VisionSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <main style={{ background: '#070C0A' }}>
      <AppNav variant="transparent" />
      <HeroSection />
      <PriceTicker />
      <ProblemSection />
      <HowItWorksSection />
      <ForFarmersSection />
      <ForBuyersSection />
      <StatsSection />
      <VisionSection />
      <CTASection />
      <Footer />
    </main>
  )
}
