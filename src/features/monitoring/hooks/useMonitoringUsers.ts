import { useState } from 'react'
import { useUsersWithStatusQuery } from '../api/useUsersWithStatusQuery'

const LOAD_ERROR_MESSAGE = 'Erreur lors du chargement des services'

/**
 * Données du suivi des présences.
 *
 * Bug B-16 reproduit : si le premier chargement (celui qui suit l'arrivée sur la page) échoue,
 * l'erreur reste affichée même quand les rafraîchissements suivants réussissent ; les compteurs de
 * l'en-tête, eux, se mettent à jour. Un échec d'un rafraîchissement ultérieur est ignoré.
 * La page se remonte au clic sur « Réessayer » pour rejouer ce premier chargement.
 */
export function useMonitoringUsers() {
  const query = useUsersWithStatusQuery()
  const [initialLoad, setInitialLoad] = useState<{ done: boolean; error: string | null }>({
    done: false,
    error: null,
  })

  // Fin du premier chargement : état ajusté pendant le rendu (pas d'effet)
  if (!initialLoad.done && query.isFetchedAfterMount && !query.isFetching) {
    setInitialLoad({
      done: true,
      error: query.isError ? query.error.message || LOAD_ERROR_MESSAGE : null,
    })
  }

  return {
    users: query.data ?? [],
    /** Premier chargement sans données à afficher */
    isLoading: query.isPending || (!initialLoad.done && !query.data),
    /** Erreur du premier chargement, jamais effacée (B-16) */
    error: initialLoad.error,
  }
}
