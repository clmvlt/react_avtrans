import { ArrowLeftRight, LogOut, Moon, Smartphone, Sparkles, Sun, UserPen } from 'lucide-react'
import { Link } from 'react-router'
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
import { useAuthStore } from '@/stores/auth-store'
import { getCurrentUserDisplay } from './currentUserDisplay'

type UserMenuProps = {
  onShowChangelog: () => void
  onLogout: () => void
}

/** Menu de l'avatar : profil, thème, vue admin / utilisateur, nouveautés, installation, déconnexion. */
export function UserMenu({ onShowChangelog, onLogout }: UserMenuProps) {
  const user = useAuthStore((s) => s.user)
  const { name, email, initials, image } = getCurrentUserDisplay(user)
  const { isDark, toggleTheme } = useTheme()
  const { canToggleViewMode, isViewingAsUser, toggleViewMode } = usePermissions()
  const { hasUnseenChanges } = useChangelog()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex size-9 cursor-pointer items-center justify-center rounded-full ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          title="Mon compte"
        >
          <Avatar className="size-8">
            {image && <AvatarImage src={image} alt={name} className="object-cover" />}
            <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm leading-none font-medium">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
            <p className="text-[11px] leading-none text-muted-foreground/70">
              Version {APP_VERSION}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* Classes sur l'item (fusionnées par cn) plutôt que sur le lien : le Slot de Radix les
              concatènerait sans résoudre cursor-default / cursor-pointer */}
          <DropdownMenuItem asChild className="flex w-full cursor-pointer items-center gap-2">
            <Link to="/profile">
              <UserPen className="size-4" />
              Mon profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={toggleTheme} className="cursor-pointer gap-2">
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {isDark ? 'Mode clair' : 'Mode sombre'}
          </DropdownMenuItem>
          {canToggleViewMode && (
            <DropdownMenuItem onSelect={toggleViewMode} className="cursor-pointer gap-2">
              <ArrowLeftRight className="size-4" />
              {isViewingAsUser ? 'Vue Admin' : 'Vue Utilisateur'}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={onShowChangelog} className="relative cursor-pointer gap-2">
            <Sparkles className="size-4" />
            Nouveautés
            {hasUnseenChanges && <span className="ml-auto size-2 rounded-full bg-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="flex w-full cursor-pointer items-center gap-2">
            <Link to="/add-to-homescreen">
              <Smartphone className="size-4" />
              Installer l'app
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onLogout}
          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
