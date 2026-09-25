import { redirect } from 'react-router'
import { getDefaultRoute } from '@/lib/getDefaultRoute'
import { selectIsAuthenticated, selectRoleUuid, useAuthStore } from '@/stores/auth-store'

/**
 * Entrée dans une page admin : le Vue quitte alors la « vue utilisateur » (setViewMode(false)).
 * Loader de la route layout admin, rejoué à chaque navigation (shouldRevalidate: () => true).
 */
export function leaveUserViewLoader() {
  useAuthStore.getState().setViewMode(false)
  return null
}

/**
 * /login et /register : un utilisateur déjà connecté va sur sa route par défaut.
 * Vérifié à la navigation seulement, comme le `beforeEach` du Vue (et non à chaque changement
 * du store) : après une connexion réussie, la page de connexion reste montée le temps d'afficher
 * le prompt « ajouter à l'écran d'accueil » sur mobile.
 */
export function redirectIfAuthenticatedLoader() {
  const state = useAuthStore.getState()
  return selectIsAuthenticated(state) ? redirect(getDefaultRoute(selectRoleUuid(state))) : null
}
