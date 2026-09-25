import { useQuery } from '@tanstack/react-query'
import type { ServiceDTO } from '@/models'
import { userServicesService } from '@/services'
import { pointageKeys } from './queryKeys'

const toServices = (response: ServiceDTO[] | null) => (Array.isArray(response) ? response : [])

/** Services et pauses du jour de l'utilisateur connecté (GET /services/user/daily, tableau nu). */
export function useDailyServicesQuery() {
  return useQuery({
    queryKey: pointageKeys.daily(),
    queryFn: () => userServicesService.getDailyServices(),
    select: toServices,
  })
}
