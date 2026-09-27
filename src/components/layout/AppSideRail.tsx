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

/**
 * Liste qui défile : barre masquée quand le rail est replié, fine mais bien contrastée quand il
 * est déplié (propriétés standard pour Chrome, Edge et Firefox ; pseudo-éléments pour Safari).
 * `overscroll-contain` : arrivé en bout de liste, la page ne prend pas le relais.
 */
const SCROLL_CLASS = [
  'overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/60 [&::-webkit-scrollbar-track]:bg-transparent',
  'group-hover/rail:[scrollbar-width:thin] group-hover/rail:[scrollbar-color:var(--muted-foreground)_transparent] group-hover/rail:[&::-webkit-scrollbar]:block',
  'group-has-[:focus-visible]/rail:[scrollbar-width:thin] group-has-[:focus-visible]/rail:[scrollbar-color:var(--muted-foreground)_transparent] group-has-[:focus-visible]/rail:[&::-webkit-scrollbar]:block',
  'group-has-[[data-state=open]]/rail:[scrollbar-width:thin] group-has-[[data-state=open]]/rail:[scrollbar-color:var(--muted-foreground)_transparent] group-has-[[data-state=open]]/rail:[&::-webkit-scrollbar]:block',
].join(' ')

/**
 * La molette au-dessus du rail ne fait jamais défiler la page. Sur la liste, quand elle déborde,
 * défilement natif (voir `overscroll-contain`) ; ailleurs (logo, compte) ou quand la liste tient
 * dans l'écran, l'événement est bloqué et reporté sur la liste. Ctrl + molette (zoom) passe.
 * Écouteur natif non passif : celui de React ne peut pas appeler `preventDefault`.
 */
function containWheel(nav: HTMLElement | null) {
  if (!nav) return
  const onWheel = (event: WheelEvent) => {
    if (event.ctrlKey) return
    const list = nav.querySelector<HTMLElement>('[data-rail-scroll]')
    if (!list) return
    const canScroll = list.scrollHeight > list.clientHeight
    if (canScroll && list.contains(event.target as Node)) return
    event.preventDefault()
    // deltaMode 1 : molette réglée en lignes (Firefox) ; environ 16 px par ligne
    if (canScroll) list.scrollTop += event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY
  }
  nav.addEventListener('wheel', onWheel, { passive: false })
  return () => nav.removeEventListener('wheel', onWheel)
}

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
        ref={containWheel}
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

        {/* Liste qui défile (menu admin plus haut que l'écran) */}
        <div
          data-rail-scroll
          className={cn(
            'flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-2 py-2',
            SCROLL_CLASS,
          )}
        >
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
