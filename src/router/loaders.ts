import { useAuthStore } from '@/stores/auth-store'

/**
 * Entrée dans une page admin : le Vue quitte alors la « vue utilisateur » (setViewMode(false)).
 * Loader de la route layout admin, rejoué à chaque navigation (shouldRevalidate: () => true).
 */
export function leaveUserViewLoader() {
  useAuthStore.getState().setViewMode(false)
  return null
}
