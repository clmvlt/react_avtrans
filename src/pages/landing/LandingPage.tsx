import { useRef, useState } from 'react'
import { PageMeta } from '@/components/shared/PageMeta'
import { AboutSection } from '@/features/landing/components/AboutSection'
import { ContactSection } from '@/features/landing/components/ContactSection'
import { FaqSection } from '@/features/landing/components/FaqSection'
import { FleetSection } from '@/features/landing/components/FleetSection'
import { FloatingCallButton } from '@/features/landing/components/FloatingCallButton'
import { HeroSection } from '@/features/landing/components/HeroSection'
import { LandingFooter } from '@/features/landing/components/LandingFooter'
import { LandingHeader } from '@/features/landing/components/LandingHeader'
import { ServicesSection } from '@/features/landing/components/ServicesSection'
import { StatsSection } from '@/features/landing/components/StatsSection'
import type { SectionId } from '@/features/landing/data/navLinks'
import { useFluidRootScale } from '@/features/landing/hooks/useFluidRootScale'
import { useForceLightTheme } from '@/features/landing/hooks/useForceLightTheme'
import { useLandingJsonLd } from '@/features/landing/hooks/useLandingJsonLd'
import { useRevealOnScroll } from '@/features/landing/hooks/useRevealOnScroll'
import { scrollToSection } from '@/features/landing/lib/scrollToSection'
import '@/features/landing/landing.css'

/**
 * Landing publique indexée (« / »), toujours en thème clair. Son HTML est pré-rendu par
 * scripts/prerender.cjs : `#app h1`, `id="services"`, `id="contact"`, `<footer>` et aucun
 * `<script>` dans l'arbre (le JSON-LD de la page est injecté dans <head> par useLandingJsonLd).
 * Métadonnées : valeurs par défaut de PageMeta (celles de la landing).
 */
export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useForceLightTheme()
  useFluidRootScale()
  useLandingJsonLd()
  useRevealOnScroll(rootRef)

  // Ancres de l'en-tête et du héro : défilement doux, puis fermeture du menu mobile
  const handleNavigate = (id: SectionId) => {
    if (scrollToSection(id)) setMobileMenuOpen(false)
  }

  return (
    <>
      <PageMeta />

      <div
        ref={rootRef}
        data-landing-root=""
        className="min-h-screen bg-background text-foreground"
      >
        <LandingHeader
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuOpenChange={setMobileMenuOpen}
          onNavigate={handleNavigate}
        />

        <main>
          <HeroSection onNavigate={handleNavigate} />
          <ServicesSection />
          <AboutSection />
          <FleetSection />
          <StatsSection />
          <FaqSection />
          <ContactSection />
        </main>

        <LandingFooter />
        <FloatingCallButton />
      </div>
    </>
  )
}
