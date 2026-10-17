import { useQuery } from '@tanstack/react-query'
import { liveQueryOptions, receive, type Received } from '@/lib/liveCounter'
import type { UserWithHoursDTO } from '@/models'
import { usersService } from '@/services'
import { hoursKeys } from './queryKeys'

const toUsersWithHours = ({ data, receivedAt }: Received<{ users?: UserWithHoursDTO[] }>) => ({
  users: data.users ?? [],
  receivedAt,
})

/**
 * Heures nettes de chaque employé (jour, semaine, mois, mois dernier, année ; chacune en
 * `HeuresPeriodeDTO`, D12) : GET /users/hours. Utilisateurs masqués non filtrés, comme le Vue.
 */
export function useUsersWithHoursQuery() {
  return useQuery({
    queryKey: hoursKeys.usersWithHours(),
    queryFn: () => receive(usersService.getUsersWithHours()),
    select: toUsersWithHours,
    ...liveQueryOptions,
  })
}
