import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { LastSignatureSummaryDTO, SignatureCreateRequest } from '@/models'
import { signaturesService } from '@/services'
import { signaturesKeys } from './queryKeys'

/**
 * Enregistre la signature des heures (POST /signatures). En cas de succès, le résumé en cache
 * passe à `needsToSign: false` (le rappel se ferme, comme `markSigned` du Vue) et les listes
 * admin sont rechargées.
 */
export function useCreateSignatureMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SignatureCreateRequest) => signaturesService.createSignature(data),
    onSuccess: () => {
      queryClient.setQueryData<LastSignatureSummaryDTO>(signaturesKeys.summary(), (summary) =>
        summary ? { ...summary, needsToSign: false } : summary,
      )
      void queryClient.invalidateQueries({ queryKey: signaturesKeys.allUsers() })
      void queryClient.invalidateQueries({ queryKey: signaturesKeys.users() })
    },
  })
}
