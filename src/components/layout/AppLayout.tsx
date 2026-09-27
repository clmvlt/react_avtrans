import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { PageMeta } from '@/components/shared/PageMeta'
import { DEFAULT_TITLE } from '@/config/seo'
import { useChangelog } from '@/features/changelog/hooks/useChangelog'
import { useNotificationSideEffects } from '@/features/notifications/hooks/useNotificationSideEffects'
import { ServiceHistoryProvider } from '@/features/service-history/components/ServiceHistoryProvider'
import { getRouteMeta } from '@/lib/routeMeta'
import { useAuthStore } from '@/stores/auth-store'
import { AppHeader } from './AppHeader'
import { AppSideRail } from './AppSideRail'
import { GlobalDialogs } from './GlobalDialogs'
import { MobileBottomNav } from './MobileBottomNav'
import { useBottomNavLinks } from './useBottomNavLinks'

/**
 * Coquille des pages protégées : rail d'icônes à gauche (ordinateur, déplié au survol par-dessus
 * la page), en-tête avec fil d'Ariane ou menu « hamburger » (téléphone), contenu, barre d'onglets
 * mobile des utilisateurs et dialogs globaux.
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
      {/* `data-bottom-nav` : hauteur réservée à la barre d'onglets (--bottom-nav-h, index.css) */}
      <div
        data-bottom-nav={hasBottomNav}
        className="group/app flex min-h-svh w-full pb-(--bottom-nav-h)"
      >
        <AppSideRail onShowChangelog={() => setChangelogOpen(true)} onLogout={handleLogout} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader onShowChangelog={() => setChangelogOpen(true)} onLogout={handleLogout} />
          <main className="flex flex-1 flex-col">
            <Outlet />
          </main>
        </div>
        {hasBottomNav && <MobileBottomNav links={bottomNavLinks} />}
      </div>
      <GlobalDialogs changelogOpen={changelogOpen} onChangelogOpenChange={setChangelogOpen} />
    </ServiceHistoryProvider>
  )
}
