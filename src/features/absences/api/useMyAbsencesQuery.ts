import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { absencesService, type AbsenceSearchParams } from '@/services'
import { absenceKeys } from './queryKeys'

/**
 * Mes demandes d'absence (POST /absences/my). Sans dates, le serveur ne renvoie que la fenêtre
 * [aujourd'hui − 30 j ; + 10 ans] (limite de l'API, MIGRATION.md 8.3).
 */
export function useMyAbsencesQuery(params: AbsenceSearchParams) {
  return useQuery({
    queryKey: absenceKeys.myList(params),
    queryFn: () => absencesService.getAbsences(params),
    placeholderData: keepPreviousData,
  })
}
