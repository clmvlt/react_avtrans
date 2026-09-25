import { selectIsAdmin, useAuthStore } from '@/stores/auth-store'
import { isPendingActivation } from '../lib/pendingActivation'
import { useUsersQuery } from './useUsersQuery'

/**
 * Comptes récemment créés et non activés (badge du lien « Utilisateurs » de la navbar).
 * Même requête et même cache que la page Utilisateurs (GET /users), chargée seulement pour un
 * administrateur. Échoue en silence comme le Vue : un badge ne bloque jamais l'application.
 * Pas de filtrage `selectableUsers()` : c'est de l'administration des comptes.
 */
export function usePendingUsers() {
  const isAdmin = useAuthStore(selectIsAdmin)
  const { data } = useUsersQuery({ enabled: isAdmin })
  const pendingUsers = isAdmin && data ? data.filter((user) => isPendingActivation(user)) : []

  return { pendingUsers, pendingCount: pendingUsers.length }
}
