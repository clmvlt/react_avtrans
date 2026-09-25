import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiculeEquipementsService } from '@/services'
import { vehiclesKeys } from './queryKeys'

/** Suppression d'un équipement (DELETE /vehicules-equipements/{id}). */
export function useDeleteEquipementMutation(vehiculeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (equipementId: string) => vehiculeEquipementsService.delete(equipementId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vehiclesKeys.equipements(vehiculeId) }),
  })
}
