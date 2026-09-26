import { useState } from 'react'
import {
  EMPTY_SERVICE_FILTERS,
  hasActiveServiceFilters,
  type AdminServiceFilters,
} from '../lib/serviceFilters'

type ServicesRequest = {
  filters: AdminServiceFilters
  page: number
}

/**
 * Filtres et page des pointages d'un employé (état local, pas dans l'URL : Q-URL).
 *
 * Comme useUserServices.ts, les champs du panneau (`draft`) ne sont lus qu'au chargement :
 * « Appliquer », changement de page, « Réessayer » et rechargement après une action repartent
 * des valeurs saisies à ce moment-là, appliquées ou non.
 */
export function useServiceFilters() {
  const [showFilters, setShowFilters] = useState(false)
  const [draft, setDraft] = useState<AdminServiceFilters>(EMPTY_SERVICE_FILTERS)
  const [request, setRequest] = useState<ServicesRequest>({
    filters: EMPTY_SERVICE_FILTERS,
    page: 0,
  })

  /** Charge la page demandée avec les filtres saisis (loadServices du Vue). */
  const load = (page = 0) => setRequest({ filters: draft, page })

  return {
    showFilters,
    toggleFilters: () => setShowFilters((visible) => !visible),
    draft,
    setDraft,
    hasActiveFilters: hasActiveServiceFilters(draft),
    /** Filtres et page de la requête en cours */
    request,
    load,
    /** Filtres vidés, première page */
    reset: () => {
      setDraft(EMPTY_SERVICE_FILTERS)
      setRequest({ filters: EMPTY_SERVICE_FILTERS, page: 0 })
    },
  }
}
