import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesService } from '@/services'
import { vehiclesKeys } from './queryKeys'

type CreateAdjustInfoVariables = {
  comment: string
  /** Photos en data-URL ; absentes si aucune. */
  picturesB64?: string[]
}

/** Ajout d'un commentaire sur un véhicule (POST /vehicules/adjust-infos), photos en base64. */
export function useCreateAdjustInfoMutation(vehiculeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ comment, picturesB64 }: CreateAdjustInfoVariables) =>
      vehiclesService.createAdjustInfo({ vehiculeId, comment, picturesB64 }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vehiclesKeys.adjustInfos(vehiculeId) }),
  })
}
