import { useQuery } from '@tanstack/react-query'
import { entretiensService, type VehiculeProchainEntretienResponse } from '@/services'
import { maintenanceKeys } from './queryKeys'

const toUpcoming = (response: VehiculeProchainEntretienResponse) => response.data ?? null

/**
 * Prochains entretiens d'un véhicule (GET /entretiens/vehicule/{id}/prochains-entretiens).
 * Comme le Vue, une erreur n'est pas affichée : la page traite `data` absent comme « aucune alerte ».
 */
export function useVehicleUpcomingQuery(vehiculeId: string) {
  return useQuery({
    queryKey: maintenanceKeys.vehicleUpcoming(vehiculeId),
    queryFn: () => entretiensService.getVehicleUpcomingMaintenance(vehiculeId),
    select: toUpcoming,
    enabled: !!vehiculeId,
  })
}
