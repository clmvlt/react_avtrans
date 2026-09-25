import { useMutation, useQueryClient } from '@tanstack/react-query'
import { signaturesService } from '@/services'
import { signaturesKeys } from './queryKeys'

/** [ADMIN] Suppression d'une signature (DELETE /signatures/{uuid}) ; recharge les listes admin. */
export function useDeleteSignatureMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (signatureUuid: string) => signaturesService.deleteSignature(signatureUuid),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: signaturesKeys.allUsers() }),
        queryClient.invalidateQueries({ queryKey: signaturesKeys.users() }),
      ]),
  })
}
