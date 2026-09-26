import type { QueryClient } from '@tanstack/react-query'
import type {
  DossiersTypeEntretienResponse,
  DossierTypeEntretienDTO,
  TypeEntretienDTO,
} from '@/models'
import type { ApiResponse } from '@/types'
import { maintenanceKeys } from './queryKeys'
import { toDossiers } from './useDossiersQuery'
import { toTypesEntretien } from './useTypesEntretienQuery'

/**
 * Mise à jour locale des listes de TypesEntretien, sans rechargement : le Vue modifie son state
 * après chaque mutation et ne recharge jamais. C'est ce qui fait qu'un type déposé sur
 * « Non classés » y reste affiché alors que l'API l'a ignoré (MIGRATION.md 8.3).
 * Le cache contient la réponse brute du service ; seule la liste est remplacée.
 */
export function updateTypesCache(
  queryClient: QueryClient,
  updater: (types: TypeEntretienDTO[]) => TypeEntretienDTO[],
) {
  queryClient.setQueryData<ApiResponse<TypeEntretienDTO[]>>(maintenanceKeys.types(), (old) =>
    old ? { ...old, typesEntretien: updater(toTypesEntretien(old)) } : old,
  )
}

export function updateDossiersCache(
  queryClient: QueryClient,
  updater: (dossiers: DossierTypeEntretienDTO[]) => DossierTypeEntretienDTO[],
) {
  queryClient.setQueryData<DossiersTypeEntretienResponse>(maintenanceKeys.dossiers(), (old) =>
    old ? { ...old, dossiers: updater(toDossiers(old)) } : old,
  )
}
