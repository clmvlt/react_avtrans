import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesService } from '@/services'
import { vehiclesKeys } from './queryKeys'

/** Suppression d'un fichier de véhicule (DELETE /vehicules/files/{fileId}). */
export function useDeleteVehicleFileMutation(vehiculeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (fileId: string) => vehiclesService.deleteFile(fileId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehiclesKeys.files(vehiculeId) }),
  })
}
