import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acomptesService, type AcompteValidationRequest } from '@/services'
import { acompteKeys } from './queryKeys'

type ValidateAcompteVariables = {
  uuid: string
} & AcompteValidationRequest

/** [ADMIN] Approbation ou refus d'un acompte (POST /acomptes/admin/{uuid}/validate). */
export function useValidateAcompteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, ...data }: ValidateAcompteVariables) =>
      acomptesService.validateAcompte(uuid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: acompteKeys.all }),
  })
}
