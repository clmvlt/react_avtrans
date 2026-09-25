import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesService, type VehiculeResponse, type VehiculeUpdateRequest } from '@/services'
import { vehiclesKeys } from './queryKeys'

/**
 * Modification d'un véhicule (PUT /vehicules/{id}, remplacement complet côté serveur).
 * Le véhicule renvoyé remplace celui du cache du détail, comme le Vue ; la liste est rafraîchie.
 */
export function useUpdateVehicleMutation(vehiculeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: VehiculeUpdateRequest) =>
      vehiclesService.updateVehicle(vehiculeId, payload),
    onSuccess: (response) => {
      if (response.vehicule) {
        queryClient.setQueryData<VehiculeResponse>(vehiclesKeys.detail(vehiculeId), response)
      }
      return queryClient.invalidateQueries({ queryKey: vehiclesKeys.list() })
    },
  })
}
