import { useState } from 'react'
import { useSearchParams } from 'react-router'
import type { FilterValues } from '@/components/shared/SearchFilters'
import { EMPTY_ADMIN_ABSENCE_FILTERS, toAdminAbsenceParams } from '../lib/absenceFilters'

/**
 * Filtres et pagination de la page admin des absences (même mécanique que `Absences.vue`) :
 * - `filters` : valeurs du panneau SearchFilters, modifiées en direct (le texte d'aide les suit) ;
 * - `params` : corps de la recherche envoyé à l'API, figé à chaque chargement (Rechercher,
 *   Réinitialiser, changement de page, rechargement après une action), à partir de `filters`.
 *
 * Seule lecture de l'URL : `?userUuid=` (liens depuis Utilisateurs, Suivi des présences, Planning),
 * appliqué à l'arrivée puis chaque fois qu'il change pour une valeur non vide, comme le `watch` du
 * Vue. Rien n'est écrit dans l'URL (décision Q-URL).
 */
export function useAdminAbsenceFilters() {
  const [searchParams] = useSearchParams()
  const urlUserUuid = searchParams.get('userUuid') ?? ''

  const [filters, setFilters] = useState<FilterValues>(() => ({
    ...EMPTY_ADMIN_ABSENCE_FILTERS,
    userUuid: urlUserUuid,
  }))
  const [params, setParams] = useState(() =>
    toAdminAbsenceParams({ ...EMPTY_ADMIN_ABSENCE_FILTERS, userUuid: urlUserUuid }, 0),
  )

  // `?userUuid=` modifié sans quitter la page : filtre employé repris et recherche relancée
  const [appliedUrlUserUuid, setAppliedUrlUserUuid] = useState(urlUserUuid)
  if (urlUserUuid !== appliedUrlUserUuid) {
    setAppliedUrlUserUuid(urlUserUuid)
    if (urlUserUuid) {
      const next = { ...filters, userUuid: urlUserUuid }
      setFilters(next)
      setParams(toAdminAbsenceParams(next, 0))
    }
  }

  /** Charge la page `page` avec les filtres tels qu'ils sont saisis (`loadAbsences(page)`). */
  const loadPage = (page: number) => setParams(toAdminAbsenceParams(filters, page))

  const reset = () => {
    setFilters(EMPTY_ADMIN_ABSENCE_FILTERS)
    setParams(toAdminAbsenceParams(EMPTY_ADMIN_ABSENCE_FILTERS, 0))
  }

  return { filters, setFilters, params, loadPage, apply: () => loadPage(0), reset }
}
