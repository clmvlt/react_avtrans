import { useQuery } from '@tanstack/react-query'
import { receive, type Received } from '@/lib/liveCounter'
import type { ServiceDTO } from '@/models'
import { userServicesService, type ServiceSearchParams } from '@/services'
import type { PagedResponse } from '@/types'
import { pointageKeys } from './queryKeys'

const toHistoryPage = ({ data, receivedAt }: Received<PagedResponse<ServiceDTO>>) => ({
  content: data.content || [],
  totalPages: data.totalPages || 0,
  totalElements: data.totalElements || 0,
  receivedAt,
})

/**
 * Historique paginé des pointages de l'utilisateur connecté (POST /services/history), lignes à
 * plat : une pause porte `serviceParentUuid`, un service ses `pauses` (D12).
 * Le service ajoute lui-même +1 jour à `endDate` (jour de fin inclus).
 */
export function useServiceHistoryQuery(params: ServiceSearchParams) {
  return useQuery({
    queryKey: pointageKeys.history(params),
    queryFn: () => receive(userServicesService.getServiceHistory(params)),
    select: toHistoryPage,
  })
}
