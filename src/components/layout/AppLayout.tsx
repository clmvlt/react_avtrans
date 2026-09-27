import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { PageMeta } from '@/components/shared/PageMeta'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { DEFAULT_TITLE } from '@/config/seo'
import { useChangelog } from '@/features/changelog/hooks/useChangelog'
import { useNotificationSideEffects } from '@/features/notifications/hooks/useNotificationSideEffects'
import { ServiceHistoryProvider } from '@/features/service-history/components/ServiceHistoryProvider'
import { getRouteMeta } from '@/lib/routeMeta'
import { useAuthStore } from '@/stores/auth-store'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { GlobalDialogs } from './GlobalDialogs'
import { MobileBottomNav } from './MobileBottomNav'
import { useBottomNavLinks } from './useBottomNavLinks'

/** Barre latérale ouverte ou repliée : cookie posé par le SidebarProvider de shadcn */
function readSidebarOpen(): boolean {
  const match = document.cookie.match(/(?:^|;\s*)sidebar_state=(true|false)/)
  return match ? match[1] === 'true' : true
}

/**
 * Coquille des pages protégées : barre latérale (panneau coulissant sur téléphone), en-tête avec
 * fil d'Ariane, contenu, barre d'onglets mobile des utilisateurs et dialogs globaux.
 */
export function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  // Polling, son et favicon des notifications : une seule instance pour toute l'app
  const unreadCount = useNotificationSideEffects()
  const { hasUnseenChanges } = useChangelog()
  // Nouveautés ouvertes d'office à l'arrivée dans l'app authentifiée (y compris après connexion)
  const [changelogOpen, setChangelogOpen] = useState(hasUnseenChanges)
  const [sidebarDefaultOpen] = useState(readSidebarOpen)
  const bottomNavLinks = useBottomNavLinks()
  const hasBottomNav = bottomNavLinks.length > 1

  const pageTitle = getRouteMeta(pathname)?.title
  const title = pageTitle ? `${pageTitle} · AVTRANS` : DEFAULT_TITLE

  const handleLogout = () => {
    logout()
    void navigate('/login')
  }

  return (
    <ServiceHistoryProvider>
      {/* Titre de l'onglet préfixé du nombre de non-lues : « (3) Pointage · AVTRANS » */}
      <PageMeta title={unreadCount > 0 ? `(${unreadCount}) ${title}` : title} />
      <SidebarProvider
        defaultOpen={sidebarDefaultOpen}
        data-bottom-nav={hasBottomNav}
        className="pb-(--bottom-nav-h)"
      >
        <AppSidebar onShowChangelog={() => setChangelogOpen(true)} onLogout={handleLogout} />
        <SidebarInset className="min-w-0">
          <AppHeader />
          <div className="flex flex-1 flex-col">
            <Outlet />
          </div>
        </SidebarInset>
        {hasBottomNav && <MobileBottomNav links={bottomNavLinks} />}
      </SidebarProvider>
      <GlobalDialogs changelogOpen={changelogOpen} onChangelogOpenChange={setChangelogOpen} />
    </ServiceHistoryProvider>
  )
}
