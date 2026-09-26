import { useMutation, useQueryClient } from '@tanstack/react-query'
import { entretiensService, type EntretienFileUploadRequest } from '@/services'
import { maintenanceKeys } from './queryKeys'

type AddEntretienFileVariables = {
  entretienId: string
  file: EntretienFileUploadRequest
}

/**
 * POST /entretiens/{id}/files (dialog des fichiers). Comme le Vue, seule la liste des fichiers
 * est rechargée : le nombre de fichiers affiché dans l'historique n'est mis à jour qu'au prochain
 * chargement de celui-ci.
 */
export function useAddEntretienFileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ entretienId, file }: AddEntretienFileVariables) =>
      entretiensService.addFile(entretienId, file),
    onSuccess: (_response, { entretienId }) =>
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.files(entretienId) }),
  })
}

type DeleteEntretienFileVariables = {
  fileId: string
  entretienId: string
  /** Recharger aussi l'historique (dialog des fichiers d'EntretiensVehicule). */
  refreshHistory?: boolean
}

/** DELETE /entretiens/files/{fileId}. */
export function useDeleteEntretienFileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ fileId }: DeleteEntretienFileVariables) => entretiensService.deleteFile(fileId),
    onSuccess: (_response, { entretienId, refreshHistory }) => {
      void queryClient.invalidateQueries({ queryKey: maintenanceKeys.files(entretienId) })
      if (refreshHistory) {
        void queryClient.invalidateQueries({ queryKey: maintenanceKeys.histories() })
      }
    },
  })
}
