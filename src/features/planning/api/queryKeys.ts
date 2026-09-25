import { absenceKeys } from '@/features/absences/api/queryKeys'
import type { PlanningQueryParams } from '@/services/absences'

/**
 * Clés du planning des absences, sous la racine `['absences']` : la validation d'une absence
 * (useValidateAbsenceMutation, qui invalide `absenceKeys.all`) rafraîchit donc le planning.
 */
export const planningKeys = {
  all: [...absenceKeys.all, 'planning'] as const,
  detail: (params: PlanningQueryParams) => [...planningKeys.all, params] as const,
}
