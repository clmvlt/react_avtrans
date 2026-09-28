import { useQuery } from '@tanstack/react-query'
import { vehiculeRelaisService, type VehiculeRelaiListResponse } from '@/services'
import { vehiclesKeys } from './queryKeys'

const toRelais = (response: VehiculeRelaiListResponse) => response.relais ?? []

/** Historique des relais d'un véhicule, du plus récent au plus ancien (D9). */
export function useVehicleRelaisQuery(vehiculeId: string) {
  return useQuery({
    queryKey: vehiclesKeys.relais(vehiculeId),
    queryFn: () => vehiculeRelaisService.getByVehicule(vehiculeId),
    select: toRelais,
  })
}
