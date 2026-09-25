import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { couchettesService, type CouchetteSearchParams } from '@/services'
import { couchettesKeys } from './queryKeys'

const LOAD_ERROR_MESSAGE = 'Erreur lors du chargement des couchettes'

/** Message d'erreur de chargement (celui de l'API, sinon le texte du Vue). */
export function getCouchettesLoadErrorMessage(error: unknown): string {
  return (error instanceof Error && error.message) || LOAD_ERROR_MESSAGE
}

/**
 * [ADMIN] Recherche paginée des couchettes (POST /couchettes/admin/search). La page précédente
 * reste affichée pendant le chargement de la suivante. Comme le Vue, un échec affiche aussi un
 * toast « Erreur » (`id` fixe pour ne pas l'empiler si la requête est retentée).
 */
export function useAdminCouchettesQuery(params: CouchetteSearchParams) {
  return useQuery({
    queryKey: couchettesKeys.admin(params),
    queryFn: async () => {
      try {
        return await couchettesService.getAllCouchettes(params)
      } catch (error) {
        toast.error('Erreur', {
          id: 'couchettes-load-error',
          description: getCouchettesLoadErrorMessage(error),
          duration: 7000,
        })
        throw error
      }
    },
    placeholderData: keepPreviousData,
  })
}
