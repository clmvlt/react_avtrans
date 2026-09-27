import { Link, NavLink, useLocation } from 'react-router'
import faviconUrl from '@/assets/favicon.png'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { navSections } from '@/config/navConfig'
import { usePendingUsers } from '@/features/users/api/usePendingUsers'
import { usePermissions } from '@/hooks/usePermissions'
import { filterNavSections } from '@/lib/filterNav'
import { getDefaultRoute } from '@/lib/getDefaultRoute'
import { getRouteMeta } from '@/lib/routeMeta'
import { selectRoleUuid, useAuthStore } from '@/stores/auth-store'
import { NavUser } from './NavUser'

type AppSidebarProps = {
  onShowChangelog: () => void
  onLogout: () => void
}

/**
 * Barre latérale de l'application : logo, sections filtrées par rôle, compte en pied.
 * Repliable en icônes sur ordinateur, panneau coulissant sur téléphone (fermé à chaque lien).
 */
export function AppSidebar({ onShowChangelog, onLogout }: AppSidebarProps) {
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()
  const userEmail = useAuthStore((s) => s.user?.email)
  const roleUuid = useAuthStore(selectRoleUuid)
  const { canAccess } = usePermissions()
  const { pendingCount } = usePendingUsers()

  const sections = filterNavSections(navSections, canAccess, userEmail)
  // Une page de détail (fiche véhicule…) garde son entrée de menu active
  const parentPath = getRouteMeta(pathname)?.parent?.to
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="AVTRANS">
              <Link to={getDefaultRoute(roleUuid)} onClick={closeOnMobile}>
                <img src={faviconUrl} alt="" className="size-8 shrink-0 rounded-lg" />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-bold tracking-wide">AVTRANS</span>
                  <span className="truncate text-xs text-muted-foreground">Pointage & flotte</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.title || section.links[0]?.to}>
            {section.title && <SidebarGroupLabel>{section.title}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.links.map((link) => {
                  const badge = link.to === '/users' ? pendingCount : 0
                  return (
                    <SidebarMenuItem key={link.to}>
                      <SidebarMenuButton
                        asChild
                        tooltip={link.label}
                        isActive={pathname === link.to || parentPath === link.to}
                      >
                        <NavLink to={link.to} end onClick={closeOnMobile}>
                          <link.lucideIcon />
                          <span>{link.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                      {badge > 0 && (
                        <SidebarMenuBadge
                          className="bg-destructive text-destructive-foreground peer-hover/menu-button:text-destructive-foreground peer-data-[active=true]/menu-button:text-destructive-foreground"
                          title="Comptes en attente d'activation"
                        >
                          {badge > 99 ? '99+' : badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser onShowChangelog={onShowChangelog} onLogout={onLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
