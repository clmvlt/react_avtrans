import type { QueryClient } from '@tanstack/react-query'
import type { UserDTO } from '@/models'
import type { ApiResponse } from '@/types'
import { usersKeys } from './queryKeys'

/** Forme brute de GET /users en cache (le `select` de useUsersQuery la normalise). */
type UsersListCache = ApiResponse<UserDTO[]> | UserDTO[] | undefined

/**
 * Modifie la liste des comptes en cache (GET /users), quelle que soit la forme de la réponse.
 * Le Vue ne rechargeait jamais la liste après une action : il la corrigeait sur place. Même chose
 * ici, et le badge « en attente » de la navbar suit, puisqu'il lit le même cache.
 */
export function updateUsersListCache(
  queryClient: QueryClient,
  updater: (users: UserDTO[]) => UserDTO[],
) {
  queryClient.setQueryData<UsersListCache>(usersKeys.list(), (cache) => {
    if (!cache) return cache
    if (Array.isArray(cache)) return updater(cache)
    return { ...cache, data: updater(cache.data ?? []) }
  })
}

/**
 * Utilisateur contenu dans une réponse de l'API : PUT /users/{uuid} le renvoie sous `user`,
 * GET /users/{uuid} sous `data` ou nu (extractUser d'UserEditModal.vue).
 */
export function extractUser(response: unknown): UserDTO | undefined {
  const envelope = response as { user?: UserDTO; data?: UserDTO } | null | undefined
  const candidate = envelope?.user || envelope?.data || (response as UserDTO | null | undefined)
  if (candidate && (candidate.uuid || candidate.email)) return candidate
  return undefined
}
