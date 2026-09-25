import {
  ArrowLeftRight,
  LogOut,
  Menu,
  Moon,
  Smartphone,
  Sparkles,
  Sun,
  UserPen,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { fullNavSections } from '@/config/navConfig'
import { useChangelog } from '@/features/changelog/hooks/useChangelog'
import { NotificationsPopover } from '@/features/notifications/components/NotificationsPopover'
import { usePendingUsers } from '@/features/users/api/usePendingUsers'
import { usePermissions } from '@/hooks/usePermissions'
import { useTheme } from '@/hooks/useTheme'
import { filterNavSections } from '@/lib/filterNav'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { getCurrentUserDisplay } from './currentUserDisplay'

type MobileNavSheetProps = {
  onShowChangelog: () => void
  onLogout: () => void
}

/**
 * Bouton « Menu » et panneau latéral droit (à toutes les tailles) : en-tête utilisateur,
 * notifications (mobile), sections de navigation filtrées par rôle, pied compact.
 * Se ferme au changement de route et quand une notification ouvre l'historique d'un pointage.
 */
export function MobileNavSheet({ onShowChangelog, onLogout }: MobileNavSheetProps) {
  const { pathname } = useLocation()
  // Chemin sur lequel le panneau a été ouvert : il est fermé dès que la route change
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const open = openedAt === pathname
  const close = () => setOpenedAt(null)

  const user = useAuthStore((s) => s.user)
  const { name, email, initials, image } = getCurrentUserDisplay(user)
  const { canAccess, canToggleViewMode, isViewingAsUser, toggleViewMode } = usePermissions()
  const { isDark, toggleTheme } = useTheme()
  const { hasUnseenChanges } = useChangelog()
  // Appelé ici (toujours monté) et non dans le panneau : pas de rechargement à chaque ouverture
  const { pendingCount } = usePendingUsers()

  const sections = filterNavSections(fullNavSections, canAccess, user?.email)
  const linkBadge = (to: string) => (to === '/users' ? pendingCount : 0)

  return (
    <Sheet open={open} onOpenChange={(next) => setOpenedAt(next ? pathname : null)}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 shrink-0" title="Menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      {/* gap-0 : le SheetContent du Vue n'avait pas l'espacement de celui de shadcn React */}
      <SheetContent side="right" className="flex w-[85vw] max-w-[448px] flex-col gap-0 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu de navigation</SheetTitle>
          <SheetDescription>Navigation principale AVTRANS</SheetDescription>
        </SheetHeader>

        {/* En-tête utilisateur */}
        <div className="border-b p-6">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              {image && <AvatarImage src={image} alt={name} className="object-cover" />}
              <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm leading-tight font-semibold">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        </div>

        {/* Contenu défilant */}
        <div className="flex-1 overflow-y-auto">
          {/* Notifications (mobile uniquement ; dans la navbar à partir de sm) */}
          <div className="border-b p-4 sm:hidden">
            <NotificationsPopover modal onNavigate={close} />
          </div>

          {sections.map((section) => (
            <div key={section.title || section.links[0]?.to} className="border-b px-4 py-3">
              {section.title && (
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <section.lucideIcon className="size-3.5" />
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.links.map((link) => {
                  const badge = linkBadge(link.to)
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={close}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent',
                          isActive && 'bg-accent font-semibold text-primary',
                        )
                      }
                    >
                      {link.lucideIcon && (
                        <link.lucideIcon className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span>{link.label}</span>
                      {badge > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-bold text-destructive-foreground">
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Pied compact */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-9" title="Mon profil" asChild>
              <Link to="/profile" onClick={close}>
                <UserPen className="size-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              title={isDark ? 'Mode clair' : 'Mode sombre'}
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            {canToggleViewMode && (
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                title={isViewingAsUser ? 'Vue Admin' : 'Vue Utilisateur'}
                onClick={toggleViewMode}
              >
                <ArrowLeftRight className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="relative size-9"
              title="Nouveautés"
              onClick={() => {
                close()
                onShowChangelog()
              }}
            >
              <Sparkles className="size-4" />
              {hasUnseenChanges && (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              title="Ajouter à l'écran d'accueil"
              asChild
            >
              <Link to="/add-to-homescreen" onClick={close}>
                <Smartphone className="size-4" />
              </Link>
            </Button>
          </div>

          <Button variant="destructive" size="sm" onClick={onLogout}>
            <LogOut className="size-4" />
            Déconnexion
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
