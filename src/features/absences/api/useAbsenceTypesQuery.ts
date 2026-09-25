import { useQuery } from '@tanstack/react-query'
import { absenceTypesService, type AbsenceTypeListResponse } from '@/services'
import { absenceTypeKeys } from './queryKeys'

const toTypes = (response: AbsenceTypeListResponse) => response.types ?? []

/** Types d'absence (GET /absence-types). Partagé par Absences, Mes absences et Planning. */
export function useAbsenceTypesQuery() {
  return useQuery({
    queryKey: absenceTypeKeys.list(),
    queryFn: () => absenceTypesService.getAbsenceTypes(),
    select: toTypes,
    staleTime: 5 * 60_000,
  })
}
