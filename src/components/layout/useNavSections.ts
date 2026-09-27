import { useLocation } from 'react-router'
import { navSections } from '@/config/navConfig'
import { usePendingUsers } from '@/features/users/api/usePendingUsers'
import { usePermissions } from '@/hooks/usePermissions'
import { filterNavSections } from '@/lib/filterNav'
import { getRouteMeta } from '@/lib/routeMeta'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Sections du menu visibles pour l'utilisateur (rôle, vue utilisateur, e-mail), état actif des
 * liens et pastilles : commun au rail d'icônes (ordinateur) et au panneau mobile.
 */
export function useNavSections() {
  const { pathname } = useLocation()
  const userEmail = useAuthStore((s) => s.user?.email)
  const { canAccess } = usePermissions()
  const { pendingCount } = usePendingUsers()

  // Une page de détail (fiche véhicule…) garde son entrée de menu active
  const parentPath = getRouteMeta(pathname)?.parent?.to

  return {
    sections: filterNavSections(navSections, canAccess, userEmail),
    isActive: (to: string) => pathname === to || parentPath === to,
    /** Comptes en attente d'activation sur « Utilisateurs » */
    badgeFor: (to: string) => (to === '/users' ? pendingCount : 0),
  }
}
