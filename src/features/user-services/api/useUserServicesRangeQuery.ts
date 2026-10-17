import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { liveQueryOptions, receive, type Received } from '@/lib/liveCounter'
import type { ServiceDTO } from '@/models'
import { userServicesService } from '@/services'
import type { PagedResponse } from '@/types'
import { adminServicesKeys } from './queryKeys'

/** Assez pour plusieurs semaines de services et de pauses (l'API n'a pas de plafond de taille). */
const RANGE_PAGE_SIZE = 500

export type UserServicesRange = {
  /** Services et pauses à plat, du plus ancien au plus récent */
  lines: ServiceDTO[]
  /** Réception de la réponse : base des durées en direct */
  receivedAt: number
}

const toRange = ({ data, receivedAt }: Received<PagedResponse<ServiceDTO>>): UserServicesRange => ({
  lines: data.content ?? [],
  receivedAt,
})

/**
 * Tous les pointages d'un employé débutés entre `startDate` et `endDate` (`YYYY-MM-DD` inclus),
 * en une seule page (POST /services/admin/user/{uuid}) : journée et calendrier de la fiche
 * employé. Sous la clé des pointages de l'employé, donc rechargé après chaque action.
 */
export function useUserServicesRangeQuery(userUuid: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: adminServicesKeys.range(userUuid, startDate, endDate),
    queryFn: () =>
      receive(
        userServicesService.searchServices(userUuid, {
          page: 0,
          size: RANGE_PAGE_SIZE,
          sortBy: 'debut',
          sortDirection: 'asc',
          startDate: `${startDate}T00:00:00`,
          endDate: `${endDate}T23:59:59`,
        }),
      ),
    select: toRange,
    placeholderData: keepPreviousData,
    enabled: !!userUuid && !!startDate && !!endDate,
    ...liveQueryOptions,
  })
}
