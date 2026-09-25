import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acomptesService } from '@/services'
import { acompteKeys } from './queryKeys'

/**
 * Annulation d'une demande en attente par son auteur (DELETE /acomptes/{uuid}) : c'est une
 * suppression (le statut `CANCELLED` n'existe pas côté API, 8.3).
 */
export function useCancelAcompteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => acomptesService.cancelAcompte(uuid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: acompteKeys.all }),
  })
}
