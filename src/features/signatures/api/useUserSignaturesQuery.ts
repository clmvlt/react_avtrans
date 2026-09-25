import { useQuery } from '@tanstack/react-query'
import { signaturesService } from '@/services'
import { toUserSignatures } from '../lib/signatureResponses'
import { signaturesKeys } from './queryKeys'

type UseUserSignaturesQueryOptions = {
  enabled?: boolean
}

/** [ADMIN] Historique des signatures d'un utilisateur (GET /signatures/user/{uuid}). */
export function useUserSignaturesQuery(
  userUuid: string | undefined,
  { enabled = true }: UseUserSignaturesQueryOptions = {},
) {
  return useQuery({
    queryKey: signaturesKeys.user(userUuid ?? ''),
    queryFn: () => signaturesService.getUserSignatures(userUuid ?? ''),
    select: toUserSignatures,
    enabled: enabled && !!userUuid,
  })
}
