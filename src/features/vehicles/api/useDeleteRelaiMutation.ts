import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiculeRelaisService } from '@/services'
import { vehiclesKeys } from './queryKeys'

/**
 * Suppression d'un relais (DELETE /vehicules-relais/{id}, D9) : ses relevés km redeviennent ceux
 * du véhicule, d'où le rafraîchissement de tout le domaine.
 */
export function useDeleteRelaiMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (relaiId: string) => vehiculeRelaisService.delete(relaiId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehiclesKeys.all }),
  })
}
