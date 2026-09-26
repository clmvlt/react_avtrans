import { useQuery } from '@tanstack/react-query'
import { vehiculesTypesEntretienService } from '@/services'
import type { VehiculeTypeEntretienDTO } from '@/models'
import type { ApiResponse } from '@/types'
import { maintenanceKeys } from './queryKeys'

const toConfigs = (response: ApiResponse<VehiculeTypeEntretienDTO[]>) =>
  response.vehiculeTypesEntretien ?? response.data ?? []

/** Configurations d'entretien d'un véhicule (GET /vehicules-types-entretien/vehicule/{id}). */
export function useVehiculeConfigsQuery(vehiculeId: string) {
  return useQuery({
    queryKey: maintenanceKeys.vehicleConfigs(vehiculeId),
    queryFn: () => vehiculesTypesEntretienService.getByVehiculeId(vehiculeId),
    select: toConfigs,
    enabled: !!vehiculeId,
  })
}
