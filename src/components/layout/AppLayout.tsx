import { Outlet } from 'react-router'
import { GlobalDialogs } from './GlobalDialogs'
import { Navbar } from './Navbar'

/**
 * Coquille des pages protégées : navbar, contenu, dialogs globaux.
 * Remplace la liste `pagesWithoutNavbar` du Vue (MIGRATION.md, Q-NAVBAR) : la navbar n'existe
 * que sur les routes placées sous ce layout.
 */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Outlet />
      <GlobalDialogs />
    </div>
  )
}
