import { MY_SPACE_SECTION_TITLE, navSections, type NavLinkConfig } from '@/config/navConfig'
import { usePermissions } from '@/hooks/usePermissions'
import { filterNavLinks } from '@/lib/filterNav'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Liens de la barre d'onglets mobile : les pages « Mon espace », pour un utilisateur (ou un admin
 * en vue utilisateur). Vide pour les autres rôles, qui passent par le menu latéral.
 */
export function useBottomNavLinks(): NavLinkConfig[] {
  const userEmail = useAuthStore((s) => s.user?.email)
  const { canAccess, isUser, isViewingAsUser } = usePermissions()
  if (!isUser && !isViewingAsUser) return []

  const mySpace = navSections.find((section) => section.title === MY_SPACE_SECTION_TITLE)
  return mySpace ? filterNavLinks(mySpace.links, canAccess, userEmail) : []
}
