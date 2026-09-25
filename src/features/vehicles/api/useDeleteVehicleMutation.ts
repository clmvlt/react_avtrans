import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesService } from '@/services'
import { vehiclesKeys } from './queryKeys'

/** Suppression d'un véhicule (DELETE /vehicules/{id}) : son détail sort du cache, la liste est rafraîchie. */
export function useDeleteVehicleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vehiculeId: string) => vehiclesService.deleteVehicle(vehiculeId),
    onSuccess: (_response, vehiculeId) => {
      queryClient.removeQueries({ queryKey: vehiclesKeys.detail(vehiculeId) })
      return queryClient.invalidateQueries({ queryKey: vehiclesKeys.list() })
    },
  })
}
