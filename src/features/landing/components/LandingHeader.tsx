import { Menu, X } from 'lucide-react'
import { Link } from 'react-router'
import logoImg from '@/assets/logo.png'
import { cn } from '@/lib/utils'
import { CLIENT_SPACE_URL } from '../data/contact'
import { navLinks, type SectionId } from '../data/navLinks'
import { useScrolledPast } from '../hooks/useScrolledPast'
import { LandingMobileMenu } from './LandingMobileMenu'

/** Au-delà de ce défilement (px), l'en-tête devient opaque et ses textes passent en sombre */
const SCROLLED_THRESHOLD_PX = 50

type LandingHeaderProps = {
  mobileMenuOpen: boolean
  onMobileMenuOpenChange: (open: boolean) => void
  onNavigate: (id: SectionId) => void
}

/** En-tête fixe de la landing : transparent sur le héro, flouté et opaque une fois la page défilée. */
export function LandingHeader({
  mobileMenuOpen,
  onMobileMenuOpenChange,
  onNavigate,
}: LandingHeaderProps) {
  const isScrolled = useScrolledPast(SCROLLED_THRESHOLD_PX)
  const MenuIcon = mobileMenuOpen ? X : Menu

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        isScrolled && 'border-b border-border/50 bg-background/80 shadow-sm backdrop-blur-xl',
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo. Déjà sur « / » : comme le RouterLink du Vue, le clic ne fait pas remonter la page */}
          <Link
            to="/"
            preventScrollReset
            className="flex items-center gap-3"
            aria-label="AVTRANS Concept — Accueil"
          >
            <img
              src={logoImg}
              alt="Logo AVTRANS Concept"
              width={40}
              height={40}
              className="size-10 rounded-xl shadow-lg"
            />
            <div className="flex flex-col">
              <span
                className={cn(
                  'text-lg font-bold tracking-tight transition-colors duration-300',
                  isScrolled ? 'text-foreground' : 'text-white',
                )}
              >
                AVTRANS
              </span>
              <span
                className={cn(
                  'text-[0.6875rem] font-medium tracking-wider uppercase transition-colors duration-300',
                  isScrolled ? 'text-muted-foreground' : 'text-white/60',
                )}
              >
                Solutions Transport
              </span>
            </div>
          </Link>

          {/* Navigation desktop : vrais liens d'ancre (crawlables, accessibles), défilement doux en JS */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(event) => {
                  event.preventDefault()
                  onNavigate(link.id)
                }}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  isScrolled
                    ? 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA desktop : liens stylés en bouton (le Vue imbriquait un <button> dans le lien,
              MIGRATION.md 8.1) */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/login"
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                isScrolled
                  ? 'border-border text-foreground hover:bg-accent'
                  : 'border-white/25 text-white hover:bg-white/10',
              )}
            >
              Espace Employé
            </Link>
            <a
              href={CLIENT_SPACE_URL}
              target="_blank"
              rel="noopener"
              className={cn(
                'rounded-lg px-5 py-2 text-sm font-semibold transition-all',
                isScrolled
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-white text-gray-900 hover:bg-white/90',
              )}
            >
              Espace Client
            </a>
          </div>

          {/* Bouton du menu mobile. aria-controls vise un élément absent quand le menu est fermé,
              comme dans le Vue. */}
          <button
            type="button"
            onClick={() => onMobileMenuOpenChange(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className={cn(
              'inline-flex items-center justify-center rounded-lg p-2 transition-colors lg:hidden',
              isScrolled ? 'text-foreground hover:bg-accent' : 'text-white hover:bg-white/10',
            )}
          >
            <MenuIcon className="size-6" />
          </button>
        </div>
      </div>

      <LandingMobileMenu open={mobileMenuOpen} onNavigate={onNavigate} />
    </header>
  )
}
