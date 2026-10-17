import { useQuery } from '@tanstack/react-query'
import { usersKeys } from '@/features/users/api/queryKeys'
import { receive, type Received } from '@/lib/liveCounter'
import type { UserWithStatusDTO } from '@/models'
import { usersService } from '@/services'

const toUsers = ({ data, receivedAt }: Received<UserWithStatusDTO[]>) => ({
  users: Array.isArray(data) ? data : [],
  receivedAt,
})

/** Rafraîchissement du suivi des présences (setInterval de 10 s du Vue). */
const REFRESH_INTERVAL_MS = 10_000

/**
 * Employés avec leur présence (GET /users/status, tableau nu, masqués déjà exclus par l'API :
 * pas de `selectableUsers()`). Rafraîchi toutes les 10 s, en pause quand l'onglet est masqué
 * (défaut de TanStack Query), et au retour sur l'onglet ; entre deux réponses, `hoursToday` et la
 * durée du service en cours avancent en direct (D12). Un rafraîchissement en échec garde les
 * données affichées.
 */
export function useUsersWithStatusQuery() {
  return useQuery({
    queryKey: usersKeys.status(),
    queryFn: () => receive(usersService.getUsersWithStatus()),
    select: toUsers,
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  })
}
