import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { VehiculeRelaiUpdateRequest } from '@/models'
import { vehiculeRelaisService } from '@/services'
import { vehiclesKeys } from './queryKeys'

type SaveRelaiVariables = {
  /** Relais modifié ; absent = déclaration. */
  relaiId?: string
  /** Relais complet (la modification remplace tous les champs). */
  relai: VehiculeRelaiUpdateRequest
}

/**
 * Déclaration (POST /vehicules-relais) ou modification (PUT /vehicules-relais/{id}) d'un relais
 * (D9). L'API rattache les relevés km de la période au relais : la fiche, la liste des véhicules
 * et l'historique km sont rafraîchis.
 */
export function useSaveRelaiMutation(vehiculeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ relaiId, relai }: SaveRelaiVariables) =>
      relaiId
        ? vehiculeRelaisService.update(relaiId, relai)
        : vehiculeRelaisService.create({ ...relai, vehiculeId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehiclesKeys.all }),
  })
}
