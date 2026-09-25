import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { signaturesService } from '@/services'
import { toUsersWithLastSignature } from '../lib/signatureResponses'
import { signaturesKeys } from './queryKeys'

const LOAD_ERROR_MESSAGE = 'Erreur lors du chargement des signatures'

/** Message d'erreur de chargement de la liste (celui de l'API, sinon le texte du Vue). */
export function getSignaturesLoadErrorMessage(error: unknown): string {
  return (error instanceof Error && error.message) || LOAD_ERROR_MESSAGE
}

/**
 * [ADMIN] Utilisateurs avec leur dernière signature (GET /signatures/all-users).
 * Utilisateurs masqués non filtrés, comme le Vue. Un échec de chargement affiche aussi un toast
 * « Erreur » (Vue : toast + bloc) ; `id` fixe pour ne pas l'empiler si la requête est retentée.
 */
export function useAllUsersSignaturesQuery() {
  return useQuery({
    queryKey: signaturesKeys.allUsers(),
    queryFn: async () => {
      try {
        return await signaturesService.getAllSignatures()
      } catch (error) {
        toast.error('Erreur', {
          id: 'signatures-load-error',
          description: getSignaturesLoadErrorMessage(error),
          duration: 7000,
        })
        throw error
      }
    },
    select: toUsersWithLastSignature,
  })
}
