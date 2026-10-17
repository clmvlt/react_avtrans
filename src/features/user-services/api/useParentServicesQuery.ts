import { useQuery } from '@tanstack/react-query'
import type { ServiceDTO } from '@/models'
import { userServicesService } from '@/services'
import type { PagedResponse } from '@/types'
import { parentCandidatesSearch } from '../lib/serviceForm'
import { adminServicesKeys } from './queryKeys'

const toServices = (response: PagedResponse<ServiceDTO>) =>
  (response.content ?? []).filter((service) => !service.isBreak)

/**
 * Services de travail d'un employé débutés le jour `date` (`YYYY-MM-DD`) ou la veille : choix du
 * service d'une pause dans le formulaire (POST /services/admin/user/{uuid}, `isBreak = false`).
 */
export function useParentServicesQuery(userUuid: string, date: string, enabled: boolean) {
  return useQuery({
    queryKey: adminServicesKeys.parentCandidates(userUuid, date),
    queryFn: () => userServicesService.searchServices(userUuid, parentCandidatesSearch(date)),
    select: toServices,
    enabled: enabled && !!userUuid && !!date,
  })
}
