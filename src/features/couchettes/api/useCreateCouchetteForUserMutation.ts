import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AdminCouchetteCreateRequest } from '@/models'
import { couchettesService } from '@/services'
import { couchettesKeys } from './queryKeys'

/**
 * [ADMIN] Crée une couchette pour un employé (POST /couchettes/admin). La forme exacte de la
 * réponse est inconnue (le Vue lisait `response.data` sans l'utiliser) : elle est ignorée.
 */
export function useCreateCouchetteForUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AdminCouchetteCreateRequest) =>
      couchettesService.createCouchetteForUser(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: couchettesKeys.all })
    },
  })
}
