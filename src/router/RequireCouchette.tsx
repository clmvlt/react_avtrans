import { Navigate, Outlet } from 'react-router'
import { selectHasCouchettePermission, useAuthStore } from '@/stores/auth-store'

/** Garde `requiresCouchette` du Vue (`user.isCouchette === true`), sinon → /unauthorized. */
export function RequireCouchette() {
  const hasCouchette = useAuthStore(selectHasCouchettePermission)
  if (!hasCouchette) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
