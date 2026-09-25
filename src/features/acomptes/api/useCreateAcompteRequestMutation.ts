import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acomptesService, type AcompteCreateRequest } from '@/services'
import { acompteKeys } from './queryKeys'

/** Demande d'acompte de l'utilisateur connecté (POST /acomptes). */
export function useCreateAcompteRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AcompteCreateRequest) => acomptesService.createAcompteRequest(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: acompteKeys.all }),
  })
}
