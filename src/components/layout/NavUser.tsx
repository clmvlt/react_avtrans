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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { APP_VERSION } from '@/config/version'
import { useChangelog } from '@/features/changelog/hooks/useChangelog'
import { usePermissions } from '@/hooks/usePermissions'
import { useTheme } from '@/hooks/useTheme'
import { getDefaultRoute } from '@/lib/getDefaultRoute'
import { selectRoleUuid, useAuthStore } from '@/stores/auth-store'
import { getCurrentUserDisplay } from './currentUserDisplay'

type NavUserProps = {
  onShowChangelog: () => void
  onLogout: () => void
}

/**
 * Compte en pied de la barre latérale : profil, notifications, thème, vue admin / utilisateur,
 * nouveautés, installation de l'app, déconnexion.
 */
export function NavUser({ onShowChangelog, onLogout }: NavUserProps) {
  const navigate = useNavigate()
  const { isMobile, setOpenMobile } = useSidebar()
  const user = useAuthStore((s) => s.user)
  const roleUuid = useAuthStore(selectRoleUuid)
  const { name, email, initials, image } = getCurrentUserDisplay(user)
  const { isDark, toggleTheme } = useTheme()
  const { canToggleViewMode, isViewingAsUser, toggleViewMode } = usePermissions()
  const { hasUnseenChanges } = useChangelog()

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  // Changer de vue emmène sur l'accueil de la vue choisie : la page courante n'y a pas forcément sa place
  const handleToggleView = () => {
    const toUserView = !isViewingAsUser
    toggleViewMode()
    closeOnMobile()
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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              tooltip="Mon compte"
            >
              <span className="relative">
                {avatar}
                {hasUnseenChanges && (
                  <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-sidebar bg-primary" />
                )}
              </span>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg"
            side={isMobile ? 'top' : 'right'}
            align="end"
            sideOffset={4}
          >
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
                <Link to="/profile" onClick={closeOnMobile}>
                  <UserPen />
                  Mon profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/notifications" onClick={closeOnMobile}>
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
                  closeOnMobile()
                  onShowChangelog()
                }}
              >
                <Sparkles />
                Nouveautés
                {hasUnseenChanges && <span className="ml-auto size-2 rounded-full bg-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/add-to-homescreen" onClick={closeOnMobile}>
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
            <p className="px-2 pt-1 pb-1.5 text-[11px] text-muted-foreground">
              Version {APP_VERSION}
            </p>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
