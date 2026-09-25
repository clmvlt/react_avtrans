import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acomptesService, type AdminAcompteNewRequest } from '@/services'
import { acompteKeys } from './queryKeys'

/** [ADMIN] Création d'un acompte pour un employé (POST /acomptes/admin/new). */
export function useCreateAcompteForUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AdminAcompteNewRequest) => acomptesService.createAcompteForUser(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: acompteKeys.all }),
  })
}
