import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acomptesService } from '@/services'
import { acompteKeys } from './queryKeys'

/** [ADMIN] Suppression définitive d'un acompte (DELETE /acomptes/admin/{uuid}). */
export function useDeleteAcompteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => acomptesService.deleteAcompte(uuid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: acompteKeys.all }),
  })
}
