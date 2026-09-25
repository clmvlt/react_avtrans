import { useQuery } from '@tanstack/react-query'
import type { ServiceDTO } from '@/models'
import { userServicesService } from '@/services'
import { pointageKeys } from './queryKeys'

type ActiveServiceResponse = { success: boolean; service: ServiceDTO | null }

const toActiveService = (response: ActiveServiceResponse | null) => response?.service || null

/** Service (ou pause) en cours de l'utilisateur connecté (GET /services/active), `null` sinon. */
export function useActiveServiceQuery() {
  return useQuery({
    queryKey: pointageKeys.active(),
    queryFn: () => userServicesService.getCurrentService(),
    select: toActiveService,
  })
}
