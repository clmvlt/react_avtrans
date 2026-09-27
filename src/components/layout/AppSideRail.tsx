import { Link, NavLink } from 'react-router'
import faviconUrl from '@/assets/favicon.png'
import { getDefaultRoute } from '@/lib/getDefaultRoute'
import { cn } from '@/lib/utils'
import { selectRoleUuid, useAuthStore } from '@/stores/auth-store'
import { NavUser } from './NavUser'
import { useNavSections } from './useNavSections'

/**
 * Déplié au survol (après un court délai, pour ne pas s'ouvrir quand la souris ne fait que
 * passer), au clavier (focus visible) et tant que le menu du compte est ouvert (`data-state`).
 */
const RAIL_EXPANDED =
  'hover:w-64 hover:shadow-xl hover:delay-100 has-[:focus-visible]:w-64 has-[:focus-visible]:shadow-xl has-[[data-state=open]]:w-64 has-[[data-state=open]]:shadow-xl'

/** Libellés invisibles quand le rail est replié, en fondu quand il se déplie. */
const LABEL_CLASS =
  'min-w-0 truncate whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/rail:opacity-100 group-hover/rail:delay-100 group-has-[:focus-visible]/rail:opacity-100 group-has-[[data-state=open]]/rail:opacity-100'

/** Trait qui remplace le titre de section quand le rail est replié. */
const DIVIDER_CLASS =
  'absolute inset-x-3 top-1/2 border-t border-sidebar-border transition-opacity duration-150 group-hover/rail:opacity-0 group-has-[:focus-visible]/rail:opacity-0 group-has-[[data-state=open]]/rail:opacity-0'

type AppSideRailProps = {
  onShowChangelog: () => void
  onLogout: () => void
}

/**
 * Menu latéral des ordinateurs (à partir de `md`) : un rail d'icônes permanent qui se déplie au
 * survol **par-dessus** la page, sans la décaler (l'emplacement réservé garde la largeur du rail
 * replié). Logo, sections filtrées par rôle, compte en pied.
 */
export function AppSideRail({ onShowChangelog, onLogout }: AppSideRailProps) {
  const roleUuid = useAuthStore(selectRoleUuid)
  const { sections, isActive, badgeFor } = useNavSections()

  return (
    <div className="relative hidden w-14 shrink-0 md:block">
      <nav
        aria-label="Menu principal"
        className={cn(
          'group/rail fixed inset-y-0 left-0 z-40 flex w-14 flex-col overflow-hidden border-r bg-sidebar text-sidebar-foreground transition-[width,box-shadow] duration-200 ease-out',
          RAIL_EXPANDED,
        )}
      >
        <Link
          to={getDefaultRoute(roleUuid)}
          className="flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <img src={faviconUrl} alt="" className="size-8 shrink-0 rounded-lg" />
          <span className={cn(LABEL_CLASS, 'grid leading-tight')}>
            <span className="truncate font-bold tracking-wide">AVTRANS</span>
            <span className="truncate text-xs text-muted-foreground">Pointage & flotte</span>
          </span>
        </Link>

        {/* Défilement vertical sans barre visible (menu admin plus haut que l'écran) */}
        <div className="flex min-h-0 flex-1 [scrollbar-width:none] flex-col gap-1 overflow-x-hidden overflow-y-auto px-2 py-2 [&::-webkit-scrollbar]:hidden">
          {sections.map((section, index) => (
            <div key={section.title || section.links[0]?.to} className="flex flex-col gap-0.5">
              {section.title && (
                <div className="relative flex h-7 shrink-0 items-center px-2.5">
                  {/* Pas de trait sous le logo : la bordure de l'en-tête du rail suffit */}
                  {index > 0 && <span aria-hidden className={DIVIDER_CLASS} />}
                  <span className={cn(LABEL_CLASS, 'text-xs font-medium text-muted-foreground')}>
                    {section.title}
                  </span>
                </div>
              )}
              {section.links.map((link) => {
                const active = isActive(link.to)
                const badge = badgeFor(link.to)
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end
                    className={cn(
                      'flex h-9 shrink-0 items-center gap-3 rounded-md px-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors outline-none hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                      active && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
                    )}
                  >
                    <span className="relative flex shrink-0">
                      <link.lucideIcon className="size-5" />
                      {badge > 0 && (
                        <span
                          className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-bold text-destructive-foreground ring-2 ring-sidebar"
                          title="Comptes en attente d'activation"
                        >
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </span>
                    <span className={LABEL_CLASS}>{link.label}</span>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t border-sidebar-border p-2">
          <NavUser
            onShowChangelog={onShowChangelog}
            onLogout={onLogout}
            labelClassName={LABEL_CLASS}
          />
        </div>
      </nav>
    </div>
  )
}
