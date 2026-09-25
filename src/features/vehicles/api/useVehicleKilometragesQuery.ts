import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { vehiclesService, type KilometragesListResponse } from '@/services'
import { vehiclesKeys } from './queryKeys'

/** Taille de page de l'historique km (VehiculeDetail.vue : `kmSize`). */
export const KM_PAGE_SIZE = 10

/** `page` et `totalPages` valent `null` quand tout l'historique est demandé (size = -1). */
const toKilometragesPage = (response: KilometragesListResponse) => ({
  kilometrages: response.kilometrages ?? [],
  page: response.page ?? 0,
  totalPages: response.totalPages ?? 0,
  totalElements: response.totalElements ?? 0,
})

type UseVehicleKilometragesQueryParams = {
  vehiculeId: string
  page: number
  /** Tout l'historique (« Voir tout ») : size = -1, sans pagination. */
  showAll: boolean
}

/** Historique des relevés kilométriques d'un véhicule (GET /vehicules/{id}/kilometrages). */
export function useVehicleKilometragesQuery({
  vehiculeId,
  page,
  showAll,
}: UseVehicleKilometragesQueryParams) {
  const size = showAll ? -1 : KM_PAGE_SIZE
  const requestedPage = showAll ? 0 : page
  return useQuery({
    queryKey: vehiclesKeys.kilometragesPage(vehiculeId, requestedPage, size),
    queryFn: () => vehiclesService.getKilometrageHistory(vehiculeId, requestedPage, size),
    select: toKilometragesPage,
    placeholderData: keepPreviousData,
  })
}
