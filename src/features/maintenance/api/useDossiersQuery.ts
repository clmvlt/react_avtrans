import { useQuery } from '@tanstack/react-query'
import { dossiersTypesEntretienService } from '@/services'
import type { DossiersTypeEntretienResponse } from '@/models'
import { maintenanceKeys } from './queryKeys'

export const toDossiers = (response: DossiersTypeEntretienResponse) => response.dossiers ?? []

/**
 * Dossiers de types d'entretien (GET /dossiers-types-entretien). Comme le Vue, une erreur n'est
 * pas affichée : les pages utilisent une liste vide (`data ?? []`).
 */
export function useDossiersQuery() {
  return useQuery({
    queryKey: maintenanceKeys.dossiers(),
    queryFn: () => dossiersTypesEntretienService.getDossiers(),
    select: toDossiers,
  })
}
