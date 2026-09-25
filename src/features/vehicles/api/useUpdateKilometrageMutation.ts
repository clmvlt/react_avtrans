import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesService } from '@/services'
import { vehiclesKeys } from './queryKeys'

type UpdateKilometrageVariables = {
  kilometrageId: string
  km: number
  /** Date du relevé (ISO) ; absente = inchangée. */
  createdAt?: string
}

/**
 * [ADMIN] Modification d'un relevé kilométrique (PUT /vehicules/admin/kilometrages/{id}).
 * Mêmes invalidations que l'ajout : le dernier km du véhicule et de la liste peut changer.
 */
export function useUpdateKilometrageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ kilometrageId, km, createdAt }: UpdateKilometrageVariables) =>
      vehiclesService.updateKilometrageAdmin(kilometrageId, { km, createdAt }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehiclesKeys.all }),
  })
}
