import { useQuery } from '@tanstack/react-query'
import type { ServiceDTO } from '@/models'
import { userServicesService, type ServiceSearchParams } from '@/services'
import type { PagedResponse } from '@/types'
import { pointageKeys } from './queryKeys'

const toHistoryPage = (response: PagedResponse<ServiceDTO>) => ({
  content: response.content || [],
  totalPages: response.totalPages || 0,
  totalElements: response.totalElements || 0,
})

/**
 * Historique paginé des pointages de l'utilisateur connecté (POST /services/history).
 * Le service ajoute lui-même +1 jour à `endDate` (jour de fin inclus).
 */
export function useServiceHistoryQuery(params: ServiceSearchParams) {
  return useQuery({
    queryKey: pointageKeys.history(params),
    queryFn: () => userServicesService.getServiceHistory(params),
    select: toHistoryPage,
  })
}
