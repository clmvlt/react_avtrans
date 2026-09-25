import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  absencesService,
  type AbsencePlanningResponse,
  type PlanningQueryParams,
  type PlanningUserDTO,
} from '@/services/absences'
import { planningKeys } from './queryKeys'

export type PlanningData = {
  users: PlanningUserDTO[]
  startDate: string
  endDate: string
  periodType: string
}

const EMPTY_PLANNING: PlanningData = { users: [], startDate: '', endDate: '', periodType: '' }

/** `success: false` : aucune donnée (le Vue ne mettait alors rien à jour). */
function toPlanning(response: AbsencePlanningResponse): PlanningData {
  if (!response?.success) return EMPTY_PLANNING
  return {
    users: response.users ?? [],
    startDate: response.startDate ?? '',
    endDate: response.endDate ?? '',
    periodType: response.periodType ?? '',
  }
}

/**
 * Planning des absences d'une période (GET /absences/admin/planning). La période précédente reste
 * affichée pendant le chargement de la suivante.
 */
export function usePlanningQuery(params: PlanningQueryParams) {
  return useQuery({
    queryKey: planningKeys.detail(params),
    queryFn: () => absencesService.getAbsencePlanning(params),
    select: toPlanning,
    placeholderData: keepPreviousData,
  })
}
