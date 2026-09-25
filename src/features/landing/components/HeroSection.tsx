import { ArrowRight, ChevronDown, Phone } from 'lucide-react'
import { Fragment, type MouseEvent } from 'react'
import locauxImg from '@/assets/images/locaux.webp'
import locauxImgSm from '@/assets/images/locaux-800.webp'
import type { SectionId } from '../data/navLinks'
import { useParallax } from '../hooks/useParallax'

const HERO_TAGS = ['Coursier', 'Messagerie', 'Fret', 'Poids lourd', 'Température dirigée']

type HeroSectionProps = {
  onNavigate: (id: SectionId) => void
}

/**
 * Héro plein écran : image LCP (variante 800 px pour le mobile) avec zoom lent, badge, h1,
 * services, CTA et indicateur de défilement. En parallaxe (desktop), chaque calque se décale
 * d'une fraction de `--parallax-y`, écrite par useParallax sur la section.
 */
export function HeroSection({ onNavigate }: HeroSectionProps) {
  const { ref, enabled: parallax } = useParallax<HTMLElement>()

  const handleAnchorClick = (id: SectionId) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    onNavigate(id)
  }

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex min-h-[100dvh] items-center overflow-hidden"
      aria-label="Présentation"
    >
      {/* Arrière-plan */}
      <div className="absolute inset-0">
        <div
          className={
            parallax
              ? 'absolute inset-[-5%] translate-y-[calc(var(--parallax-y,0px)*0.3)]'
              : 'absolute inset-0'
          }
        >
          <img
            srcSet={`${locauxImgSm} 800w, ${locauxImg} 1600w`}
            sizes="100vw"
            src={locauxImg}
            width={1600}
            height={1200}
            fetchPriority="high"
            decoding="async"
            alt="Flotte de véhicules AVTRANS Concept devant les locaux à Pommeret, Côtes-d'Armor — coursier et transport Bretagne"
            className="size-full animate-[hero-zoom_25s_ease-out_forwards] object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-br from-gray-900/90 via-gray-900/70 to-gray-900/40" />
        <div className="absolute inset-0 bg-linear-to-t from-gray-900/50 via-transparent to-gray-900/20" />
      </div>

      {/* Contenu */}
      <div className="relative mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className={parallax ? 'translate-y-[calc(var(--parallax-y,0px)*-0.15)]' : undefined}>
            <div className="reveal mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-sm font-medium text-white/90">
                Coursier & transport en Bretagne
              </span>
            </div>
          </div>

          {/* Titre + services */}
          <div className={parallax ? 'translate-y-[calc(var(--parallax-y,0px)*0.1)]' : undefined}>
            <h1 className="reveal mb-6 text-4xl leading-[1.1] font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Coursier & transport{' '}
              <span className="bg-linear-to-r from-violet-300 to-purple-200 bg-clip-text text-transparent">
                en Bretagne
              </span>
            </h1>

            <p className="reveal mb-4 flex flex-wrap items-center gap-2 text-sm font-semibold tracking-widest text-white/50 uppercase sm:gap-3 sm:text-base">
              {HERO_TAGS.map((tag, index) => (
                <Fragment key={tag}>
                  {index > 0 && <span className="size-1 rounded-full bg-violet-400" />}
                  <span>{tag}</span>
                </Fragment>
              ))}
            </p>
          </div>

          {/* Description + CTA */}
          <div className={parallax ? 'translate-y-[calc(var(--parallax-y,0px)*0.05)]' : undefined}>
            <p className="reveal mb-10 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
              Coursier et messagerie express depuis Saint-Brieuc, Lamballe et les Côtes-d'Armor vers
              la France entière. Fret, livraison en poids lourd et température dirigée pour toutes
              vos marchandises.
            </p>

            <div className="reveal flex flex-col gap-4 sm:flex-row">
              <a
                href="#services"
                onClick={handleAnchorClick('services')}
                className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-gray-900 shadow-lg shadow-white/10 transition-all hover:bg-white/90 hover:shadow-xl hover:shadow-white/20"
              >
                Découvrir nos services
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#contact"
                onClick={handleAnchorClick('contact')}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/20 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
              >
                <Phone className="size-5" />
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateur de défilement */}
      <div className="absolute inset-x-0 bottom-8 flex justify-center">
        <a
          href="#services"
          onClick={handleAnchorClick('services')}
          className="inline-flex animate-bounce text-white/40 transition-colors hover:text-white/70"
          aria-label="Défiler vers nos services"
        >
          <ChevronDown className="size-8" />
        </a>
      </div>
    </section>
  )
}
