import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { vehiclesService, type AdjustInfosListResponse } from '@/services'
import { vehiclesKeys } from './queryKeys'

/** Taille de page des commentaires (VehiculeDetail.vue : `adjustInfosSize`). */
export const ADJUST_INFOS_PAGE_SIZE = 10

const toAdjustInfosPage = (response: AdjustInfosListResponse) => ({
  adjustInfos: response.adjustInfos ?? [],
  page: response.page ?? 0,
  totalPages: response.totalPages ?? 0,
  totalElements: response.totalElements ?? 0,
})

/** Commentaires (« adjust infos ») d'un véhicule, paginés (GET /vehicules/{id}/adjust-infos). */
export function useVehicleAdjustInfosQuery(vehiculeId: string, page: number) {
  return useQuery({
    queryKey: vehiclesKeys.adjustInfosPage(vehiculeId, page, ADJUST_INFOS_PAGE_SIZE),
    queryFn: () => vehiclesService.getAdjustInfo(vehiculeId, page, ADJUST_INFOS_PAGE_SIZE),
    select: toAdjustInfosPage,
    placeholderData: keepPreviousData,
  })
}
