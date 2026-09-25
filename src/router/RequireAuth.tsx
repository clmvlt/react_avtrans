import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router'
import {
  selectIsActive,
  selectIsAuthenticated,
  selectIsEmailVerified,
  useAuthStore,
} from '@/stores/auth-store'

/** E-mail non vérifié : le Vue déconnecte puis renvoie vers /login. */
function LogoutAndRedirect() {
  const logout = useAuthStore((s) => s.logout)
  useEffect(() => {
    logout()
  }, [logout])
  return <Navigate to="/login" replace />
}

/**
 * Garde `requiresAuth` du Vue, dans le même ordre : non connecté → /login ;
 * e-mail non vérifié → déconnexion puis /login ; compte inactif → /unauthorized.
 */
export function RequireAuth() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isEmailVerified = useAuthStore(selectIsEmailVerified)
  const isActive = useAuthStore(selectIsActive)

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isEmailVerified) return <LogoutAndRedirect />
  if (!isActive) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
