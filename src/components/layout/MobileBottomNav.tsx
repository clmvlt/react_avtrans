import { NavLink } from 'react-router'
import type { NavLinkConfig } from '@/config/navConfig'
import { cn } from '@/lib/utils'

type MobileBottomNavProps = {
  links: NavLinkConfig[]
}

/**
 * Barre d'onglets fixe en bas de l'écran, sous `md` : accès direct aux pages personnelles (zone
 * du pouce). Sa hauteur est réservée par `--bottom-nav-h` (index.css, AppLayout).
 */
export function MobileBottomNav({ links }: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden"
    >
      <div
        className="mx-auto grid h-16 max-w-md"
        style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              cn(
                'group flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors',
                isActive && 'text-primary',
              )
            }
          >
            <span className="flex h-7 w-14 items-center justify-center rounded-full transition-colors group-aria-[current=page]:bg-primary/10">
              <link.lucideIcon className="size-5" />
            </span>
            <span className="max-w-full truncate px-1">{link.shortLabel ?? link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
