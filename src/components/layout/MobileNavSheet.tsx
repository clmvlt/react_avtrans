import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router'
import faviconUrl from '@/assets/favicon.png'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { getDefaultRoute } from '@/lib/getDefaultRoute'
import { cn } from '@/lib/utils'
import { selectRoleUuid, useAuthStore } from '@/stores/auth-store'
import { NavUser } from './NavUser'
import { useNavSections } from './useNavSections'

type MobileNavSheetProps = {
  onShowChangelog: () => void
  onLogout: () => void
}

/**
 * Menu des téléphones (sous `md`) : bouton « hamburger » de l'en-tête et panneau latéral gauche
 * avec les mêmes sections que le rail d'icônes, titres visibles, compte en pied. Se ferme au
 * changement de page.
 */
export function MobileNavSheet({ onShowChangelog, onLogout }: MobileNavSheetProps) {
  const { pathname } = useLocation()
  // Chemin sur lequel le panneau a été ouvert : il est fermé dès que la route change
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const close = () => setOpenedAt(null)
  const roleUuid = useAuthStore(selectRoleUuid)
  const { sections, isActive, badgeFor } = useNavSections()

  return (
    <Sheet
      open={openedAt === pathname}
      onOpenChange={(next) => setOpenedAt(next ? pathname : null)}
    >
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 md:hidden" aria-label="Menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-[85vw] max-w-72 flex-col gap-0 bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Navigation principale AVTRANS</SheetDescription>
        </SheetHeader>

        <Link
          to={getDefaultRoute(roleUuid)}
          onClick={close}
          className="flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border px-4"
        >
          <img src={faviconUrl} alt="" className="size-8 rounded-lg" />
          <span className="grid leading-tight">
            <span className="font-bold tracking-wide">AVTRANS</span>
            <span className="text-xs text-muted-foreground">Pointage & flotte</span>
          </span>
        </Link>

        <nav aria-label="Menu principal" className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
          {sections.map((section) => (
            <div key={section.title || section.links[0]?.to} className="flex flex-col gap-0.5">
              {section.title && (
                <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
                  {section.title}
                </p>
              )}
              {section.links.map((link) => {
                const badge = badgeFor(link.to)
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end
                    onClick={close}
                    className={cn(
                      'flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-sidebar-accent',
                      isActive(link.to) && 'bg-primary/10 text-primary hover:bg-primary/15',
                    )}
                  >
                    <link.lucideIcon className="size-5 shrink-0" />
                    <span className="truncate">{link.label}</span>
                    {badge > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-bold text-destructive-foreground">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-sidebar-border p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <NavUser
            onShowChangelog={onShowChangelog}
            onLogout={onLogout}
            onNavigate={close}
            side="top"
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
