import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { entretiensService } from '@/services'
import type { EntretienDTO } from '@/models'
import type { PagedResponse } from '@/types'
import type { EntretienRow } from '../lib/entretienRow'
import { maintenanceKeys, type EntretienHistoryParams } from './queryKeys'

/** L'API renvoie aussi `files[]` dans chaque entretien, absent du modèle (lu en `as any` dans le Vue). */
const toRows = (response: PagedResponse<EntretienDTO>): PagedResponse<EntretienRow> => ({
  ...response,
  content: response.content ?? [],
})

/**
 * Historique paginé des entretiens (POST /entretiens/history). La page précédente reste affichée
 * pendant le chargement de la suivante (`keepPreviousData`, `isPlaceholderData`).
 */
export function useEntretiensHistoryQuery(params: EntretienHistoryParams) {
  return useQuery({
    queryKey: maintenanceKeys.history(params),
    queryFn: () => entretiensService.searchHistory(params),
    select: toRows,
    placeholderData: keepPreviousData,
  })
}
