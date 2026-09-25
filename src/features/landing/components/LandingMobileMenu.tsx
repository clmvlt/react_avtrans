import { Link } from 'react-router'
import { CLIENT_SPACE_URL } from '../data/contact'
import { navLinks, type SectionId } from '../data/navLinks'
import { usePresence } from '../hooks/usePresence'

type LandingMobileMenuProps = {
  open: boolean
  onNavigate: (id: SectionId) => void
}

/**
 * Menu mobile de la landing (sous `lg`), sous l'en-tête. Retiré du DOM quand il est fermé,
 * après un fondu (mêmes durées que la `<Transition>` du Vue : 200 ms à l'ouverture, 150 ms à la
 * fermeture).
 */
export function LandingMobileMenu({ open, onNavigate }: LandingMobileMenuProps) {
  const { isMounted, state, onAnimationEnd } = usePresence(open)
  if (!isMounted) return null

  return (
    <div
      id="mobile-menu"
      data-state={state}
      onAnimationEnd={onAnimationEnd}
      className="border-b border-border bg-background/95 backdrop-blur-xl data-[state=closed]:animate-out data-[state=closed]:duration-150 data-[state=closed]:ease-in data-[state=closed]:fill-mode-forwards data-[state=closed]:fade-out data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:duration-200 data-[state=open]:ease-out data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2 lg:hidden"
    >
      <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4" aria-label="Navigation mobile">
        {navLinks.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(event) => {
              event.preventDefault()
              onNavigate(link.id)
            }}
            className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {link.label}
          </a>
        ))}
        <div className="my-3 h-px bg-border" />
        <div className="flex gap-3 px-4">
          {/* Liens stylés en bouton (le Vue imbriquait un <button> dans le lien, MIGRATION.md 8.1) */}
          <Link
            to="/login"
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Espace Employé
          </Link>
          <a
            href={CLIENT_SPACE_URL}
            target="_blank"
            rel="noopener"
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Espace Client
          </a>
        </div>
      </nav>
    </div>
  )
}
