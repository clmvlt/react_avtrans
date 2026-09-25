import { useQuery } from '@tanstack/react-query'
import type { UserWithHoursDTO } from '@/models'
import { usersService } from '@/services'
import { hoursKeys } from './queryKeys'

const toUsersWithHours = (response: { users?: UserWithHoursDTO[] }) => response.users ?? []

/**
 * Heures de chaque employé (jour, semaine, mois, mois dernier, année) : GET /users/hours.
 * Utilisateurs masqués non filtrés, comme le Vue.
 */
export function useUsersWithHoursQuery() {
  return useQuery({
    queryKey: hoursKeys.usersWithHours(),
    queryFn: () => usersService.getUsersWithHours(),
    select: toUsersWithHours,
  })
}
