import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appVersionsService } from '@/services'
import { appVersionKeys } from './queryKeys'

/** Supprime une version (DELETE /app-versions/{id}). */
export function useDeleteAppVersionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: appVersionKeys.delete(),
    mutationFn: (id: string) => appVersionsService.deleteVersion(id),
    // Le dialog reste « en cours » jusqu'à l'arrivée de la liste à jour
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: appVersionKeys.admin() }),
        queryClient.invalidateQueries({ queryKey: appVersionKeys.active() }),
      ]),
  })
}
