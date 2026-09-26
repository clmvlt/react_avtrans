import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { userServicesService } from '@/services'
import { toServicesSearchBody, type AdminServiceFilters } from '../lib/serviceFilters'
import { adminServicesKeys } from './queryKeys'

/** Une page (20) des pointages d'un employé, du plus récent au plus ancien. */
export function useUserServicesQuery(userUuid: string, filters: AdminServiceFilters, page: number) {
  return useQuery({
    queryKey: adminServicesKeys.userServicesPage(userUuid, filters, page),
    queryFn: () =>
      userServicesService.searchServices(userUuid, toServicesSearchBody(filters, page)),
    placeholderData: keepPreviousData,
    enabled: !!userUuid,
  })
}
