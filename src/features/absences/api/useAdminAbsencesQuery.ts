import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { absencesService, type AbsenceSearchParams } from '@/services'
import { absenceKeys } from './queryKeys'

/**
 * Recherche admin des absences (POST /absences/admin/search), paginée côté serveur.
 * La page précédente reste affichée pendant le chargement de la suivante (le Vue gardait la
 * liste et passait seulement le bouton « Rechercher » en « Recherche... »).
 */
export function useAdminAbsencesQuery(params: AbsenceSearchParams) {
  return useQuery({
    queryKey: absenceKeys.adminList(params),
    queryFn: () => absencesService.searchAbsences(params),
    placeholderData: keepPreviousData,
  })
}
