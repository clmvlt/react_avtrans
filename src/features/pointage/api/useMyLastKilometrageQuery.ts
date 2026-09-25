import { useQuery } from '@tanstack/react-query'
import { usersService } from '@/services'
import { pointageKeys } from './queryKeys'

type UseMyLastKilometrageQueryOptions = {
  enabled?: boolean
}

/** Dernier relevé de l'utilisateur connecté et saisie du jour (GET /users/me/kilometrage, DTO nu). */
export function useMyLastKilometrageQuery({
  enabled = true,
}: UseMyLastKilometrageQueryOptions = {}) {
  return useQuery({
    queryKey: pointageKeys.lastKilometrage(),
    queryFn: () => usersService.getMyLastKilometrage(),
    enabled,
  })
}
