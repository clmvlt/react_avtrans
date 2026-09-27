import {
  ArrowLeftRight,
  Bell,
  ChevronsUpDown,
  Download,
  LogOut,
  Moon,
  Smartphone,
  Sparkles,
  Sun,
  UserPen,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { APP_VERSION } from '@/config/version'
import { useChangelog } from '@/features/changelog/hooks/useChangelog'
import { usePermissions } from '@/hooks/usePermissions'
import { useTheme } from '@/hooks/useTheme'
import { getDefaultRoute } from '@/lib/getDefaultRoute'
import { cn } from '@/lib/utils'
import { selectRoleUuid, useAuthStore } from '@/stores/auth-store'
import { getCurrentUserDisplay } from './currentUserDisplay'

type NavUserProps = {
  onShowChangelog: () => void
  onLogout: () => void
  /** Appelé quand une entrée emmène ailleurs (le panneau mobile se ferme) */
  onNavigate?: () => void
  /** Côté d'ouverture du menu : à droite du rail, au-dessus dans le panneau mobile */
  side?: 'right' | 'top'
  /** Classes du nom et de l'e-mail (fondu du rail d'icônes) */
  labelClassName?: string
}

/**
 * Compte en pied du menu : profil, notifications, thème, vue admin / utilisateur, nouveautés,
 * installation de l'app, déconnexion. Le déclencheur porte `data-state="open"` pendant
 * l'ouverture : le rail d'icônes reste déplié tant que le menu est ouvert.
 */
export function NavUser({
  onShowChangelog,
  onLogout,
  onNavigate,
  side = 'right',
  labelClassName,
}: NavUserProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const roleUuid = useAuthStore(selectRoleUuid)
  const { name, email, initials, image } = getCurrentUserDisplay(user)
  const { isDark, toggleTheme } = useTheme()
  const { canToggleViewMode, isViewingAsUser, toggleViewMode } = usePermissions()
  const { hasUnseenChanges } = useChangelog()

  // Changer de vue emmène sur l'accueil de la vue choisie : la page courante n'y a pas forcément sa place
  const handleToggleView = () => {
    const toUserView = !isViewingAsUser
    toggleViewMode()
    onNavigate?.()
    void navigate(toUserView ? '/pointage' : getDefaultRoute(roleUuid))
  }

  const avatar = (
    <Avatar className="size-8 rounded-lg">
      {image && <AvatarImage src={image} alt={name} className="object-cover" />}
      <AvatarFallback className="rounded-lg bg-primary text-xs font-bold text-primary-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Mon compte"
          className="flex h-12 w-full items-center gap-3 rounded-md px-1 text-left transition-colors outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-sidebar-accent"
        >
          <span className="relative shrink-0">
            {avatar}
            {hasUnseenChanges && (
              <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-sidebar bg-primary" />
            )}
          </span>
          <span className={cn('grid min-w-0 flex-1 text-sm leading-tight', labelClassName)}>
            <span className="truncate font-medium text-foreground">{name}</span>
            <span className="truncate text-xs text-muted-foreground">{email}</span>
          </span>
          <ChevronsUpDown
            className={cn('ml-auto size-4 shrink-0 text-muted-foreground', labelClassName)}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 rounded-lg" side={side} align="end" sideOffset={8}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            {avatar}
            <div className="grid flex-1 leading-tight">
              <span className="truncate font-medium">{name}</span>
              <span className="truncate text-xs text-muted-foreground">{email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/profile" onClick={onNavigate}>
              <UserPen />
              Mon profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/notifications" onClick={onNavigate}>
              <Bell />
              Notifications
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={toggleTheme}>
            {isDark ? <Sun /> : <Moon />}
            {isDark ? 'Mode clair' : 'Mode sombre'}
          </DropdownMenuItem>
          {canToggleViewMode && (
            <DropdownMenuItem onSelect={handleToggleView}>
              <ArrowLeftRight />
              {isViewingAsUser ? 'Revenir à la vue admin' : 'Passer en vue utilisateur'}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => {
              onNavigate?.()
              onShowChangelog()
            }}
          >
            <Sparkles />
            Nouveautés
            {hasUnseenChanges && <span className="ml-auto size-2 rounded-full bg-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/add-to-homescreen" onClick={onNavigate}>
              <Smartphone />
              Installer sur l'écran d'accueil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/download">
              <Download />
              Télécharger l'app Android
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onLogout}>
          <LogOut />
          Déconnexion
        </DropdownMenuItem>
        <p className="px-2 pt-1 pb-1.5 text-[11px] text-muted-foreground">Version {APP_VERSION}</p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
