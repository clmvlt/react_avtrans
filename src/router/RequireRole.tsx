import { Navigate, Outlet } from 'react-router'
import { selectIsAdmin, selectIsMechanic, useAuthStore } from '@/stores/auth-store'

type RequireRoleProps = {
  /** `admin` = administrateur ; `mechanic` = administrateur OU mécanicien (comme le Vue) */
  role: 'admin' | 'mechanic'
}

/** Gardes `requiresAdmin` / `requiresMechanic` du Vue : sinon → /unauthorized. */
export function RequireRole({ role }: RequireRoleProps) {
  const isAdmin = useAuthStore(selectIsAdmin)
  const isMechanic = useAuthStore(selectIsMechanic)
  const allowed = role === 'admin' ? isAdmin : isAdmin || isMechanic

  if (!allowed) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
