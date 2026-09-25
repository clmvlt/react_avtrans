import { useQuery } from '@tanstack/react-query'
import { vehiclesService, type VehiculeResponse } from '@/services'
import { vehiclesKeys } from './queryKeys'

const toVehicle = (response: VehiculeResponse) => response.vehicule ?? null

/** Détail d'un véhicule (GET /vehicules/{id}). Partagé par VehiculeDetail et EntretiensVehicule. */
export function useVehicleQuery(id: string | undefined) {
  return useQuery({
    queryKey: vehiclesKeys.detail(id ?? ''),
    queryFn: () => vehiclesService.getVehicleById(id!),
    select: toVehicle,
    enabled: !!id,
  })
}
