import { useQuery } from '@tanstack/react-query'
import { liveQueryOptions, receive, type Received } from '@/lib/liveCounter'
import type { ServiceDTO } from '@/models'
import { userServicesService } from '@/services'
import { pointageKeys } from './queryKeys'

const toServices = ({ data, receivedAt }: Received<ServiceDTO[] | null>) => ({
  data: Array.isArray(data) ? data : [],
  receivedAt,
})

/**
 * Services de travail débutés aujourd'hui par l'utilisateur connecté, avec leurs pauses imbriquées
 * (GET /services/user/daily, tableau nu ; plus aucune pause au premier niveau depuis D12).
 */
export function useDailyServicesQuery() {
  return useQuery({
    queryKey: pointageKeys.daily(),
    queryFn: () => receive(userServicesService.getDailyServices()),
    select: toServices,
    ...liveQueryOptions,
  })
}
