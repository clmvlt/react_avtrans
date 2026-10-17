import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { receive, type Received } from '@/lib/liveCounter'
import type { ServiceDTO } from '@/models'
import { userServicesService } from '@/services'
import type { PagedResponse } from '@/types'
import { toServicesSearchBody, type AdminServiceFilters } from '../lib/serviceFilters'
import { adminServicesKeys } from './queryKeys'

/** Page reçue et instant de sa réception (durée d'un pointage en cours en direct). */
export type UserServicesPage = PagedResponse<ServiceDTO> & { receivedAt: number }

const toPage = ({ data, receivedAt }: Received<PagedResponse<ServiceDTO>>): UserServicesPage => ({
  ...data,
  receivedAt,
})

/**
 * Une page (20) des pointages d'un employé, du plus récent au plus ancien, lignes à plat : une
 * pause porte `serviceParentUuid`, un service ses `pauses` (D12).
 */
export function useUserServicesQuery(userUuid: string, filters: AdminServiceFilters, page: number) {
  return useQuery({
    queryKey: adminServicesKeys.userServicesPage(userUuid, filters, page),
    queryFn: () =>
      receive(userServicesService.searchServices(userUuid, toServicesSearchBody(filters, page))),
    select: toPage,
    placeholderData: keepPreviousData,
    enabled: !!userUuid,
  })
}
