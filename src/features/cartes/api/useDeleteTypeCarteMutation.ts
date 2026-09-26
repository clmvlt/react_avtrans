import { useMutation, useQueryClient } from '@tanstack/react-query'
import { typeCartesService } from '@/services'
import { cartesKeys, typeCartesKeys } from './queryKeys'

/** Suppression d'un type de carte (DELETE /type-cartes/{uuid}), puis rechargement de la liste. */
export function useDeleteTypeCarteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => typeCartesService.deleteTypeCarte(uuid),
    onSuccess: (_response, uuid) => {
      queryClient.removeQueries({ queryKey: typeCartesKeys.detail(uuid) })
      void queryClient.invalidateQueries({ queryKey: cartesKeys.all })
      void queryClient.invalidateQueries({ queryKey: typeCartesKeys.list() })
    },
  })
}
