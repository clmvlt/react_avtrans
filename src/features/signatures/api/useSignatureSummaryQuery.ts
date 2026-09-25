import { useQuery } from '@tanstack/react-query'
import { signaturesService } from '@/services'
import {
  selectIsActive,
  selectIsAuthenticated,
  selectIsEmailVerified,
  useAuthStore,
} from '@/stores/auth-store'
import { signaturesKeys } from './queryKeys'

/**
 * Résumé de la dernière signature de l'utilisateur connecté (GET /signatures/last/summary) :
 * `needsToSign` et `heuresLastMonth` décident du rappel de signature.
 *
 * Comme `checkSignature` du Vue : interrogé une seule fois par session (jamais périmé, jamais
 * retenté), seulement pour un compte connecté, actif et à l'e-mail vérifié. Une erreur n'affiche
 * rien (on ne bloque jamais l'accès à l'app). Le cache est vidé à la déconnexion.
 */
export function useSignatureSummaryQuery() {
  const canSign = useAuthStore(
    (s) => selectIsAuthenticated(s) && selectIsActive(s) && selectIsEmailVerified(s),
  )

  return useQuery({
    queryKey: signaturesKeys.summary(),
    queryFn: () => signaturesService.getLastSignatureSummary(),
    enabled: canSign,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  })
}
