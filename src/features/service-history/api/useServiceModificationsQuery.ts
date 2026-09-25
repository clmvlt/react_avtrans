import { useQuery } from '@tanstack/react-query'
import type { ServiceModificationDTO } from '@/models'
import { userServicesService } from '@/services'
import type { ApiResponse } from '@/types'
import { serviceHistoryKeys } from './queryKeys'

const LOAD_ERROR_MESSAGE = "Erreur lors du chargement de l'historique"

/** L'enveloppe renvoie la liste dans `data` ; toute autre forme donne une liste vide (comme le Vue). */
function toModifications(
  response: ApiResponse<ServiceModificationDTO[]>,
): ServiceModificationDTO[] {
  return Array.isArray(response?.data) ? response.data : []
}

type UseServiceModificationsQueryOptions = {
  enabled?: boolean
}

/**
 * Historique des actions admin sur un pointage, de la plus récente à la plus ancienne.
 * Le pointage a pu être supprimé : on ne le charge jamais, l'historique suffit.
 */
export function useServiceModificationsQuery(
  serviceUuid: string | null,
  { enabled = true }: UseServiceModificationsQueryOptions = {},
) {
  return useQuery({
    queryKey: serviceHistoryKeys.byService(serviceUuid ?? ''),
    queryFn: async () => {
      const response = await userServicesService.getServiceModifications(serviceUuid ?? '')
      if (response?.success === false) throw new Error(response.message || LOAD_ERROR_MESSAGE)
      return response
    },
    select: toModifications,
    enabled: enabled && !!serviceUuid,
  })
}
