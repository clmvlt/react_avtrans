import { useMutation, useQueryClient } from '@tanstack/react-query'
import { couchettesService } from '@/services'
import { couchettesKeys } from './queryKeys'

/** [ADMIN] Supprime n'importe quelle couchette (DELETE /couchettes/admin/{uuid}). */
export function useDeleteCouchetteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => couchettesService.deleteCouchette(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: couchettesKeys.all })
    },
  })
}
