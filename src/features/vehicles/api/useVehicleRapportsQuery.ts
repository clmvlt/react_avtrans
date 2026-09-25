import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { rapportsService, type RapportsListResponse } from '@/services'
import { vehiclesKeys } from './queryKeys'

/** Taille de page des rapports (VehiculeDetail.vue : `rapportsSize`). */
export const RAPPORTS_PAGE_SIZE = 10

/** `page` et `totalPages` valent `null` quand tout est demandé (size = -1). */
const toRapportsPage = (response: RapportsListResponse) => ({
  rapports: response.data ?? [],
  page: response.page ?? 0,
  totalPages: response.totalPages ?? 0,
  totalElements: response.totalElements ?? 0,
})

type UseVehicleRapportsQueryParams = {
  vehiculeId: string
  page: number
  /** Tous les rapports (« Voir tout ») : size = -1, sans pagination. */
  showAll: boolean
}

/** Rapports d'un véhicule, photos incluses (GET /rapports/{vehiculeId}), en lecture seule. */
export function useVehicleRapportsQuery({
  vehiculeId,
  page,
  showAll,
}: UseVehicleRapportsQueryParams) {
  const size = showAll ? -1 : RAPPORTS_PAGE_SIZE
  const requestedPage = showAll ? 0 : page
  return useQuery({
    queryKey: vehiclesKeys.rapportsPage(vehiculeId, requestedPage, size),
    queryFn: () => rapportsService.getRapports(vehiculeId, requestedPage, size),
    select: toRapportsPage,
    placeholderData: keepPreviousData,
  })
}
