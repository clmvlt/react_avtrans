import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cartesService } from '@/services'
import { cartesKeys } from './queryKeys'

/** Suppression d'une carte (DELETE /cartes/{uuid}), puis rechargement de la liste. */
export function useDeleteCarteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => cartesService.deleteCarte(uuid),
    onSuccess: (_response, uuid) => {
      queryClient.removeQueries({ queryKey: cartesKeys.detail(uuid) })
      void queryClient.invalidateQueries({ queryKey: cartesKeys.list() })
    },
  })
}
