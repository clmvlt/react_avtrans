import { Navigate, Outlet } from 'react-router'
import { getDefaultRoute } from '@/lib/getDefaultRoute'
import { selectIsAuthenticated, selectRoleUuid, useAuthStore } from '@/stores/auth-store'

/** /login et /register : un utilisateur déjà connecté va sur sa route par défaut (comme le Vue). */
export function RedirectIfAuthenticated() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const roleUuid = useAuthStore(selectRoleUuid)

  if (isAuthenticated) return <Navigate to={getDefaultRoute(roleUuid)} replace />
  return <Outlet />
}
