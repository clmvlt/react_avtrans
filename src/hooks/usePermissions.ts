import { USER_ROLE_UUIDS, UserRole } from '@/enums'
import {
  selectCanToggleViewMode,
  selectIsAdmin,
  selectIsMechanic,
  selectIsUser,
  selectRoleUuid,
  useAuthStore,
} from '@/stores/auth-store'

const ROLE_UUID_BY_NAME: Record<UserRole, string> = {
  [UserRole.UTILISATEUR]: USER_ROLE_UUIDS.UTILISATEUR,
  [UserRole.ADMINISTRATEUR]: USER_ROLE_UUIDS.ADMINISTRATEUR,
  [UserRole.MECANICIEN]: USER_ROLE_UUIDS.MECANICIEN,
}

/**
 * Permissions basées sur les rôles (équivalent de usePermissions du Vue).
 * Les rôles sont comparés par UUID. En mode « vue utilisateur », un admin ou un mécanicien
 * est considéré comme UTILISATEUR pour l'affichage de la navigation.
 */
export function usePermissions() {
  const roleUuid = useAuthStore(selectRoleUuid)
  const isAdmin = useAuthStore(selectIsAdmin)
  const isMechanic = useAuthStore(selectIsMechanic)
  const isUser = useAuthStore(selectIsUser)
  const isViewingAsUser = useAuthStore((s) => s.viewAsUser)
  const canToggleViewMode = useAuthStore(selectCanToggleViewMode)
  const isCouchette = useAuthStore((s) => s.user?.isCouchette === true)
  const toggleViewMode = useAuthStore((s) => s.toggleViewMode)
  const setViewMode = useAuthStore((s) => s.setViewMode)

  const hasRole = (requiredRoles?: UserRole[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true
    if (!roleUuid) return false
    if (isViewingAsUser && (isAdmin || isMechanic)) {
      return requiredRoles.includes(UserRole.UTILISATEUR)
    }
    return requiredRoles.some((role) => ROLE_UUID_BY_NAME[role] === roleUuid)
  }

  const hasPermission = (permission: string) => permission === 'couchette' && isCouchette

  const canAccess = (requiredRoles?: UserRole[], requiredPermissions?: string[]) =>
    hasRole(requiredRoles) && (requiredPermissions ?? []).every(hasPermission)

  return {
    isAdmin,
    isMechanic,
    isUser,
    isViewingAsUser,
    canToggleViewMode,
    hasRole,
    hasPermission,
    canAccess,
    toggleViewMode,
    setViewMode,
  }
}
