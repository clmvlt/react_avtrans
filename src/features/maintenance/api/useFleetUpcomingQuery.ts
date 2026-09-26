import { useQuery } from '@tanstack/react-query'
import { entretiensService, type VehiculesProchainEntretiensResponse } from '@/services'
import { maintenanceKeys } from './queryKeys'

const toUpcoming = (response: VehiculesProchainEntretiensResponse) => response.data ?? []

/** Prochains entretiens de toute la flotte (GET /entretiens/vehicules-prochains-entretiens). */
export function useFleetUpcomingQuery() {
  return useQuery({
    queryKey: maintenanceKeys.fleetUpcoming(),
    queryFn: () => entretiensService.getEntretiensAVenir(),
    select: toUpcoming,
  })
}
