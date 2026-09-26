import { useQuery } from '@tanstack/react-query'
import type { UserDTO } from '@/models'
import { usersService } from '@/services'
import type { ApiResponse } from '@/types'
import { usersKeys } from './queryKeys'

/** GET /users/{uuid} renvoie `{ data }` ou le DTO nu ; `null` si aucun utilisateur exploitable. */
function toUser(response: ApiResponse<UserDTO> | UserDTO): UserDTO | null {
  const candidate = ((response as ApiResponse<UserDTO>)?.data || response) as UserDTO | undefined
  return candidate && (candidate.uuid || candidate.email) ? candidate : null
}

/** Un compte (GET /users/{uuid}) : en-tête des pointages d'un employé. */
export function useUserQuery(uuid: string) {
  return useQuery({
    queryKey: usersKeys.detail(uuid),
    queryFn: () => usersService.getUserById(uuid),
    select: toUser,
    enabled: !!uuid,
  })
}
