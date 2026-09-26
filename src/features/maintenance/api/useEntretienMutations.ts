import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import {
  entretiensService,
  type EntretienCreateRequest,
  type EntretienFileUploadRequest,
  type EntretienUpdateRequest,
} from '@/services'
import { vehiclesKeys } from '@/features/vehicles/api/queryKeys'
import { maintenanceKeys } from './queryKeys'

/**
 * Après une création, une modification ou une suppression : historique (et fichiers), prochains
 * entretiens et détail du véhicule (EntretiensVehicule rechargeait tout, dont le véhicule).
 * Pas d'`await` : le dialog se ferme sans attendre le rechargement, comme le Vue.
 */
function invalidateAfterEntretienChange(queryClient: QueryClient, vehiculeId?: string) {
  void queryClient.invalidateQueries({ queryKey: maintenanceKeys.entretiens() })
  void queryClient.invalidateQueries({ queryKey: maintenanceKeys.upcoming() })
  if (vehiculeId) void queryClient.invalidateQueries({ queryKey: vehiclesKeys.detail(vehiculeId) })
}

/** POST /entretiens (formulaire et « Valider » d'EntretiensVehicule). */
export function useCreateEntretienMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: EntretienCreateRequest) => entretiensService.createEntretien(data),
    onSuccess: (_response, data) => invalidateAfterEntretienChange(queryClient, data.vehiculeId),
  })
}

type UpdateEntretienVariables = {
  id: string
  data: EntretienUpdateRequest
  /** Nouveaux fichiers (EntretiensVehicule) : envoyés un par un après la modification. */
  files?: EntretienFileUploadRequest[]
  vehiculeId?: string
}

/**
 * PUT /entretiens/{id}, puis POST /entretiens/{id}/files pour chaque nouveau fichier, en série
 * comme le Vue. Un échec d'envoi de fichier fait échouer la mutation alors que l'entretien est
 * déjà modifié (comportement du Vue) : l'historique est rechargé dans tous les cas.
 */
export function useUpdateEntretienMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data, files = [] }: UpdateEntretienVariables) => {
      const response = await entretiensService.updateEntretien(id, data)
      for (const file of files) {
        await entretiensService.addFile(id, file)
      }
      return response
    },
    onSettled: (_response, _error, { vehiculeId }) =>
      invalidateAfterEntretienChange(queryClient, vehiculeId),
  })
}

type DeleteEntretienVariables = {
  id: string
  vehiculeId?: string
}

/** DELETE /entretiens/{id}. */
export function useDeleteEntretienMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: DeleteEntretienVariables) => entretiensService.deleteEntretien(id),
    onSuccess: (_response, { vehiculeId }) =>
      invalidateAfterEntretienChange(queryClient, vehiculeId),
  })
}
