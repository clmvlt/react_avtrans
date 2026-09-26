import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { userServicesService, type HoursQueryParams, type WorkedHoursDTO } from '@/services'
import type { ApiResponse } from '@/types'
import { adminServicesKeys } from './queryKeys'

/** La réponse est enveloppée (`data`) ou nue selon les versions de l'API, comme le prévoyait le Vue. */
function toWorkedHours(response: ApiResponse<WorkedHoursDTO> | WorkedHoursDTO): WorkedHoursDTO {
  const envelope = response as ApiResponse<WorkedHoursDTO>
  return (envelope.data ? envelope.data : response) as WorkedHoursDTO
}

type UseUserWorkedHoursQueryOptions = {
  /** Garde les chiffres de la période précédente pendant le chargement (dialog des heures). */
  keepPrevious?: boolean
}

/**
 * Heures travaillées d'un employé, en heures décimales (jour, semaine, mois, année, mois dernier ;
 * ou une seule période selon `params`). Partagé par le dialog « Heures travaillées » et les
 * cartes de stats des pointages d'un employé (même clé pour `params = {}`).
 */
export function useUserWorkedHoursQuery(
  userUuid: string | undefined,
  params: HoursQueryParams,
  { keepPrevious = false }: UseUserWorkedHoursQueryOptions = {},
) {
  return useQuery({
    queryKey: adminServicesKeys.hours(userUuid ?? '', params),
    queryFn: () => userServicesService.getUserWorkedHours(userUuid ?? '', params),
    select: toWorkedHours,
    enabled: !!userUuid,
    placeholderData: keepPrevious ? keepPreviousData : undefined,
  })
}
