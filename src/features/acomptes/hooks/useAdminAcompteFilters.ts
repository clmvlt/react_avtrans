import { useState } from 'react'
import { useSearchParams } from 'react-router'
import type { FilterValues } from '@/components/shared/SearchFilters'
import { EMPTY_ADMIN_ACOMPTE_FILTERS, toAdminAcompteParams } from '../lib/acompteFilters'

/**
 * Filtres et pagination de la page admin des acomptes (même mécanique que `Acomptes.vue`) :
 * `filters` suit la saisie (et le texte d'aide), `params` est figé à chaque chargement.
 * Seule lecture de l'URL : `?userUuid=` (lien du Suivi des présences), appliqué à l'arrivée puis
 * à chaque nouvelle valeur non vide. Rien n'est écrit dans l'URL (Q-URL).
 */
export function useAdminAcompteFilters() {
  const [searchParams] = useSearchParams()
  const urlUserUuid = searchParams.get('userUuid') ?? ''

  const [filters, setFilters] = useState<FilterValues>(() => ({
    ...EMPTY_ADMIN_ACOMPTE_FILTERS,
    userUuid: urlUserUuid,
  }))
  const [params, setParams] = useState(() =>
    toAdminAcompteParams({ ...EMPTY_ADMIN_ACOMPTE_FILTERS, userUuid: urlUserUuid }, 0),
  )

  // `?userUuid=` modifié sans quitter la page : filtre employé repris et recherche relancée
  const [appliedUrlUserUuid, setAppliedUrlUserUuid] = useState(urlUserUuid)
  if (urlUserUuid !== appliedUrlUserUuid) {
    setAppliedUrlUserUuid(urlUserUuid)
    if (urlUserUuid) {
      const next = { ...filters, userUuid: urlUserUuid }
      setFilters(next)
      setParams(toAdminAcompteParams(next, 0))
    }
  }

  /** Charge la page `page` avec les filtres tels qu'ils sont saisis (`loadAcomptes(page)`). */
  const loadPage = (page: number) => setParams(toAdminAcompteParams(filters, page))

  const reset = () => {
    setFilters(EMPTY_ADMIN_ACOMPTE_FILTERS)
    setParams(toAdminAcompteParams(EMPTY_ADMIN_ACOMPTE_FILTERS, 0))
  }

  return { filters, setFilters, params, loadPage, apply: () => loadPage(0), reset }
}
