import { useState } from 'react'
import { Outlet } from 'react-router'
import { PageMeta } from '@/components/shared/PageMeta'
import { DEFAULT_TITLE } from '@/config/seo'
import { useChangelog } from '@/features/changelog/hooks/useChangelog'
import { useNotificationSideEffects } from '@/features/notifications/hooks/useNotificationSideEffects'
import { ServiceHistoryProvider } from '@/features/service-history/components/ServiceHistoryProvider'
import { GlobalDialogs } from './GlobalDialogs'
import { Navbar } from './Navbar'

/**
 * Coquille des pages protégées : navbar, contenu, dialogs globaux.
 * Remplace la liste `pagesWithoutNavbar` du Vue (MIGRATION.md, Q-NAVBAR) : la navbar n'existe
 * que sur les routes placées sous ce layout.
 */
export function AppLayout() {
  // Polling, son et favicon des notifications : une seule instance pour toute l'app
  const unreadCount = useNotificationSideEffects()
  const { hasUnseenChanges } = useChangelog()
  // Nouveautés ouvertes d'office à l'arrivée dans l'app authentifiée (y compris après connexion)
  const [changelogOpen, setChangelogOpen] = useState(hasUnseenChanges)

  return (
    <ServiceHistoryProvider>
      {/* Titre de l'onglet préfixé du nombre de non-lues, comme le Vue : « (3) … » */}
      <PageMeta title={unreadCount > 0 ? `(${unreadCount}) ${DEFAULT_TITLE}` : DEFAULT_TITLE} />
      <div className="min-h-screen bg-background">
        <Navbar onShowChangelog={() => setChangelogOpen(true)} />
        <Outlet />
        <GlobalDialogs changelogOpen={changelogOpen} onChangelogOpenChange={setChangelogOpen} />
      </div>
    </ServiceHistoryProvider>
  )
}
