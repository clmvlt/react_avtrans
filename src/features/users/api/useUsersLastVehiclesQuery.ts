import { useQuery } from '@tanstack/react-query'
import type { UserLastVehicleDTO } from '@/models'
import { usersService } from '@/services'
import { usersKeys } from './queryKeys'

/** Tableau nu de GET /users/last-vehicles → Map uuid de l'utilisateur → dernier véhicule. */
function toLastVehiclesMap(data: UserLastVehicleDTO[]): Map<string, UserLastVehicleDTO> {
  const map = new Map<string, UserLastVehicleDTO>()
  if (Array.isArray(data)) {
    for (const item of data) map.set(item.userUuid, item)
  }
  return map
}

/**
 * Dernier véhicule utilisé par chaque utilisateur (colonne « Dernier véhicule » de la page
 * Utilisateurs). Échec silencieux, sans nouvelle tentative, comme le Vue (« l'endpoint peut ne
 * pas encore exister ») : la colonne affiche alors « — ».
 */
export function useUsersLastVehiclesQuery() {
  return useQuery({
    queryKey: usersKeys.lastVehicles(),
    queryFn: () => usersService.getUsersLastVehicles(),
    select: toLastVehiclesMap,
    retry: false,
  })
}
