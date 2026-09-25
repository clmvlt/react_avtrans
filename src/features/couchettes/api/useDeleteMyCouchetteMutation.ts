import { useMutation, useQueryClient } from '@tanstack/react-query'
import { couchettesService } from '@/services'
import { couchettesKeys } from './queryKeys'

/**
 * Supprime une de mes couchettes (DELETE /couchettes/{uuid} : elle doit être datée d'aujourd'hui).
 * En cours jusqu'au rechargement de la liste, comme le Vue.
 */
export function useDeleteMyCouchetteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => couchettesService.deleteMyCouchette(uuid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: couchettesKeys.all }),
  })
}
