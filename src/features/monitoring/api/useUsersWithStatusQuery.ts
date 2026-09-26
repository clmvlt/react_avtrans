import { useQuery } from '@tanstack/react-query'
import { usersKeys } from '@/features/users/api/queryKeys'
import type { UserWithStatusDTO } from '@/models'
import { usersService } from '@/services'

const toUsers = (data: UserWithStatusDTO[]) => (Array.isArray(data) ? data : [])

/** Rafraîchissement du suivi des présences (setInterval de 10 s du Vue). */
const REFRESH_INTERVAL_MS = 10_000

/**
 * Employés avec leur présence (GET /users/status, tableau nu, masqués déjà exclus par l'API :
 * pas de `selectableUsers()`). Rafraîchi toutes les 10 s, en pause quand l'onglet est masqué
 * (défaut de TanStack Query). Un rafraîchissement en échec garde les données affichées.
 */
export function useUsersWithStatusQuery() {
  return useQuery({
    queryKey: usersKeys.status(),
    queryFn: () => usersService.getUsersWithStatus(),
    select: toUsers,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}
