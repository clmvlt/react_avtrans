import { NavLink } from 'react-router'
import { mainNavLinks, type NavLinkConfig } from '@/config/navConfig'
import { usePendingUsers } from '@/features/users/api/usePendingUsers'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePermissions } from '@/hooks/usePermissions'
import { filterNavLinks } from '@/lib/filterNav'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

// Calcul heuristique du Vue : combien de liens tiennent dans la zone gauche de la navbar,
// avec ou sans libellé. Les liens en trop sont masqués (ils restent dans le menu latéral).
const ICON_ONLY_WIDTH = 40
const CHAR_WIDTH = 7.5
const LINK_GAP = 8
const LINKS_GAP = 4
const BRAND_WIDTH_DESKTOP = 140
const BRAND_WIDTH_MOBILE = 40
const SECTION_GAP = 24
const SM_BREAKPOINT = 640

function getLinkWidth(link: NavLinkConfig, withLabel: boolean): number {
  if (!withLabel) return ICON_ONLY_WIDTH + LINKS_GAP
  return ICON_ONLY_WIDTH + LINK_GAP + link.label.length * CHAR_WIDTH + LINKS_GAP
}

/** Nombre de liens qui tiennent dans `width`, dans l'ordre, en s'arrêtant au premier qui déborde. */
function countFittingLinks(links: NavLinkConfig[], width: number, withLabel: boolean): number {
  let usedWidth = 0
  let count = 0
  for (const link of links) {
    const linkWidth = getLinkWidth(link, withLabel)
    if (usedWidth + linkWidth > width) break
    usedWidth += linkWidth
    count++
  }
  return count
}

type NavbarLinksProps = {
  /** Largeur mesurée de la zone gauche (logo + séparateur + liens) */
  availableWidth: number
}

/** Liens principaux de la navbar, filtrés par rôle, réduits à ce qui tient dans la largeur. */
export function NavbarLinks({ availableWidth }: NavbarLinksProps) {
  const userEmail = useAuthStore((s) => s.user?.email)
  const { canAccess } = usePermissions()
  const isMobile = useMediaQuery(`(max-width: ${SM_BREAKPOINT - 1}px)`)
  const { pendingCount } = usePendingUsers()

  const links = filterNavLinks(mainNavLinks, canAccess, userEmail)
  if (links.length === 0) return null

  const spaceForLinks =
    availableWidth - (isMobile ? BRAND_WIDTH_MOBILE : BRAND_WIDTH_DESKTOP) - SECTION_GAP
  const countWithLabels = countFittingLinks(links, spaceForLinks, true)
  const countIconsOnly = countFittingLinks(links, spaceForLinks, false)
  const showLabels =
    !isMobile && (countWithLabels >= Math.min(countIconsOnly, 2) || spaceForLinks > 300)
  const visibleCount = spaceForLinks <= 0 ? 0 : showLabels ? countWithLabels : countIconsOnly

  // Badge : comptes en attente d'activation sur « Utilisateurs »
  const linkBadge = (to: string) => (to === '/users' ? pendingCount : 0)

  return (
    <div className="flex items-center gap-1">
      {links.slice(0, visibleCount).map((link) => {
        const badge = linkBadge(link.to)
        return (
          <NavLink
            key={link.to}
            to={link.to}
            // Routes à plat dans le Vue : un lien n'est actif que sur son propre chemin
            end
            className={({ isActive }) =>
              cn(
                'flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                // Le Vue forçait ces classes avec `!` (actif prioritaire sur le survol)
                isActive &&
                  'bg-primary/10 font-semibold text-primary hover:bg-primary/10 hover:text-primary',
              )
            }
          >
            {link.lucideIcon && <link.lucideIcon className="size-4 shrink-0" />}
            {badge > 0 && (
              <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-bold text-destructive-foreground">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
            {showLabels && <span>{link.label}</span>}
          </NavLink>
        )
      })}
    </div>
  )
}
