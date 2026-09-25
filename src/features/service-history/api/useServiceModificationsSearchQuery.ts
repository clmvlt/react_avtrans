import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { ServiceModificationSearchRequest } from '@/models'
import { userServicesService } from '@/services'
import { toJournalPage } from '../lib/journalFilters'
import { serviceHistoryKeys } from './queryKeys'

const LOAD_ERROR_MESSAGE = 'Erreur lors du chargement du journal'

/**
 * Clé d'une page du journal, sous `serviceHistoryKeys.all` : invalider `all` après une action
 * sur un pointage rafraîchit aussi le journal.
 */
export const serviceModificationsSearchKey = (request: ServiceModificationSearchRequest) =>
  [...serviceHistoryKeys.all, 'search', request] as const

/**
 * Journal paginé des actions admin sur les pointages (POST /services/admin/modifications),
 * de la plus récente à la plus ancienne. `success: false` est traité comme une erreur. La page
 * précédente reste affichée (estompée) pendant une recherche.
 */
export function useServiceModificationsSearchQuery(request: ServiceModificationSearchRequest) {
  const requestedPage = request.page ?? 0

  return useQuery({
    queryKey: serviceModificationsSearchKey(request),
    queryFn: async () => {
      const response = await userServicesService.searchServiceModifications(request)
      const envelope = response as unknown as { success?: boolean; message?: string }
      if (envelope?.success === false) throw new Error(envelope.message || LOAD_ERROR_MESSAGE)
      return response
    },
    select: (response) => toJournalPage(response, requestedPage),
    placeholderData: keepPreviousData,
  })
}
