import { useMutation, useQueryClient } from '@tanstack/react-query'
import { couchettesService } from '@/services'
import { couchettesKeys } from './queryKeys'

/**
 * Déclare ma couchette du jour (POST /couchettes, sans date : aujourd'hui côté serveur).
 * La mutation reste « en cours » jusqu'au rechargement de la liste, comme le Vue (`await
 * loadCouchettes`) : le bouton ne redevient pas cliquable sur une liste périmée.
 */
export function useCreateMyCouchetteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => couchettesService.createCouchette(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: couchettesKeys.all }),
  })
}
