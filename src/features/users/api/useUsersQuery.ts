import { useQuery } from '@tanstack/react-query'
import type { UserDTO } from '@/models'
import { usersService } from '@/services'
import type { ApiResponse } from '@/types'
import { usersKeys } from './queryKeys'

/** GET /users renvoie `{ data }` ; le Vue tolérait aussi un tableau nu. */
function toUsers(response: ApiResponse<UserDTO[]> | UserDTO[]): UserDTO[] {
  if (Array.isArray(response)) return response
  return response.data ?? []
}

type UseUsersQueryOptions = {
  enabled?: boolean
}

/**
 * Liste complète des comptes (GET /users), **utilisateurs masqués compris**.
 * Dans un sélecteur d'employé, filtrer avec `selectableUsers()` (utils/userVisibility) ;
 * jamais dans l'administration des comptes.
 */
export function useUsersQuery({ enabled = true }: UseUsersQueryOptions = {}) {
  return useQuery({
    queryKey: usersKeys.list(),
    queryFn: () => usersService.getUsers(),
    select: toUsers,
    enabled,
  })
}
