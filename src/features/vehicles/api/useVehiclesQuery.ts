import { useQuery } from '@tanstack/react-query'
import { vehiclesService, type VehiculesListResponse } from '@/services'
import { vehiclesKeys } from './queryKeys'

const toVehicles = (response: VehiculesListResponse) => response.vehicules ?? []

type UseVehiclesQueryOptions = {
  enabled?: boolean
}

/** Liste du parc (GET /vehicules). Partagée par Véhicules, Pointage et Entretiens. */
export function useVehiclesQuery({ enabled = true }: UseVehiclesQueryOptions = {}) {
  return useQuery({
    queryKey: vehiclesKeys.list(),
    queryFn: () => vehiclesService.getVehicles(),
    select: toVehicles,
    enabled,
  })
}
