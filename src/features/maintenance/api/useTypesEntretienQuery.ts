import { useQuery } from '@tanstack/react-query'
import { typesEntretienService } from '@/services'
import type { TypeEntretienDTO } from '@/models'
import type { ApiResponse } from '@/types'
import { maintenanceKeys } from './queryKeys'

/** GET /types-entretien renvoie `typesEntretien` (ou `data` selon les versions de l'API). */
export const toTypesEntretien = (response: ApiResponse<TypeEntretienDTO[]>) =>
  response.typesEntretien ?? response.data ?? []

/** Types d'entretien (GET /types-entretien). Utilisé par les 3 pages du domaine. */
export function useTypesEntretienQuery() {
  return useQuery({
    queryKey: maintenanceKeys.types(),
    queryFn: () => typesEntretienService.getTypesEntretien(),
    select: toTypesEntretien,
  })
}
